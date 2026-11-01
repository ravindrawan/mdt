<?php
// Warnings must never be printed into the JSON output (shared hosts often have display_errors on)
ini_set('display_errors', '0');
require __DIR__ . '/security.php';

$action = $_GET['action'] ?? '';
// Background polling must not keep an unattended login alive
mdtu_session_start(!in_array($action, ['ping', 'get_chat', 'get_notifications'], true));
mdtu_security_headers();
header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store');

const UPLOADS_HTACCESS = <<<'HTACCESS'
# Uploaded files are data only: scripts in this folder must never run
<FilesMatch "\.(php|php\d|phtml|phar|pl|py|cgi|sh)$">
    <IfModule mod_authz_core.c>
        Require all denied
    </IfModule>
    <IfModule !mod_authz_core.c>
        Order allow,deny
        Deny from all
    </IfModule>
</FilesMatch>
<IfModule mod_php.c>
    php_flag engine off
</IfModule>
<IfModule mod_php7.c>
    php_flag engine off
</IfModule>

HTACCESS;

function respond($data, $code = 200)
{
    global $mdtuSubmitFp;
    if ($code < 400 && !empty($mdtuSubmitFp)) {
        if (!isset($_SESSION['submit_fp']) || !is_array($_SESSION['submit_fp'])) {
            $_SESSION['submit_fp'] = [];
        }
        $_SESSION['submit_fp'][$mdtuSubmitFp] = time();
    }
    http_response_code($code);
    echo json_encode($data, JSON_UNESCAPED_UNICODE);
    exit;
}

function fail($message, $code = 400)
{
    respond(['status' => 'error', 'message' => $message], $code);
}

// Technical details are shown only on the server computer itself; visitors get a reference number
set_exception_handler(function ($e) {
    $ref = strtoupper(bin2hex(random_bytes(3)));
    error_log("MDTU API [$ref]: " . $e->getMessage() . ' in ' . $e->getFile() . ':' . $e->getLine());
    fail(mdtu_is_local_request() ? 'Server error: ' . $e->getMessage() : "Server error. Please try again or tell the system administrator (ref $ref).", 500);
});

try {
    require __DIR__ . '/db.php';
} catch (Throwable $e) {
    error_log('MDTU DB: ' . $e->getMessage());
    fail('Cannot connect to the database. Check that MySQL is running and that the database name, user and password in config.php are correct.'
        . (mdtu_is_local_request() ? ' (' . $e->getMessage() . ')' : ''), 503);
}
require __DIR__ . '/backup.php';

// Anything that changes data must be a POST sent by this website's own script (blocks cross-site request forgery)
const READ_ACTIONS = ['ping', 'bootstrap', 'get_data', 'records_by_nic', 'lookup_officer', 'get_progress', 'get_plans',
    'get_notifications', 'get_chat', 'export_all', 'get_audit', 'verify_audit', 'list_backups', 'download_backup',
    'download_progress_pdf', 'cert_register'];
if (!in_array($action, READ_ACTIONS, true)) {
    if (($_SERVER['REQUEST_METHOD'] ?? 'GET') !== 'POST') {
        fail('This action must be sent as POST.', 405);
    }
    if (($_SERVER['HTTP_X_MDTU_REQUEST'] ?? '') !== '1') {
        fail('Request blocked for security reasons. Reload the page and try again.', 403);
    }
}

$postLimit = ini_bytes(ini_get('post_max_size'));
if ($postLimit > 0 && (int) ($_SERVER['CONTENT_LENGTH'] ?? 0) > $postLimit) {
    fail('The file is too large for this server. Please choose a smaller file (max ' . upload_limit_mb() . ' MB).', 413);
}
$raw = file_get_contents('php://input');
$in = json_decode($raw, true);
if (!is_array($in)) {
    $in = [];
}

// A second click of the same form, while the first save is still running or has just finished,
// must not insert the same row again. The session lock holds the second request until the first ends.
$mdtuSubmitFp = null;
if (!in_array($action, READ_ACTIONS, true)) {
    $fpSource = $in;
    array_walk_recursive($fpSource, function (&$value) {
        if (is_string($value) && strlen($value) > 400) {
            $value = 'len:' . strlen($value) . ':' . hash('sha256', $value);
        }
    });
    $mdtuSubmitFp = hash('sha256', $action . "\n" . json_encode($fpSource, JSON_UNESCAPED_UNICODE));
    $now = time();
    $recent = (isset($_SESSION['submit_fp']) && is_array($_SESSION['submit_fp'])) ? $_SESSION['submit_fp'] : [];
    foreach ($recent as $key => $at) {
        if ($now - (int) $at > 20) {
            unset($recent[$key]);
        }
    }
    $_SESSION['submit_fp'] = $recent;
    if (isset($recent[$mdtuSubmitFp])) {
        fail('This was already submitted. Please wait — clicking again saves the same data twice.', 409);
    }
}

const ROLES = ['super', 'admin', 'superuser'];
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

// ---------- helpers ----------

function current_user()
{
    return $_SESSION['user'] ?? null;
}

function current_role()
{
    $u = current_user();
    return $u ? $u['role'] : 'none';
}

function current_name()
{
    $u = current_user();
    return $u ? $u['username'] : 'Guest User';
}

function is_admin()
{
    return in_array(current_role(), ['admin', 'super'], true);
}

function must_change_password()
{
    return !empty($_SESSION['mustChangePassword']);
}

function require_login()
{
    if (!current_user()) {
        fail(!empty($_SESSION['sessionExpired']) ? 'Your session expired after 30 minutes without activity. Please log in again.' : 'Please log in to continue.', 401);
    }
    if (must_change_password()) {
        fail('Please change your password before continuing.', 403);
    }
}

function audit($action, $entity = null, $entityId = null, $details = null, $username = null)
{
    global $pdo;
    mdtu_audit($pdo, $action, $entity, $entityId, $details, $username);
}

function fetch_row($table, $id)
{
    global $pdo;
    $st = $pdo->prepare("SELECT * FROM `$table` WHERE id = ?");
    $st->execute([$id]);
    return $st->fetch() ?: null;
}

function require_role(array $roles)
{
    require_login();
    if (!in_array(current_role(), $roles, true)) {
        fail('You do not have permission for this action.', 403);
    }
}

function str_in(array $src, $key, $max = 255, $required = false, $label = null)
{
    $v = isset($src[$key]) && !is_array($src[$key]) ? trim((string) $src[$key]) : '';
    if ($required && $v === '') {
        fail(($label ?: $key) . ' is required.');
    }
    return mb_substr($v, 0, $max);
}

function int_in(array $src, $key, $default = 0)
{
    return isset($src[$key]) && is_numeric($src[$key]) ? (int) $src[$key] : $default;
}

function rating_in(array $src, $key)
{
    $r = int_in($src, $key, 5);
    return max(1, min(5, $r));
}

function officer_gender(PDO $pdo, $nic, array $src)
{
    $st = $pdo->prepare("SELECT gender FROM officers WHERE nic = ?");
    $st->execute([$nic]);
    $saved = (string) ($st->fetchColumn() ?: '');
    if ($saved === 'Female' || $saved === 'Male') {
        return $saved;
    }
    $chosen = str_in($src, 'gender', 10, true, 'Gender');
    if ($chosen !== 'Female' && $chosen !== 'Male') {
        fail('Select Female or Male.');
    }
    return $chosen;
}

function officer_phone(array $src)
{
    $raw = str_in($src, 'phone', 20, true, 'Officer phone number');
    $digits = preg_replace('/\D+/', '', $raw);
    if (strlen($digits) < 9 || strlen($digits) > 15) {
        fail('Enter a valid officer phone number, for example 0771234567.');
    }
    return $digits;
}

function require_nic(array $src, $key, $label = 'NIC / Officer ID')
{
    $nic = normalize_nic(str_in($src, $key, 20, true, $label));
    if (!preg_match('/^[0-9A-Z]{5,20}$/', $nic)) {
        fail("$label is not valid. Use the 12-digit NIC or the old 9-digit + V/X format.");
    }
    return $nic;
}

function valid_date($d)
{
    $dt = DateTime::createFromFormat('Y-m-d', (string) $d);
    return $dt && $dt->format('Y-m-d') === $d;
}

function program_end_date(array $program)
{
    $dates = $program['dates'] ?? [];
    if (is_string($dates)) {
        $decoded = json_decode($dates, true);
        $dates = is_array($decoded) ? $decoded : [];
    }
    $clean = [];
    foreach ((array) $dates as $d) {
        $d = trim((string) $d);
        if (valid_date($d)) {
            $clean[] = $d;
        }
    }
    sort($clean);
    if ($clean) {
        return $clean[count($clean) - 1];
    }
    $first = trim((string) ($program['firstDate'] ?? ''));
    return valid_date($first) ? $first : '';
}

function program_open_for_record(array $program)
{
    $end = program_end_date($program);
    if ($end === '') {
        return false;
    }
    $today = date('Y-m-d');
    $last = (new DateTime($end))->modify('+7 days')->format('Y-m-d');
    return $today >= $end && $today <= $last;
}

function parse_dates($value)
{
    $list = is_array($value) ? $value : explode(',', (string) $value);
    $dates = [];
    foreach ($list as $d) {
        $d = trim((string) $d);
        if ($d === '') {
            continue;
        }
        if (!valid_date($d)) {
            fail("Invalid date \"$d\". Use the format YYYY-MM-DD.");
        }
        $dates[$d] = true;
    }
    $dates = array_keys($dates);
    sort($dates);
    return $dates;
}

function clean_list($value, $max = 255)
{
    $out = [];
    foreach ((array) $value as $v) {
        $v = mb_substr(trim((string) $v), 0, $max);
        if ($v !== '') {
            $out[] = $v;
        }
    }
    return $out;
}

/** Same person even if written as "Mr. M. A. Wickramanayake" or "m a wickramanayake". */
function mdtu_person_key($name)
{
    $s = mb_strtolower(trim((string) $name));
    $s = str_replace('.', ' ', $s);
    $s = preg_replace('/\b(mr|mrs|ms|miss|dr|prof|rev|sir)\b/u', ' ', $s);
    $s = preg_replace('/[^\p{L}\p{N}]+/u', ' ', $s);
    $s = preg_replace('/\s+/u', ' ', trim($s));
    return $s;
}

function mdtu_rp_name($entry)
{
    if (is_string($entry)) {
        return trim($entry);
    }
    if (is_array($entry)) {
        return trim((string) ($entry['name'] ?? ''));
    }
    return '';
}

function mdtu_normalize_resource_entry($entry)
{
    if (is_string($entry)) {
        $name = trim($entry);
        return $name === '' ? null : ['name' => $name, 'nic' => '', 'field' => ''];
    }
    if (!is_array($entry)) {
        return null;
    }
    $name = mb_substr(trim((string) ($entry['name'] ?? '')), 0, 255);
    if ($name === '') {
        return null;
    }
    $nic = normalize_nic($entry['nic'] ?? '');
    return [
        'name' => $name,
        'nic' => $nic,
        'field' => mb_substr(trim((string) ($entry['field'] ?? '')), 0, 255),
    ];
}

function mdtu_normalize_coordinator_entry($entry, $defaultDesignation = 'Training Coordinating Officer')
{
    if (!is_array($entry)) {
        return null;
    }
    $nic = normalize_nic($entry['nic'] ?? '');
    $name = mb_substr(trim((string) ($entry['name'] ?? '')), 0, 255);
    if ($nic === '' || $name === '') {
        return null;
    }
    return [
        'nic' => $nic,
        'name' => $name,
        'designation' => mb_substr(trim((string) ($entry['designation'] ?? $defaultDesignation)), 0, 255) ?: $defaultDesignation,
        'office' => mb_substr(trim((string) ($entry['office'] ?? '')), 0, 255),
    ];
}

function mdtu_known_resource_names(PDO $pdo)
{
    $names = [];
    foreach ($pdo->query("SELECT name FROM resource_persons")->fetchAll(PDO::FETCH_COLUMN) as $name) {
        $names[] = $name;
    }
    foreach ($pdo->query("SELECT resourcePersons FROM programs")->fetchAll(PDO::FETCH_COLUMN) as $json) {
        foreach (json_decode((string) $json, true) ?: [] as $entry) {
            $name = mdtu_rp_name($entry);
            if ($name !== '') {
                $names[] = $name;
            }
        }
    }
    return $names;
}

function mdtu_rename_resource_person(PDO $pdo, $from, $to)
{
    $from = trim((string) $from);
    $to = mb_substr(trim((string) $to), 0, 255);
    if ($from === '' || $to === '' || $from === $to) {
        return;
    }
    if (mdtu_person_key($from) !== mdtu_person_key($to)) {
        return;
    }
    $pdo->prepare("UPDATE resource_persons SET name = ? WHERE name = ?")->execute([$to, $from]);
    $upd = $pdo->prepare("UPDATE programs SET resourcePersons = ? WHERE id = ?");
    foreach ($pdo->query("SELECT id, resourcePersons FROM programs")->fetchAll() as $row) {
        $list = json_decode((string) $row['resourcePersons'], true) ?: [];
        $changed = false;
        $next = [];
        $seen = [];
        foreach ($list as $entry) {
            $item = mdtu_normalize_resource_entry($entry);
            if (!$item) {
                continue;
            }
            if (mdtu_person_key($item['name']) === mdtu_person_key($from)) {
                $item['name'] = $to;
                $changed = true;
            }
            $key = mdtu_person_key($item['name']);
            if ($key === '' || isset($seen[$key])) {
                continue;
            }
            $seen[$key] = true;
            $next[] = $item;
        }
        if ($changed) {
            $upd->execute([json_encode(array_values($next), JSON_UNESCAPED_UNICODE), $row['id']]);
        }
    }
}

function mdtu_canonicalize_names(PDO $pdo, array $incoming)
{
    $map = [];
    foreach (mdtu_known_resource_names($pdo) as $name) {
        $key = mdtu_person_key($name);
        if ($key !== '' && !isset($map[$key])) {
            $map[$key] = $name;
        }
    }
    $out = [];
    $seen = [];
    foreach ($incoming as $name) {
        $name = trim((string) $name);
        $key = mdtu_person_key($name);
        if ($key === '' || isset($seen[$key])) {
            continue;
        }
        $seen[$key] = true;
        if (!isset($map[$key])) {
            $map[$key] = $name;
        }
        $out[] = $map[$key];
    }
    return $out;
}

function program_cert_flags(PDO $pdo, $programId)
{
    $st = $pdo->prepare("SELECT issueCompletion, issueAttendance FROM programs WHERE id = ?");
    $st->execute([(int) $programId]);
    $row = $st->fetch() ?: [];
    return [
        'issueCompletion' => (int) ($row['issueCompletion'] ?? 0) === 1 ? 1 : 0,
        'issueAttendance' => (int) ($row['issueAttendance'] ?? 0) === 1 ? 1 : 0,
    ];
}

function mdtu_ensure_resource_persons(PDO $pdo, array $entries)
{
    $byKey = [];
    foreach ($pdo->query("SELECT id, name, nic, field FROM resource_persons")->fetchAll() as $row) {
        $key = mdtu_person_key($row['name']);
        if ($key !== '') {
            $byKey[$key] = $row;
        }
    }
    $ins = $pdo->prepare("INSERT INTO resource_persons (name, nic, field, institution, contact, email) VALUES (?, ?, ?, '', '', '')");
    $upd = $pdo->prepare("UPDATE resource_persons SET nic = IF(? <> '', ?, nic), field = IF(? <> '', ?, field) WHERE id = ?");
    foreach ($entries as $entry) {
        $item = mdtu_normalize_resource_entry($entry);
        if (!$item) {
            continue;
        }
        $key = mdtu_person_key($item['name']);
        if ($key === '') {
            continue;
        }
        if (!isset($byKey[$key])) {
            $ins->execute([$item['name'], $item['nic'] ?: null, $item['field']]);
            $byKey[$key] = ['id' => (int) $pdo->lastInsertId(), 'name' => $item['name']];
            continue;
        }
        $upd->execute([$item['nic'], $item['nic'], $item['field'], $item['field'], (int) $byKey[$key]['id']]);
    }
}

function mdtu_sync_staff_certs(PDO $pdo, $programId, array $coordinators, array $lecturers, $issueAttendance, array $assistants = [], array $kksHelpers = [])
{
    $programId = (int) $programId;
    $year = (int) date('Y');
    $st = $pdo->prepare('SELECT firstDate FROM programs WHERE id = ?');
    $st->execute([$programId]);
    $first = (string) $st->fetchColumn();
    if ($first !== '') {
        $year = (int) substr($first, 0, 4);
    }
    $wanted = [];
    foreach ($coordinators as $c) {
        $item = mdtu_normalize_coordinator_entry($c);
        if (!$item) {
            continue;
        }
        $post = mdtu_staff_posting_from_db(
            $pdo,
            $item['nic'],
            'coordinator',
            $item['name'],
            $item['designation'] ?: 'Training Coordinating Officer',
            $item['office']
        );
        $wanted['coordinator|' . $item['nic']] = [
            'role' => 'coordinator',
            'nic' => $item['nic'],
            'name' => $post['name'] ?: $item['name'],
            'designation' => $post['designation'],
            'office' => $post['office'],
            'field' => '',
        ];
    }
    foreach ($assistants as $c) {
        $item = mdtu_normalize_coordinator_entry($c, 'Assistant Coordinating Officer');
        if (!$item) {
            continue;
        }
        $post = mdtu_staff_posting_from_db(
            $pdo,
            $item['nic'],
            'assistant',
            $item['name'],
            $item['designation'] ?: 'Assistant Coordinating Officer',
            $item['office']
        );
        $wanted['assistant|' . $item['nic']] = [
            'role' => 'assistant',
            'nic' => $item['nic'],
            'name' => $post['name'] ?: $item['name'],
            'designation' => $post['designation'],
            'office' => $post['office'],
            'field' => '',
        ];
    }
    foreach ($kksHelpers as $c) {
        $item = mdtu_normalize_coordinator_entry($c, 'කම්කරු (KKS)');
        if (!$item) {
            continue;
        }
        $post = mdtu_staff_posting_from_db(
            $pdo,
            $item['nic'],
            'kks',
            $item['name'],
            $item['designation'] ?: 'කම්කරු (KKS)',
            $item['office']
        );
        $wanted['kks|' . $item['nic']] = [
            'role' => 'kks',
            'nic' => $item['nic'],
            'name' => $post['name'] ?: $item['name'],
            'designation' => $post['designation'],
            'office' => $post['office'],
            'field' => '',
        ];
    }
    foreach ($lecturers as $l) {
        $item = mdtu_normalize_resource_entry($l);
        if (!$item || $item['nic'] === '') {
            continue;
        }
        $post = mdtu_staff_posting_from_db($pdo, $item['nic'], 'lecturer', $item['name'], 'Lecturer', '');
        $wanted['lecturer|' . $item['nic']] = [
            'role' => 'lecturer',
            'nic' => $item['nic'],
            'name' => $post['name'] ?: $item['name'],
            'designation' => $post['designation'],
            'office' => $post['office'],
            'field' => $item['field'],
        ];
    }
    $existing = [];
    $st = $pdo->prepare('SELECT * FROM staff_certs WHERE programId = ?');
    $st->execute([$programId]);
    foreach ($st->fetchAll() as $row) {
        $existing[$row['role'] . '|' . $row['nic']] = $row;
    }
    $upd = $pdo->prepare('UPDATE staff_certs SET name = ?, designation = ?, office = ?, field = ?, showAttendance = ? WHERE id = ?');
    $ins = $pdo->prepare('INSERT INTO staff_certs (programId, role, nic, name, designation, office, field, certSerial, showAttendance) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)');
    $keepIds = [];
    foreach ($wanted as $key => $item) {
        if (isset($existing[$key])) {
            $id = (int) $existing[$key]['id'];
            $upd->execute([$item['name'], $item['designation'], $item['office'], $item['field'], $issueAttendance ? 1 : 0, $id]);
            $keepIds[] = $id;
            continue;
        }
        $ins->execute([$programId, $item['role'], $item['nic'], $item['name'], $item['designation'], $item['office'], $item['field'], 'PENDING', $issueAttendance ? 1 : 0]);
        $id = (int) $pdo->lastInsertId();
        $serial = mdtu_staff_cert_serial($year, $id);
        $pdo->prepare('UPDATE staff_certs SET certSerial = ? WHERE id = ?')->execute([$serial, $id]);
        $keepIds[] = $id;
    }
    if ($keepIds) {
        $in = implode(',', array_map('intval', $keepIds));
        $pdo->exec("DELETE FROM staff_certs WHERE programId = $programId AND id NOT IN ($in)");
    } else {
        $pdo->prepare('DELETE FROM staff_certs WHERE programId = ?')->execute([$programId]);
    }
}

function load_staff_certs(PDO $pdo, $nic = null)
{
    if ($nic) {
        $vals = nic_lookup_values($nic);
        if (!$vals) {
            return [];
        }
        $ph = implode(',', array_fill(0, count($vals), '?'));
        $st = $pdo->prepare("SELECT s.*, p.name AS trainingName, p.venue, p.dates AS programDatesJson, p.fileNo AS programFileNo,
            p.hours, p.firstDate AS date, p.issueAttendance AS programIssueAttendance
            FROM staff_certs s INNER JOIN programs p ON p.id = s.programId WHERE s.nic IN ($ph) ORDER BY p.firstDate DESC, s.id DESC");
        $st->execute($vals);
        $rows = $st->fetchAll();
    } else {
        $rows = $pdo->query("SELECT s.*, p.name AS trainingName, p.venue, p.dates AS programDatesJson, p.fileNo AS programFileNo,
            p.hours, p.firstDate AS date, p.issueAttendance AS programIssueAttendance
            FROM staff_certs s INNER JOIN programs p ON p.id = s.programId ORDER BY p.firstDate DESC, s.id DESC")->fetchAll();
    }
    foreach ($rows as &$r) {
        $r['id'] = (int) $r['id'];
        $r['programId'] = (int) $r['programId'];
        $r['hours'] = (int) $r['hours'];
        $r['kind'] = 'staff';
        $r['confirmed'] = true;
        $r['showAttendance'] = (int) $r['showAttendance'] === 1 && (int) ($r['programIssueAttendance'] ?? 0) === 1;
        $r['programDates'] = json_decode((string) ($r['programDatesJson'] ?? ''), true) ?: [$r['date']];
        $r['absentDates'] = '';
        // Always prefer permanent designation/office from the officers master list on the certificate.
        $post = mdtu_staff_posting_from_db(
            $pdo,
            $r['nic'],
            (string) $r['role'],
            (string) ($r['name'] ?? ''),
            (string) ($r['designation'] ?? ''),
            (string) ($r['office'] ?? '')
        );
        if ($post['name'] !== '') {
            $r['name'] = $post['name'];
        }
        $r['designation'] = $post['designation'];
        $r['office'] = $post['office'] !== '' ? $post['office'] : '-';
        unset($r['programDatesJson'], $r['programIssueAttendance']);
    }
    unset($r);
    return $rows;
}

/** Hours actually attended: each recorded absent day removes one 6-hour day. */
function effective_hours($hours, $absentDates)
{
    $absent = array_filter(array_map('trim', explode(',', (string) $absentDates)));
    return max(0, (int) $hours - 6 * count($absent));
}

/** Saves a base64 data URL to uploads/ and returns the relative path. */
function save_upload($dataUrl, array $allowed, $maxBytes = 5242880)
{
    if (!preg_match('/^data:([\w\/+.-]+);base64,(.+)$/s', (string) $dataUrl, $m)) {
        fail('Uploaded file could not be read.');
    }
    $mime = strtolower($m[1]);
    if (!isset($allowed[$mime])) {
        fail('This file type is not allowed.');
    }
    $bytes = base64_decode($m[2], true);
    if ($bytes === false || $bytes === '') {
        fail('Uploaded file is empty or damaged.');
    }
    if (strlen($bytes) > $maxBytes) {
        fail('File is too large. Maximum size is ' . round($maxBytes / 1048576) . ' MB.');
    }
    $magic = ['application/pdf' => '%PDF', 'image/png' => "\x89PNG", 'image/jpeg' => "\xFF\xD8\xFF"];
    if (isset($magic[$mime]) && strncmp($bytes, $magic[$mime], strlen($magic[$mime])) !== 0) {
        fail('File content does not match its type.');
    }

    $dir = __DIR__ . '/uploads';
    if (!is_dir($dir) && !mkdir($dir, 0755, true)) {
        fail('Cannot create the uploads folder. Check folder permissions.', 500);
    }
    if (!file_exists("$dir/.htaccess")) {
        file_put_contents("$dir/.htaccess", UPLOADS_HTACCESS);
    }
    if (!file_exists("$dir/index.html")) {
        file_put_contents("$dir/index.html", '');
    }
    $name = date('Ymd_His') . '_' . bin2hex(random_bytes(6)) . '.' . $allowed[$mime];
    if (file_put_contents("$dir/$name", $bytes) === false) {
        fail('Could not save the uploaded file.', 500);
    }
    return 'uploads/' . $name;
}

function decode_json_fields(array $rows, array $fields)
{
    foreach ($rows as &$row) {
        foreach ($fields as $f) {
            $decoded = isset($row[$f]) && $row[$f] !== '' ? json_decode($row[$f], true) : null;
            $row[$f] = is_array($decoded) ? $decoded : [];
        }
    }
    return $rows;
}

function is_duplicate(PDOException $e)
{
    return $e->getCode() === '23000' && isset($e->errorInfo[1]) && (int) $e->errorInfo[1] === 1062;
}

// ---------- data loaders ----------

const RECORD_SELECT = "SELECT r.*, p.dates AS programDates, p.fileNo AS programFileNo
    FROM training_records r LEFT JOIN programs p ON p.id = r.programId";

function load_records(PDO $pdo, $where, array $params)
{
    $st = $pdo->prepare(RECORD_SELECT . " WHERE $where ORDER BY r.date DESC, r.id DESC");
    $st->execute($params);
    $rows = decode_json_fields($st->fetchAll(), ['lecturerEvals', 'programDates']);
    foreach ($rows as &$r) {
        $r['id'] = (int) $r['id'];
        $r['year'] = (int) $r['year'];
        $r['programId'] = $r['programId'] !== null ? (int) $r['programId'] : null;
        $r['hours'] = (int) $r['hours'];
        $r['foodRating'] = (int) $r['foodRating'];
        $r['coordinationRating'] = (int) $r['coordinationRating'];
        $r['confirmed'] = (bool) $r['confirmed'];
        $r['showCompletion'] = !isset($r['showCompletion']) || (bool) $r['showCompletion'];
        $r['showAttendance'] = !isset($r['showAttendance']) || (bool) $r['showAttendance'];
        $r['effectiveHours'] = effective_hours($r['hours'], $r['absentDates']);
        if (!$r['programDates']) {
            $r['programDates'] = [$r['date']];
        }
    }
    return $rows;
}

function public_record(array $r)
{
    unset($r['feedback'], $r['lecturerEvals'], $r['foodRating'], $r['coordinationRating']);
    return $r;
}

function load_programs(PDO $pdo)
{
    $rows = $pdo->query("SELECT * FROM programs ORDER BY firstDate DESC, id DESC")->fetchAll();
    $rows = decode_json_fields($rows, ['dates', 'resourcePersons', 'coordinators', 'assistantCoordinators', 'kksHelpers']);
    foreach ($rows as &$r) {
        $r['id'] = (int) $r['id'];
        $r['hours'] = (int) $r['hours'];
        $r['issueCompletion'] = (int) ($r['issueCompletion'] ?? 0) === 1;
        $r['issueAttendance'] = (int) ($r['issueAttendance'] ?? 0) === 1;
        $rps = [];
        foreach ((array) ($r['resourcePersons'] ?? []) as $entry) {
            $item = mdtu_normalize_resource_entry($entry);
            if ($item) {
                $rps[] = $item;
            }
        }
        $r['resourcePersons'] = $rps;
        $coords = [];
        foreach ((array) ($r['coordinators'] ?? []) as $entry) {
            $item = mdtu_normalize_coordinator_entry($entry);
            if ($item) {
                $coords[] = $item;
            }
        }
        $r['coordinators'] = $coords;
        $assistants = [];
        foreach ((array) ($r['assistantCoordinators'] ?? []) as $entry) {
            $item = mdtu_normalize_coordinator_entry($entry, 'Assistant Coordinating Officer');
            if ($item) {
                $assistants[] = $item;
            }
        }
        $r['assistantCoordinators'] = array_slice($assistants, 0, 20);
        $kks = [];
        foreach ((array) ($r['kksHelpers'] ?? []) as $entry) {
            $item = mdtu_normalize_coordinator_entry($entry, 'කම්කරු (KKS)');
            if ($item) {
                $kks[] = $item;
            }
        }
        $r['kksHelpers'] = array_slice($kks, 0, 5);
    }
    return $rows;
}

function load_settings(PDO $pdo)
{
    $out = [];
    foreach ($pdo->query("SELECT k, v FROM settings WHERE k NOT IN ('schema_version', 'audit_head')")->fetchAll() as $row) {
        $out[$row['k']] = $row['v'];
    }
    return $out;
}

function load_notifications(PDO $pdo)
{
    if (is_admin()) {
        $st = $pdo->query("SELECT * FROM notifications ORDER BY id DESC LIMIT 300");
    } elseif (current_user()) {
        $st = $pdo->prepare("SELECT * FROM notifications WHERE target = 'all' OR target = ? OR sender = ? ORDER BY id DESC LIMIT 300");
        $st->execute([current_name(), current_name()]);
    } else {
        $st = $pdo->query("SELECT * FROM notifications WHERE target = 'all' ORDER BY id DESC LIMIT 300");
    }
    return $st->fetchAll();
}

function load_chat(PDO $pdo)
{
    if (current_role() === 'super') {
        $st = $pdo->query("SELECT * FROM chat_messages ORDER BY id DESC LIMIT 200");
    } elseif (current_role() === 'admin') {
        $st = $pdo->prepare("SELECT * FROM chat_messages WHERE recipient IN ('all', 'admin') OR recipient = ? OR sender = ? ORDER BY id DESC LIMIT 200");
        $st->execute([current_name(), current_name()]);
    } elseif (current_user()) {
        $st = $pdo->prepare("SELECT * FROM chat_messages WHERE recipient = 'all' OR recipient = ? OR sender = ? ORDER BY id DESC LIMIT 200");
        $st->execute([current_name(), current_name()]);
        } else {
        $st = $pdo->query("SELECT * FROM chat_messages WHERE recipient = 'all' ORDER BY id DESC LIMIT 200");
    }
    return array_reverse($st->fetchAll());
}

function load_progress(PDO $pdo, $year)
{
    $st = $pdo->prepare("SELECT * FROM progress_submissions WHERE year = ? ORDER BY submittedAt DESC, id DESC");
    $st->execute([$year]);
    return decode_json_fields($st->fetchAll(), ['otherTrainings']);
}

function load_plans(PDO $pdo, $year)
{
    $st = $pdo->prepare("SELECT * FROM training_plans WHERE year = ? ORDER BY office, id");
    $st->execute([$year]);
    return $st->fetchAll();
}

function load_staff_matrix(PDO $pdo, $year)
{
    $st = $pdo->prepare("SELECT office, counts FROM staff_matrix WHERE year = ? ORDER BY office");
    $st->execute([$year]);
    $rows = decode_json_fields($st->fetchAll(), ['counts']);
    return $rows;
}

function load_users(PDO $pdo)
{
    return $pdo->query("SELECT id, username, role, nic, officerName, designation, office, mustChangePassword, passwordChangedAt, lastLoginAt, createdAt FROM users ORDER BY role, username")->fetchAll();
}

function load_offices(PDO $pdo)
{
    $rows = $pdo->query("SELECT office FROM officers UNION SELECT office FROM staff_matrix UNION SELECT office FROM training_records")->fetchAll(PDO::FETCH_COLUMN);
    return unique_sorted(array_merge(['District Secretariat, Kurunegala'], $rows));
}

function load_designations(PDO $pdo)
{
    $rows = $pdo->query("SELECT designation FROM officers UNION SELECT designation FROM training_records")->fetchAll(PDO::FETCH_COLUMN);
    foreach ($pdo->query("SELECT counts FROM staff_matrix")->fetchAll(PDO::FETCH_COLUMN) as $json) {
        $counts = json_decode((string) $json, true);
        if (is_array($counts)) {
            $rows = array_merge($rows, array_keys($counts));
        }
    }
    return unique_sorted(array_merge(['Management Assistant', 'Development Officer', 'Executive Officer', 'Office Assistant'], $rows));
}

function unique_sorted(array $values)
{
    $out = [];
    foreach ($values as $v) {
        $v = trim((string) $v);
        if ($v !== '') {
            $out[mb_strtolower($v)] = $v;
        }
    }
    natcasesort($out);
    return array_values($out);
}

/** Largest file the server accepts in one request, allowing for base64 growth (max 10 MB). */
function upload_limit_mb()
{
    $bytes = PHP_INT_MAX;
    foreach (['post_max_size', 'memory_limit'] as $key) {
        $b = ini_bytes(ini_get($key));
        if ($b > 0) {
            $bytes = min($bytes, $b);
        }
    }
    return max(1, min(10, (int) floor($bytes / 1.4 / 1048576)));
}

function ini_bytes($value)
{
    $value = trim((string) $value);
    if ($value === '' || $value === '-1') {
        return 0;
    }
    $n = (float) $value;
    switch (strtolower(substr($value, -1))) {
        case 'g': $n *= 1024;
        // no break
        case 'm': $n *= 1024;
        // no break
        case 'k': $n *= 1024;
    }
    return (int) $n;
}

$year = int_in($_GET, 'year', (int) date('Y'));

if (current_user() && must_change_password() && !in_array($action, ['ping', 'bootstrap', 'change_password', 'logout', 'get_notifications', 'get_chat'], true)) {
    fail('Please change your password before continuing.', 403);
}

// ---------- actions ----------

switch ($action) {

    case 'ping':
        respond(['status' => 'ok', 'database' => $db]);

    case 'bootstrap':
        mdtu_auto_backup_async();
        $user = current_user();
        if ($user) {
            $user['mustChangePassword'] = must_change_password();
        }
        $data = [
            'status'        => 'ok',
            'user'          => $user,
            'sessionExpired' => !$user && !empty($_SESSION['sessionExpired']),
            'settings'      => load_settings($pdo),
            'programs'      => load_programs($pdo),
            'resourcePersons' => $pdo->query("SELECT * FROM resource_persons ORDER BY name")->fetchAll(),
            'notifications' => load_notifications($pdo),
            'chat'          => load_chat($pdo),
            'staffMatrix'   => load_staff_matrix($pdo, $year),
            'staffCerts'    => [],
            'offices'       => load_offices($pdo),
            'designations'  => load_designations($pdo),
            'officers'      => [],
            'uploadLimitMB' => upload_limit_mb(),
            'records'       => [],
            'progress'      => [],
            'plans'         => [],
            'users'         => [],
            'chatUsers'     => [],
        ];
        unset($_SESSION['sessionExpired']);
        if ($user && !must_change_password()) {
            $data['records'] = load_records($pdo, 'r.year = ?', [$year]);
            $data['progress'] = load_progress($pdo, $year);
            $data['plans'] = load_plans($pdo, $year);
            $data['chatUsers'] = $pdo->query("SELECT username, role FROM users ORDER BY username")->fetchAll();
            $data['officers'] = $pdo->query("SELECT nic, name, designation, office, phone, gender FROM officers ORDER BY name")->fetchAll();
            if (is_admin()) {
                $data['staffCerts'] = load_staff_certs($pdo);
            }
        }
        if (current_role() === 'super' && !must_change_password()) {
            $data['users'] = load_users($pdo);
        }
        respond($data);

    // ----- authentication -----

    case 'login':
        $username = str_in($in, 'username', 100, true, 'Username');
        $password = isset($in['password']) ? (string) $in['password'] : '';
        $ip = mdtu_client_ip();

        $pdo->exec("DELETE FROM login_attempts WHERE attemptedAt < NOW() - INTERVAL 1 DAY");
        $since = date('Y-m-d H:i:s', time() - MDTU_LOCK_MINUTES * 60);
        $st = $pdo->prepare("SELECT
                SUM(username = ?) AS byUser,
                SUM(ip = ?) AS byIp
            FROM login_attempts WHERE attemptedAt >= ? AND (username = ? OR ip = ?)");
        $st->execute([$username, $ip, $since, $username, $ip]);
        $counts = $st->fetch();
        if ((int) $counts['byUser'] >= MDTU_MAX_FAILS_PER_USER || (int) $counts['byIp'] >= MDTU_MAX_FAILS_PER_IP) {
            audit('login.blocked', 'user', null, ['username' => $username, 'failedUser' => (int) $counts['byUser'], 'failedIp' => (int) $counts['byIp']], $username);
            fail('Too many failed login attempts. For security this login is locked for ' . MDTU_LOCK_MINUTES . ' minutes.', 429);
        }

        $st = $pdo->prepare("SELECT * FROM users WHERE username = ?");
        $st->execute([$username]);
        $u = $st->fetch();
        $ok = false;
        if ($u) {
            $info = password_get_info($u['password']);
            if ($info['algo'] !== null && $info['algo'] !== 0) {
                $ok = password_verify($password, $u['password']);
                if ($ok && password_needs_rehash($u['password'], PASSWORD_DEFAULT)) {
                    $pdo->prepare("UPDATE users SET password = ? WHERE id = ?")->execute([password_hash($password, PASSWORD_DEFAULT), $u['id']]);
                }
            } elseif (hash_equals((string) $u['password'], $password)) {
                // Old plain-text password from the previous version: upgrade it to a hash
                $ok = true;
                $pdo->prepare("UPDATE users SET password = ? WHERE id = ?")->execute([password_hash($password, PASSWORD_DEFAULT), $u['id']]);
            }
        }
        if (!$ok) {
            $pdo->prepare("INSERT INTO login_attempts (username, ip, attemptedAt) VALUES (?, ?, NOW())")->execute([$username, $ip]);
            audit('login.failed', 'user', $u ? $u['id'] : null, ['username' => $username, 'knownUser' => (bool) $u], $username);
            usleep(400000);
            $left = MDTU_MAX_FAILS_PER_USER - (int) $counts['byUser'] - 1;
            fail('Invalid username or password.' . ($left > 0 && $left <= 2 ? " $left attempt(s) left before the login is locked." : ''), 401);
        }
        $pdo->prepare("DELETE FROM login_attempts WHERE username = ?")->execute([$username]);
        $pdo->prepare("UPDATE users SET lastLoginAt = NOW() WHERE id = ?")->execute([$u['id']]);
        session_regenerate_id(true);
        $_SESSION = [
            'user' => ['id' => (int) $u['id'], 'username' => $u['username'], 'role' => $u['role']],
            'mustChangePassword' => !empty($u['mustChangePassword']),
            'lastActivity' => time(),
        ];
        audit('login.success', 'user', $u['id']);
        respond(['status' => 'success', 'user' => $_SESSION['user'] + ['mustChangePassword' => must_change_password()]]);

    case 'logout':
        if (current_user()) {
            audit('logout', 'user', current_user()['id']);
        }
        $_SESSION = [];
        session_destroy();
        respond(['status' => 'success']);

    case 'change_password':
        if (!current_user()) {
            fail('Please log in to continue.', 401);
        }
        $me = fetch_row('users', current_user()['id']);
        if (!$me) {
            fail('Account not found.', 404);
        }
        $currentPw = isset($in['currentPassword']) ? (string) $in['currentPassword'] : '';
        $newPw = isset($in['newPassword']) ? (string) $in['newPassword'] : '';
        $hashed = !empty(password_get_info($me['password'])['algo']);
        if ($hashed ? !password_verify($currentPw, $me['password']) : !hash_equals((string) $me['password'], $currentPw)) {
            audit('password.change_failed', 'user', $me['id'], ['reason' => 'wrong current password']);
            fail('Your current password is not correct.', 400);
        }
        if ($problem = mdtu_password_problem($newPw, $me['username'])) {
            fail($problem);
        }
        if (hash_equals($currentPw, $newPw)) {
            fail('The new password must be different from the current one.');
        }
        $pdo->prepare("UPDATE users SET password = ?, mustChangePassword = 0, passwordChangedAt = NOW() WHERE id = ?")
            ->execute([password_hash($newPw, PASSWORD_DEFAULT), $me['id']]);
        session_regenerate_id(true);
        $_SESSION['mustChangePassword'] = false;
        audit('password.changed', 'user', $me['id']);
        respond(['status' => 'success', 'user' => current_user() + ['mustChangePassword' => false]]);

    // ----- training records -----

    case 'get_data':
        require_login();
        respond(load_records($pdo, 'r.year = ?', [$year]));

    case 'records_by_nic':
        $nic = require_nic($_GET, 'nic');
        $vals = nic_lookup_values($nic);
        $ph = implode(',', array_fill(0, count($vals), '?'));
        $rows = load_records($pdo, "r.nic IN ($ph)", $vals);
        $staff = load_staff_certs($pdo, $nic);
        if (!is_admin()) {
            $rows = array_map('public_record', $rows);
            $staff = array_values(array_filter($staff, function ($s) {
                return !empty($s['showAttendance']);
            }));
        }
        respond(['records' => $rows, 'staffCerts' => $staff]);

    case 'lookup_officer':
        $nic = normalize_nic($_GET['nic'] ?? '');
        respond(['status' => 'ok', 'officer' => mdtu_officer_by_nic($pdo, $nic)]);

    case 'save_record':
        $nic = require_nic($in, 'nic');
        $name = str_in($in, 'name', 255, true, 'Officer name');
        $designation = mdtu_canonical_designation(str_in($in, 'designation', 255, true, 'Designation'));
        $office = mdtu_canonical_office(str_in($in, 'office', 255, true, 'Office'));
        $phone = officer_phone($in);
        $gender = officer_gender($pdo, $nic, $in);

        $st = $pdo->prepare("SELECT * FROM programs WHERE id = ?");
        $st->execute([int_in($in, 'programId')]);
        $program = $st->fetch();
        if (!$program) {
            fail('Please select a training program from the list.');
        }
        if (!program_open_for_record($program)) {
            fail('This program can only be submitted from its last day until one week later.');
        }

        $evals = [];
        foreach ((array) ($in['lecturerEvals'] ?? []) as $ev) {
            if (is_array($ev) && !empty($ev['lecturer'])) {
                $evals[] = ['lecturer' => mb_substr(trim((string) $ev['lecturer']), 0, 255), 'rating' => rating_in($ev, 'rating')];
            }
        }

        $feedback = str_in($in, 'feedback', 2000, true, 'Feedback / Constructive Comments');
        $confirmed = is_admin() ? 1 : 0;
        $certFlags = program_cert_flags($pdo, $program['id']);
        $showCompletion = $confirmed ? $certFlags['issueCompletion'] : 0;
        $showAttendance = $confirmed ? $certFlags['issueAttendance'] : 0;
        // Save the officer first, so a changed phone number is kept even when this program was already registered.
        $pdo->prepare("INSERT INTO officers (nic, name, designation, office, phone, gender) VALUES (?, ?, ?, ?, ?, ?)
            ON DUPLICATE KEY UPDATE name = VALUES(name), designation = VALUES(designation), office = VALUES(office), phone = VALUES(phone),
            gender = IF(gender IS NULL OR gender = '', VALUES(gender), gender)")
            ->execute([$nic, $name, $designation, $office, $phone, $gender]);
        try {
            $pdo->prepare("INSERT INTO training_records
                (year, programId, nic, name, designation, office, trainingName, venue, date, hours, foodRating, coordinationRating, feedback, lecturerEvals, absentDates, confirmed, confirmedBy, confirmedAt, showCompletion, showAttendance)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, '', ?, ?, ?, ?, ?)")
                ->execute([
                    (int) substr($program['firstDate'], 0, 4), $program['id'], $nic, $name, $designation, $office,
                    $program['name'], $program['venue'], $program['firstDate'], $program['hours'],
                    rating_in($in, 'foodRating'), rating_in($in, 'coordinationRating'), $feedback,
                    json_encode($evals, JSON_UNESCAPED_UNICODE), $confirmed,
                    $confirmed ? current_name() : null, $confirmed ? date('Y-m-d H:i:s') : null,
                    $showCompletion, $showAttendance,
                ]);
        } catch (PDOException $e) {
            if (is_duplicate($e)) {
                fail('This officer (NIC ' . $nic . ') is already registered for "' . $program['name'] . '" on ' . $program['firstDate'] . '.', 409);
            }
            throw $e;
        }
        $id = (int) $pdo->lastInsertId();
        $serial = mdtu_cert_serial((int) substr($program['firstDate'], 0, 4), $id);
        $pdo->prepare("UPDATE training_records SET certSerial = ? WHERE id = ?")->execute([$serial, $id]);

        audit('record.create', 'training_record', $id, ['nic' => $nic, 'name' => $name, 'designation' => $designation, 'office' => $office,
            'programId' => (int) $program['id'], 'program' => $program['name'], 'certSerial' => $serial, 'autoConfirmed' => (bool) $confirmed]);
        $rows = load_records($pdo, 'r.id = ?', [$id]);
        respond(['status' => 'success', 'record' => $rows[0]]);

    case 'update_record':
        require_role(['admin', 'super']);
        $id = int_in($in, 'id');
        $rows = load_records($pdo, 'r.id = ?', [$id]);
        if (!$rows) {
            fail('Record not found.', 404);
        }
        $rec = $rows[0];
        if (array_key_exists('absentDates', $in)) {
            $absent = parse_dates($in['absentDates']);
            $outside = array_diff($absent, $rec['programDates']);
            if ($outside) {
                fail('Absent date ' . implode(', ', $outside) . ' is not a day of this program (' . implode(', ', $rec['programDates']) . ').');
            }
            $pdo->prepare("UPDATE training_records SET absentDates = ? WHERE id = ?")->execute([implode(', ', $absent), $id]);
        }
        $certFlags = program_cert_flags($pdo, $rec['programId'] ?? 0);
        if (array_key_exists('confirmed', $in)) {
            $c = !empty($in['confirmed']);
            $showC = $c ? $certFlags['issueCompletion'] : 0;
            $showA = $c ? $certFlags['issueAttendance'] : 0;
            $pdo->prepare("UPDATE training_records SET confirmed = ?, confirmedBy = ?, confirmedAt = ?, showCompletion = ?, showAttendance = ? WHERE id = ?")
                ->execute([$c ? 1 : 0, $c ? current_name() : null, $c ? date('Y-m-d H:i:s') : null, $showC, $showA, $id]);
        }
        if ($rec['confirmed'] || !empty($in['confirmed'])) {
            if (array_key_exists('showCompletion', $in) || array_key_exists('showAttendance', $in)) {
                $fresh = fetch_row('training_records', $id);
                if (!empty($fresh['confirmed'])) {
                    $showC = array_key_exists('showCompletion', $in) ? (!empty($in['showCompletion']) ? 1 : 0) : (int) $fresh['showCompletion'];
                    $showA = array_key_exists('showAttendance', $in) ? (!empty($in['showAttendance']) ? 1 : 0) : (int) $fresh['showAttendance'];
                    $showC = $showC && $certFlags['issueCompletion'] ? 1 : 0;
                    $showA = $showA && $certFlags['issueAttendance'] ? 1 : 0;
                    $pdo->prepare("UPDATE training_records SET showCompletion = ?, showAttendance = ? WHERE id = ?")->execute([$showC, $showA, $id]);
                }
            }
        }
        $rows = load_records($pdo, 'r.id = ?', [$id]);
        $after = $rows[0];
        audit('record.update', 'training_record', $id, [
            'nic' => $rec['nic'], 'name' => $rec['name'], 'program' => $rec['trainingName'],
            'before' => ['absentDates' => $rec['absentDates'], 'confirmed' => $rec['confirmed']],
            'after' => ['absentDates' => $after['absentDates'], 'confirmed' => $after['confirmed']],
        ]);
        respond(['status' => 'success', 'record' => $after]);

    case 'confirm_bulk':
        require_role(['admin', 'super']);
        $ids = array_values(array_filter(array_map('intval', (array) ($in['ids'] ?? []))));
        if (!$ids) {
            fail('No records selected.');
        }
        $marks = implode(',', array_fill(0, count($ids), '?'));
        $pdo->prepare("UPDATE training_records r LEFT JOIN programs p ON p.id = r.programId
            SET r.confirmed = 1, r.confirmedBy = ?, r.confirmedAt = ?,
                r.showCompletion = IFNULL(p.issueCompletion, 0), r.showAttendance = IFNULL(p.issueAttendance, 0)
            WHERE r.id IN ($marks)")
            ->execute(array_merge([current_name(), date('Y-m-d H:i:s')], $ids));
        audit('record.confirm_bulk', 'training_record', null, ['ids' => $ids]);
        respond(['status' => 'success', 'updated' => count($ids)]);

    case 'delete_record':
        require_role(['admin', 'super']);
        $id = int_in($in, 'id');
        $old = fetch_row('training_records', $id);
        if (!$old) {
            fail('Record not found.', 404);
        }
        $pdo->prepare("DELETE FROM training_records WHERE id = ?")->execute([$id]);
        audit('record.delete', 'training_record', $id, ['deletedRow' => $old]);
        respond(['status' => 'success']);

    // ----- programs -----

    case 'save_program':
        require_role(['admin', 'super']);
        $id = int_in($in, 'id');
        $name = str_in($in, 'name', 255, true, 'Program name');
        $venue = str_in($in, 'venue', 255, true, 'Venue / Location');
        $fileNo = str_in($in, 'fileNo', 100);
        $dates = parse_dates($in['dates'] ?? '');
        if (!$dates) {
            fail('Enter at least one program date.');
        }
        $hours = int_in($in, 'hours', count($dates) * 6);
        if ($hours < 1 || $hours > 500) {
            $hours = count($dates) * 6;
        }
        foreach ((array) ($in['resourceRenames'] ?? []) as $rename) {
            if (is_array($rename)) {
                mdtu_rename_resource_person($pdo, $rename['from'] ?? '', $rename['to'] ?? '');
            }
        }
        $issueCompletion = !empty($in['issueCompletion']) ? 1 : 0;
        $issueAttendance = !empty($in['issueAttendance']) ? 1 : 0;
        $lecturers = [];
        $seenLecturers = [];
        foreach ((array) ($in['resourcePersons'] ?? []) as $entry) {
            $item = mdtu_normalize_resource_entry($entry);
            if (!$item) {
                continue;
            }
            $key = mdtu_person_key($item['name']);
            if ($key === '' || isset($seenLecturers[$key])) {
                continue;
            }
            $seenLecturers[$key] = true;
            $lecturers[] = $item;
        }
        $canonicalNames = mdtu_canonicalize_names($pdo, array_column($lecturers, 'name'));
        $nameMap = [];
        foreach ($canonicalNames as $cn) {
            $nameMap[mdtu_person_key($cn)] = $cn;
        }
        foreach ($lecturers as &$lec) {
            $k = mdtu_person_key($lec['name']);
            if (isset($nameMap[$k])) {
                $lec['name'] = $nameMap[$k];
            }
        }
        unset($lec);
        mdtu_ensure_resource_persons($pdo, $lecturers);
        $coordinators = [];
        $seenCoord = [];
        foreach ((array) ($in['coordinators'] ?? []) as $entry) {
            $item = mdtu_normalize_coordinator_entry($entry);
            if (!$item || isset($seenCoord[$item['nic']])) {
                continue;
            }
            $seenCoord[$item['nic']] = true;
            $coordinators[] = $item;
        }
        $assistants = [];
        $seenAssist = [];
        foreach ((array) ($in['assistantCoordinators'] ?? []) as $entry) {
            $item = mdtu_normalize_coordinator_entry($entry, 'Assistant Coordinating Officer');
            if (!$item || isset($seenAssist[$item['nic']])) {
                continue;
            }
            $seenAssist[$item['nic']] = true;
            $assistants[] = $item;
            if (count($assistants) >= 20) {
                break;
            }
        }
        if (count((array) ($in['assistantCoordinators'] ?? [])) > 20) {
            fail('You can add at most 20 assistant coordinating officers.');
        }
        $kksHelpers = [];
        $seenKks = [];
        foreach ((array) ($in['kksHelpers'] ?? []) as $entry) {
            $item = mdtu_normalize_coordinator_entry($entry, 'කම්කරු (KKS)');
            if (!$item || isset($seenKks[$item['nic']])) {
                continue;
            }
            $seenKks[$item['nic']] = true;
            // Prefer permanent designation / office from officer directory when available.
            $post = mdtu_staff_posting_from_db($pdo, $item['nic'], 'kks', $item['name'], $item['designation'], $item['office']);
            $item['name'] = $post['name'] ?: $item['name'];
            $item['designation'] = $post['designation'] ?: 'කම්කරු (KKS)';
            $item['office'] = $post['office'] !== '' ? $post['office'] : $item['office'];
            $kksHelpers[] = $item;
            if (count($kksHelpers) >= 5) {
                break;
            }
        }
        if (count((array) ($in['kksHelpers'] ?? [])) > 5) {
            fail('You can add at most 5 සහායක (KKS) helpers per program.');
        }
        $rps = json_encode($lecturers, JSON_UNESCAPED_UNICODE);
        $coordsJson = json_encode($coordinators, JSON_UNESCAPED_UNICODE);
        $assistJson = json_encode($assistants, JSON_UNESCAPED_UNICODE);
        $kksJson = json_encode($kksHelpers, JSON_UNESCAPED_UNICODE);
        $datesJson = json_encode($dates);
        $before = $id ? fetch_row('programs', $id) : null;
        if ($id && !$before) {
            fail('Program not found.', 404);
        }
        try {
            if ($id) {
                $pdo->prepare("UPDATE programs SET name = ?, venue = ?, fileNo = ?, dates = ?, firstDate = ?, hours = ?, resourcePersons = ?, coordinators = ?, assistantCoordinators = ?, kksHelpers = ?, issueCompletion = ?, issueAttendance = ? WHERE id = ?")
                    ->execute([$name, $venue, $fileNo, $datesJson, $dates[0], $hours, $rps, $coordsJson, $assistJson, $kksJson, $issueCompletion, $issueAttendance, $id]);
                $pdo->prepare("UPDATE training_records SET trainingName = ?, venue = ?, date = ?, hours = ?, year = ? WHERE programId = ?")
                    ->execute([$name, $venue, $dates[0], $hours, (int) substr($dates[0], 0, 4), $id]);
            } else {
                $pdo->prepare("INSERT INTO programs (name, venue, fileNo, dates, firstDate, hours, resourcePersons, coordinators, assistantCoordinators, kksHelpers, issueCompletion, issueAttendance) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)")
                    ->execute([$name, $venue, $fileNo, $datesJson, $dates[0], $hours, $rps, $coordsJson, $assistJson, $kksJson, $issueCompletion, $issueAttendance]);
            }
        } catch (PDOException $e) {
            if (is_duplicate($e)) {
                fail("A program named \"$name\" starting on {$dates[0]} already exists.", 409);
            }
            throw $e;
        }
        $savedId = $id ?: (int) $pdo->lastInsertId();
        $pdo->prepare("UPDATE training_records SET showCompletion = ?, showAttendance = ? WHERE programId = ?")
            ->execute([$issueCompletion, $issueAttendance, $savedId]);
        mdtu_sync_staff_certs($pdo, $savedId, $coordinators, $lecturers, $issueAttendance, $assistants, $kksHelpers);
        audit($id ? 'program.update' : 'program.create', 'program', $savedId, [
            'before' => $before,
            'after' => fetch_row('programs', $savedId),
        ]);
        respond(['status' => 'success', 'programs' => load_programs($pdo),
            'resourcePersons' => $pdo->query("SELECT * FROM resource_persons ORDER BY name")->fetchAll(),
            'staffCerts' => load_staff_certs($pdo)]);

    case 'delete_program':
        require_role(['admin', 'super']);
        $id = int_in($in, 'id');
        $st = $pdo->prepare("SELECT COUNT(*) FROM training_records WHERE programId = ?");
        $st->execute([$id]);
        $count = (int) $st->fetchColumn();
        if ($count > 0) {
            fail("This program has $count attendance record(s) and cannot be deleted.", 409);
        }
        $old = fetch_row('programs', $id);
        $pdo->prepare("DELETE FROM staff_certs WHERE programId = ?")->execute([$id]);
        $pdo->prepare("DELETE FROM programs WHERE id = ?")->execute([$id]);
        if ($old) {
            audit('program.delete', 'program', $id, ['deletedRow' => $old]);
        }
        respond(['status' => 'success', 'programs' => load_programs($pdo)]);

    // ----- progress submissions -----

    case 'get_progress':
        require_login();
        respond(load_progress($pdo, $year));

    case 'save_progress':
        require_role(ROLES);
        $userId = require_nic($in, 'userId', 'Superuser ID');
        $office = str_in($in, 'office', 255, true, 'Office (enter a registered ID to load it)');
        $month = str_in($in, 'month', 20, true, 'Month');
        if (!in_array($month, MONTHS, true)) {
            fail('Invalid month.');
        }
        $others = [];
        foreach ((array) ($in['otherTrainings'] ?? []) as $t) {
            if (is_array($t) && trim((string) ($t['topic'] ?? '')) !== '') {
                $date = isset($t['date']) && valid_date($t['date']) ? $t['date'] : '';
                $byDesignation = [];
                foreach ((array) ($t['byDesignation'] ?? []) as $desig => $n) {
                    $desigName = mb_substr(trim((string) $desig), 0, 255);
                    $count = (int) $n;
                    if ($desigName !== '' && $count > 0) {
                        $byDesignation[$desigName] = $count;
                    }
                }
                $row = [
                    'topic' => mb_substr(trim($t['topic']), 0, 255),
                    'hours' => int_in($t, 'hours') ?: 12,
                    'date' => $date,
                    'kind' => 'office12h',
                ];
                if ($byDesignation) {
                    $row['byDesignation'] = $byDesignation;
                }
                $others[] = $row;
            }
        }
        $attachment = !empty($in['pdfAttachment']) ? save_upload($in['pdfAttachment'], ['application/pdf' => 'pdf'], 10485760) : null;
        $pdo->prepare("INSERT INTO progress_submissions (year, userId, office, designation, month, specialRemarks, productivityTasks, otherTrainings, pdfAttachment, submittedAt)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())")
            ->execute([int_in($in, 'year', (int) date('Y')), $userId, $office, str_in($in, 'designation'), $month,
                str_in($in, 'specialRemarks', 5000), str_in($in, 'productivityTasks', 5000),
                json_encode($others, JSON_UNESCAPED_UNICODE), $attachment]);
        audit('progress.submit', 'progress_submission', $pdo->lastInsertId(), ['userId' => $userId, 'office' => $office, 'month' => $month, 'attachment' => $attachment]);
        respond(['status' => 'success']);

    // ----- training plans -----

    case 'get_plans':
        require_login();
        respond(load_plans($pdo, $year));

    case 'save_plan':
        require_role(ROLES);
        $pdo->prepare("INSERT INTO training_plans (year, userId, office, designation, reqGeneral, specialized, departmental, obt) VALUES (?, ?, ?, ?, ?, ?, ?, ?)")
            ->execute([int_in($in, 'year', (int) date('Y')), require_nic($in, 'userId', 'Superuser ID'),
                str_in($in, 'office', 255, true, 'Office (enter a registered ID to load it)'), str_in($in, 'designation'),
                str_in($in, 'reqGeneral', 5000, true, 'Required general training programs'), str_in($in, 'specialized', 5000),
                str_in($in, 'departmental', 5000), str_in($in, 'obt', 5000)]);
        audit('plan.create', 'training_plan', $pdo->lastInsertId(), ['office' => str_in($in, 'office'), 'year' => int_in($in, 'year', (int) date('Y'))]);
        respond(['status' => 'success', 'plans' => load_plans($pdo, int_in($in, 'year', (int) date('Y')))]);

    case 'import_plans':
        require_role(['admin', 'super']);
        $planYear = int_in($in, 'year', (int) date('Y'));
        $ins = $pdo->prepare("INSERT INTO training_plans (year, userId, office, designation, reqGeneral, specialized, departmental, obt) VALUES (?, ?, ?, ?, ?, ?, ?, ?)");
        $pdo->beginTransaction();
        $imported = 0;
        foreach ((array) ($in['rows'] ?? []) as $row) {
            if (!is_array($row)) {
                continue;
            }
            $ins->execute([$planYear, str_in($row, 'userId', 50) ?: 'Imported Plan', str_in($row, 'office') ?: 'Unknown Office',
                str_in($row, 'designation'), str_in($row, 'reqGeneral', 5000), str_in($row, 'specialized', 5000),
                str_in($row, 'departmental', 5000), str_in($row, 'obt', 5000)]);
            $imported++;
        }
        $pdo->commit();
        audit('plan.import', 'training_plan', null, ['year' => $planYear, 'rows' => $imported]);
        respond(['status' => 'success', 'plans' => load_plans($pdo, $planYear)]);

    // ----- master data uploads -----

    case 'replace_resource_persons':
        require_role(['super']);
        $existing = $pdo->query("SELECT * FROM resource_persons ORDER BY id")->fetchAll();
        $byKey = [];
        foreach ($existing as $row) {
            $key = mdtu_person_key($row['name']);
            if ($key !== '' && !isset($byKey[$key])) {
                $byKey[$key] = $row;
            }
        }
        $keep = function ($incoming, $previous) {
            $incoming = trim((string) $incoming);
            return $incoming !== '' ? $incoming : (string) $previous;
        };
        $upd = $pdo->prepare("UPDATE resource_persons SET name = ?, nic = ?, field = ?, institution = ?, contact = ?, email = ? WHERE id = ?");
        $ins = $pdo->prepare("INSERT INTO resource_persons (name, nic, field, institution, contact, email) VALUES (?, ?, ?, ?, ?, ?)");
        $added = 0;
        $updated = 0;
        $pdo->beginTransaction();
        foreach ((array) ($in['rows'] ?? []) as $row) {
            if (!is_array($row)) {
                continue;
            }
            $name = str_in($row, 'name');
            $key = mdtu_person_key($name);
            if ($name === '' || $key === '') {
                continue;
            }
            $nic = normalize_nic($row['nic'] ?? '');
            $field = str_in($row, 'field');
            $institution = str_in($row, 'institution');
            $contact = str_in($row, 'contact', 50);
            $email = str_in($row, 'email', 150);
            if (isset($byKey[$key])) {
                $prev = $byKey[$key];
                $upd->execute([
                    $name,
                    $keep($nic, $prev['nic'] ?? ''),
                    $keep($field, $prev['field'] ?? ''),
                    $keep($institution, $prev['institution'] ?? ''),
                    $keep($contact, $prev['contact'] ?? ''),
                    $keep($email, $prev['email'] ?? ''),
                    $prev['id'],
                ]);
                $byKey[$key]['name'] = $name;
                if ($nic !== '') {
                    $byKey[$key]['nic'] = $nic;
                }
                $updated++;
            } else {
                $ins->execute([$name, $nic !== '' ? $nic : null, $field, $institution, $contact, $email]);
                $byKey[$key] = ['id' => (int) $pdo->lastInsertId(), 'name' => $name, 'nic' => $nic, 'field' => $field, 'institution' => $institution, 'contact' => $contact, 'email' => $email];
                $added++;
            }
        }
        if ($added === 0 && $updated === 0) {
            $pdo->rollBack();
            fail('No resource person names were found. The first column must be Resource Person Name.');
        }
        $pdo->commit();
        audit('resource_persons.replace', 'resource_persons', null, ['added' => $added, 'updated' => $updated]);
        respond(['status' => 'success', 'added' => $added, 'updated' => $updated,
            'resourcePersons' => $pdo->query("SELECT * FROM resource_persons ORDER BY name")->fetchAll()]);

    case 'replace_staff_matrix':
        require_role(['super']);
        $matrixYear = int_in($in, 'year', (int) date('Y'));
        $st = $pdo->prepare("SELECT * FROM staff_matrix WHERE year = ? ORDER BY id");
        $st->execute([$matrixYear]);
        $oldRows = $st->fetchAll();
        $pdo->beginTransaction();
        $pdo->prepare("DELETE FROM staff_matrix WHERE year = ?")->execute([$matrixYear]);
        $ins = $pdo->prepare("INSERT INTO staff_matrix (year, office, counts) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE counts = VALUES(counts)");
        foreach ((array) ($in['rows'] ?? []) as $row) {
            $office = is_array($row) ? str_in($row, 'office') : '';
            if ($office === '') {
                continue;
            }
            $counts = [];
            foreach ((array) ($row['counts'] ?? []) as $desig => $n) {
                $desig = mb_substr(trim((string) $desig), 0, 255);
                if ($desig !== '') {
                    $counts[$desig] = max(0, (int) $n);
                }
            }
            $ins->execute([$matrixYear, $office, json_encode($counts, JSON_UNESCAPED_UNICODE)]);
        }
        $pdo->commit();
        audit('staff_matrix.replace', 'staff_matrix', $matrixYear, ['year' => $matrixYear, 'replacedRows' => $oldRows]);
        respond(['status' => 'success', 'staffMatrix' => load_staff_matrix($pdo, $matrixYear)]);

    case 'import_officers':
        // Super Admin: upsert officer directory from karyamandala CSV rows (batched).
        // Existing NICs (old V/X or 12-digit) are updated — never duplicated.
        require_role(['super']);
        $rows = (array) ($in['rows'] ?? []);
        if (!$rows) {
            fail('No officer rows to import.');
        }
        if (count($rows) > 2500) {
            fail('Too many rows in one batch. Send at most 2500 at a time.');
        }
        $inserted = 0;
        $updated = 0;
        $skipped = 0;
        $pdo->beginTransaction();
        try {
            foreach ($rows as $row) {
                if (!is_array($row)) {
                    $skipped++;
                    continue;
                }
                $result = mdtu_upsert_officer_import($pdo, $row);
                if ($result === 'inserted') {
                    $inserted++;
                } elseif ($result === 'updated') {
                    $updated++;
                } else {
                    $skipped++;
                }
            }
            $pdo->commit();
        } catch (Throwable $e) {
            if ($pdo->inTransaction()) {
                $pdo->rollBack();
            }
            fail('Officer import failed: ' . $e->getMessage(), 500);
        }
        $total = (int) $pdo->query('SELECT COUNT(*) FROM officers')->fetchColumn();
        audit('officers.import', 'officers', null, [
            'inserted' => $inserted,
            'updated' => $updated,
            'skipped' => $skipped,
            'batch' => count($rows),
            'total' => $total,
        ]);
        $done = !empty($in['final']);
        $payload = [
            'status' => 'success',
            'inserted' => $inserted,
            'updated' => $updated,
            'skipped' => $skipped,
            'total' => $total,
        ];
        if ($done) {
            $payload['officers'] = $pdo->query('SELECT nic, name, designation, office, phone, gender FROM officers ORDER BY name')->fetchAll();
        }
        respond($payload);

    // ----- notifications -----

    case 'get_notifications':
        respond(load_notifications($pdo));

    case 'send_notification':
        require_role(['admin', 'super']);
        $target = str_in($in, 'target', 100) ?: 'all';
        $attachment = !empty($in['attachment']) ? save_upload($in['attachment'], ['application/pdf' => 'pdf'], 10485760) : null;
        $pdo->prepare("INSERT INTO notifications (target, title, message, sender, attachment) VALUES (?, ?, ?, ?, ?)")
            ->execute([$target, str_in($in, 'title', 255, true, 'Title'), str_in($in, 'message', 5000, true, 'Message'), current_name(), $attachment]);
        audit('notification.send', 'notification', $pdo->lastInsertId(), ['target' => $target, 'title' => str_in($in, 'title'), 'attachment' => $attachment]);
        respond(['status' => 'success', 'notifications' => load_notifications($pdo)]);

    case 'user_message':
        $idNo = require_nic($in, 'idNo', 'ID Number');
        $phone = str_in($in, 'phone', 20, true, 'Phone number');
        if (!preg_match('/^\+?[0-9 ]{9,15}$/', $phone)) {
            fail('Enter a valid phone number, e.g. 0712345678.');
        }
        $pdo->prepare("INSERT INTO notifications (target, title, message, sender) VALUES ('admin', ?, ?, ?)")
            ->execute(["User Inquiry (ID: $idNo | Phone: $phone)", str_in($in, 'message', 3000, true, 'Message'), current_user() ? current_name() : $idNo]);
        respond(['status' => 'success']);

    case 'update_notification':
    case 'delete_notification':
        require_login();
        $id = int_in($in, 'id');
        $st = $pdo->prepare("SELECT * FROM notifications WHERE id = ?");
        $st->execute([$id]);
        $n = $st->fetch();
        if (!$n) {
            fail('Notification not found.', 404);
        }
        if (!is_admin() && $n['sender'] !== current_name()) {
            fail('You can only change your own messages.', 403);
        }
        if ($action === 'delete_notification') {
            $pdo->prepare("DELETE FROM notifications WHERE id = ?")->execute([$id]);
            audit('notification.delete', 'notification', $id, ['deletedRow' => $n]);
        } else {
            $pdo->prepare("UPDATE notifications SET title = ?, message = ? WHERE id = ?")
                ->execute([str_in($in, 'title', 255, true, 'Title'), str_in($in, 'message', 5000, true, 'Message'), $id]);
            audit('notification.update', 'notification', $id, ['before' => $n, 'after' => fetch_row('notifications', $id)]);
        }
        respond(['status' => 'success', 'notifications' => load_notifications($pdo)]);

    // ----- live chat -----

    case 'get_chat':
        respond(load_chat($pdo));

    case 'send_chat':
        $recipient = str_in($in, 'recipient', 100) ?: 'all';
        $pdo->prepare("INSERT INTO chat_messages (sender, senderRole, recipient, text) VALUES (?, ?, ?, ?)")
            ->execute([current_name(), current_role(), $recipient, str_in($in, 'text', 1000, true, 'Message')]);
        respond(['status' => 'success', 'chat' => load_chat($pdo)]);

    case 'delete_chat':
        require_login();
        $id = int_in($in, 'id');
        $old = fetch_row('chat_messages', $id);
        if ($old && (is_admin() || $old['sender'] === current_name())) {
            $pdo->prepare("DELETE FROM chat_messages WHERE id = ?")->execute([$id]);
            audit('chat.delete', 'chat_message', $id, ['deletedRow' => $old]);
        }
        respond(['status' => 'success', 'chat' => load_chat($pdo)]);

    // ----- user accounts -----

    case 'create_user':
        require_role(['super']);
        $username = str_in($in, 'username', 100, true, 'Username');
        if (!preg_match('/^[A-Za-z0-9._@-]{3,100}$/', $username)) {
            fail('Username may contain letters, numbers, dot, dash, underscore and @ (min 3 characters).');
        }
        $password = isset($in['password']) ? (string) $in['password'] : '';
        if ($problem = mdtu_password_problem($password, $username)) {
            fail($problem);
        }
        $role = str_in($in, 'role', 20);
        if (!in_array($role, ROLES, true)) {
            fail('Invalid role.');
        }
        $nicRaw = trim((string) ($in['nic'] ?? ''));
        $nic = $nicRaw !== '' ? require_nic($in, 'nic') : '';
        $officerName = str_in($in, 'officerName', 255);
        $designation = str_in($in, 'designation', 255);
        $office = str_in($in, 'office', 255);
        if ($nic !== '' && $officerName === '') {
            fail('Officer Name is required when NIC / Officer ID is entered.');
        }
        try {
            $pdo->prepare("INSERT INTO users (username, password, role, nic, officerName, designation, office, mustChangePassword) VALUES (?, ?, ?, ?, ?, ?, ?, 1)")
                ->execute([$username, password_hash($password, PASSWORD_DEFAULT), $role, $nic ?: null, $officerName ?: null, $designation ?: null, $office ?: null]);
        } catch (PDOException $e) {
            if (is_duplicate($e)) {
                fail('Username already exists.', 409);
            }
            throw $e;
        }
        if ($nic !== '' && $officerName !== '') {
            $pdo->prepare("INSERT INTO officers (nic, name, designation, office, phone, gender) VALUES (?, ?, ?, ?, '', NULL)
                ON DUPLICATE KEY UPDATE name = VALUES(name), designation = IF(VALUES(designation) <> '', VALUES(designation), designation),
                office = IF(VALUES(office) <> '', VALUES(office), office)")
                ->execute([$nic, $officerName, $designation, $office]);
        }
        audit('user.create', 'user', $pdo->lastInsertId(), ['username' => $username, 'role' => $role, 'nic' => $nic]);
        respond(['status' => 'success', 'users' => load_users($pdo)]);

    case 'reset_password':
        require_role(['super']);
        $target = fetch_row('users', int_in($in, 'id'));
        if (!$target) {
            fail('Account not found.', 404);
        }
        $password = isset($in['password']) ? (string) $in['password'] : '';
        if ($problem = mdtu_password_problem($password, $target['username'])) {
            fail($problem);
        }
        $pdo->prepare("UPDATE users SET password = ?, mustChangePassword = 1, passwordChangedAt = NOW() WHERE id = ?")
            ->execute([password_hash($password, PASSWORD_DEFAULT), $target['id']]);
        $pdo->prepare("DELETE FROM login_attempts WHERE username = ?")->execute([$target['username']]);
        audit('user.password_reset', 'user', $target['id'], ['username' => $target['username']]);
        respond(['status' => 'success', 'users' => load_users($pdo)]);

    case 'delete_user':
        require_role(['super']);
        $id = int_in($in, 'id');
        if ($id === (int) current_user()['id']) {
            fail('You cannot delete the account you are logged in with.');
        }
        $old = fetch_row('users', $id);
        if (!$old) {
            fail('Account not found.', 404);
        }
        if ($old['role'] === 'super' && (int) $pdo->query("SELECT COUNT(*) FROM users WHERE role = 'super'")->fetchColumn() <= 1) {
            fail('The last Super Admin account cannot be deleted.');
        }
        $pdo->prepare("DELETE FROM users WHERE id = ?")->execute([$id]);
        unset($old['password']);
        audit('user.delete', 'user', $id, ['deletedRow' => $old]);
        respond(['status' => 'success', 'users' => load_users($pdo)]);

    // ----- settings & certificate template -----

    case 'save_settings':
        require_role(['admin', 'super']);
        $images = ['logo', 'signature', 'seal', 'stateEmblem'];
        $superKeys = array_merge($images, ['signatoryName', 'signatoryTitle', 'orgAddress', 'orgPhone', 'publicBaseUrl']);
        $set = $pdo->prepare("REPLACE INTO settings (k, v) VALUES (?, ?)");
        $oldSettings = load_settings($pdo);
        $changes = [];
        foreach ((array) ($in['settings'] ?? []) as $k => $v) {
            if ($k === 'alertText') {
                $v = mb_substr(trim((string) $v), 0, 500);
                $set->execute([$k, $v]);
                $changes[$k] = ['before' => $oldSettings[$k] ?? null, 'after' => $v];
                continue;
            }
            if (!in_array($k, $superKeys, true)) {
                continue;
            }
            if (current_role() !== 'super') {
                fail('Only the Super Admin can change certificate templates.', 403);
            }
            if (in_array($k, $images, true)) {
                $v = $v ? save_upload($v, ['image/png' => 'png', 'image/jpeg' => 'jpg'], 3145728) : '';
            } elseif ($k === 'publicBaseUrl') {
                $v = trim((string) $v);
                if ($v !== '' && !preg_match('#^https?://#i', $v)) {
                    fail('Public website address must start with http:// or https://');
                }
                $v = rtrim($v, '/');
    } else {
                $v = mb_substr(trim((string) $v), 0, 255);
            }
            $set->execute([$k, $v]);
            $changes[$k] = ['before' => $oldSettings[$k] ?? null, 'after' => $v];
        }
        if ($changes) {
            audit('settings.update', 'settings', null, $changes);
        }
        respond(['status' => 'success', 'settings' => load_settings($pdo)]);

    // ----- backup -----

    case 'export_all':
        require_role(['super']);
        $out = [];
        foreach (['programs', 'training_records', 'officers', 'progress_submissions', 'training_plans', 'staff_matrix', 'resource_persons',
            'staff_certs', 'notifications', 'chat_messages', 'certificate_issues', 'audit_log'] as $t) {
            $out[$t] = $pdo->query("SELECT * FROM `$t`")->fetchAll();
        }
        $out['settings'] = load_settings($pdo);
        $out['users'] = load_users($pdo);
        audit('backup.download', 'database', null, ['format' => 'browser export']);
        respond(['status' => 'success', 'exportedAt' => date('c'), 'tables' => $out]);

    case 'list_backups':
        require_role(['super']);
        mdtu_auto_backup($pdo);
        respond(['status' => 'ok', 'backups' => mdtu_list_backups(), 'keepDays' => MDTU_BACKUP_KEEP_DAYS, 'writable' => mdtu_backup_prepare_dir()]);

    case 'create_backup':
        require_role(['super']);
        try {
            $name = mdtu_create_backup($pdo, 'manual');
        } catch (RuntimeException $e) {
            fail($e->getMessage(), 500);
        }
        respond(['status' => 'success', 'name' => $name, 'backups' => mdtu_list_backups()]);

    case 'download_progress_pdf':
        // Force-download the PDF attached to a monthly progress submission.
        require_login();
        $id = (int) ($_GET['id'] ?? 0);
        if ($id < 1) {
            fail('Progress submission id is required.', 400);
        }
        $st = $pdo->prepare('SELECT id, userId, office, month, year, pdfAttachment FROM progress_submissions WHERE id = ?');
        $st->execute([$id]);
        $sub = $st->fetch();
        if (!$sub || empty($sub['pdfAttachment'])) {
            fail('No PDF attachment for this progress submission.', 404);
        }
        $role = current_role();
        $me = current_user();
        $myUser = $me['username'] ?? '';
        $ownerOk = $role === 'superuser' && (
            ($sub['userId'] ?? '') === $myUser
            || normalize_nic($sub['userId'] ?? '') === normalize_nic($myUser)
        );
        if (!is_admin() && !$ownerOk) {
            fail('You do not have permission to download this attachment.', 403);
        }
        $rel = str_replace('\\', '/', (string) $sub['pdfAttachment']);
        if (strpos($rel, 'data:application/pdf') === 0) {
            // Legacy inline data URL stored in DB
            if (!preg_match('#^data:application/pdf;base64,(.+)$#s', $rel, $m)) {
                fail('Attached PDF could not be read.', 500);
            }
            $bytes = base64_decode($m[1], true);
            if ($bytes === false || $bytes === '') {
                fail('Attached PDF is empty or damaged.', 500);
            }
            $fname = 'MDTU_Progress_' . preg_replace('/[^A-Za-z0-9_-]+/', '_', ($sub['office'] ?? 'office') . '_' . ($sub['month'] ?? '') . '_' . ($sub['year'] ?? '')) . '.pdf';
            audit('progress.pdf_download', 'progress_submission', (string) $id, ['source' => 'dataurl']);
            header_remove('Content-Type');
            header('Content-Type: application/pdf');
            header('Content-Disposition: attachment; filename="' . $fname . '"');
            header('Content-Length: ' . strlen($bytes));
            header('Cache-Control: private, no-store');
            echo $bytes;
            exit;
        }
        if (!preg_match('#^uploads/[A-Za-z0-9._-]+\.pdf$#', $rel)) {
            fail('Invalid attachment path.', 400);
        }
        $path = realpath(__DIR__ . '/' . $rel);
        $uploadsRoot = realpath(__DIR__ . '/uploads');
        if ($path === false || $uploadsRoot === false || strpos($path, $uploadsRoot) !== 0 || !is_file($path)) {
            fail('PDF file is missing on the server. Ask the superuser to submit the progress again with the PDF attached.', 404);
        }
        $fname = 'MDTU_Progress_' . preg_replace('/[^A-Za-z0-9_-]+/', '_', ($sub['office'] ?? 'office') . '_' . ($sub['month'] ?? '') . '_' . ($sub['year'] ?? '')) . '.pdf';
        audit('progress.pdf_download', 'progress_submission', (string) $id, ['file' => basename($path)]);
        header_remove('Content-Type');
        header('Content-Type: application/pdf');
        header('Content-Disposition: attachment; filename="' . $fname . '"');
        header('Content-Length: ' . filesize($path));
        header('Cache-Control: private, no-store');
        readfile($path);
        exit;

    case 'download_backup':
        require_role(['super']);
        $name = (string) ($_GET['name'] ?? '');
        $path = MDTU_BACKUP_DIR . '/' . $name;
        if (!mdtu_valid_backup_name($name) || !is_file($path)) {
            fail('Backup file not found.', 404);
        }
        audit('backup.download', 'backup', $name);
        header_remove('Content-Type');
        header('Content-Type: application/octet-stream');
        header('Content-Disposition: attachment; filename="' . $name . '"');
        header('Content-Length: ' . filesize($path));
        readfile($path);
        exit;

    // ----- audit trail -----

    case 'get_audit':
        require_role(['super']);
        $where = ['1 = 1'];
        $params = [];
        if (valid_date($_GET['from'] ?? '')) {
            $where[] = 'createdAt >= ?';
            $params[] = $_GET['from'] . ' 00:00:00';
        }
        if (valid_date($_GET['to'] ?? '')) {
            $where[] = 'createdAt <= ?';
            $params[] = $_GET['to'] . ' 23:59:59';
        }
        $user = str_in($_GET, 'user', 100);
        if ($user !== '') {
            $where[] = 'username = ?';
            $params[] = $user;
        }
        $q = str_in($_GET, 'q', 100);
        if ($q !== '') {
            $where[] = '(action LIKE ? OR entityId = ? OR details LIKE ?)';
            array_push($params, '%' . $q . '%', $q, '%' . $q . '%');
        }
        $limit = max(50, min(5000, int_in($_GET, 'limit', 500)));
        $st = $pdo->prepare("SELECT id, createdAt, username, role, action, entity, entityId, details, ip FROM audit_log
            WHERE " . implode(' AND ', $where) . " ORDER BY id DESC LIMIT $limit");
        $st->execute($params);
        respond([
            'status' => 'ok',
            'rows' => $st->fetchAll(),
            'total' => (int) $pdo->query("SELECT COUNT(*) FROM audit_log")->fetchColumn(),
            'users' => $pdo->query("SELECT DISTINCT username FROM audit_log ORDER BY username")->fetchAll(PDO::FETCH_COLUMN),
        ]);

    case 'verify_audit':
        require_role(['super']);
        $result = mdtu_audit_verify($pdo);
        audit('audit.verify', 'audit_log', null, $result);
        respond(['status' => 'ok'] + $result);

    // ----- issued certificate register -----

    case 'log_certificate':
        $id = int_in($in, 'recordId');
        $staffId = int_in($in, 'staffCertId');
        $type = str_in($in, 'type', 20);
        $mode = str_in($in, 'mode', 10);
        if (!in_array($type, ['attendance', 'completion'], true) || !in_array($mode, ['pdf', 'print', 'jpeg'], true)) {
            fail('Invalid certificate type.');
        }
        $ip = mdtu_client_ip();
        if ($staffId) {
            if ($type !== 'attendance') {
                fail('Only attendance certificates are issued for coordinators and lecturers.');
            }
            $rows = load_staff_certs($pdo);
            $rec = null;
            foreach ($rows as $row) {
                if ((int) $row['id'] === $staffId) {
                    $rec = $row;
                    break;
                }
            }
            if (!$rec || empty($rec['showAttendance'])) {
                fail('Certificate is not available for this coordinating officer / lecturer.', 404);
            }
            $st = $pdo->prepare("SELECT COUNT(*) FROM certificate_issues WHERE staffCertId = ? AND certType = ? AND mode = ? AND ip = ? AND issuedAt >= ?");
            $st->execute([$staffId, $type, $mode, $ip, date('Y-m-d H:i:s', time() - 60)]);
            if ((int) $st->fetchColumn() === 0) {
                $pdo->prepare("INSERT INTO certificate_issues (recordId, staffCertId, certSerial, certType, mode, issuedAt, issuedBy, ip) VALUES (0, ?, ?, ?, ?, NOW(), ?, ?)")
                    ->execute([$staffId, $rec['certSerial'], $type, $mode, current_user() ? current_name() : 'public', $ip]);
                audit('certificate.issue', 'staff_cert', $staffId, ['type' => $type, 'mode' => $mode, 'certSerial' => $rec['certSerial'], 'nic' => $rec['nic'], 'name' => $rec['name'], 'role' => $rec['role'], 'program' => $rec['trainingName']]);
            }
            respond(['status' => 'success']);
        }
        $rec = fetch_row('training_records', $id);
        if (!$rec || !$rec['confirmed']) {
            fail('Certificate is not available for this record.', 404);
        }
        $certFlags = program_cert_flags($pdo, $rec['programId'] ?? 0);
        if ($type === 'completion' && (empty($rec['showCompletion']) || !$certFlags['issueCompletion'])) {
            fail('The completion certificate is not published for this program.', 403);
        }
        if ($type === 'attendance' && (empty($rec['showAttendance']) || !$certFlags['issueAttendance'])) {
            fail('The attendance certificate is not published for this program.', 403);
        }
        $st = $pdo->prepare("SELECT COUNT(*) FROM certificate_issues WHERE recordId = ? AND certType = ? AND mode = ? AND ip = ? AND issuedAt >= ?");
        $st->execute([$id, $type, $mode, $ip, date('Y-m-d H:i:s', time() - 60)]);
        if ((int) $st->fetchColumn() === 0) {
            $pdo->prepare("INSERT INTO certificate_issues (recordId, certSerial, certType, mode, issuedAt, issuedBy, ip) VALUES (?, ?, ?, ?, NOW(), ?, ?)")
                ->execute([$id, $rec['certSerial'], $type, $mode, current_user() ? current_name() : 'public', $ip]);
            audit('certificate.issue', 'training_record', $id, ['type' => $type, 'mode' => $mode, 'certSerial' => $rec['certSerial'], 'nic' => $rec['nic'], 'name' => $rec['name'], 'program' => $rec['trainingName']]);
        }
        respond(['status' => 'success']);

    case 'cert_register':
        require_role(['admin', 'super']);
        $type = in_array($_GET['type'] ?? '', ['attendance', 'completion', 'any'], true) ? $_GET['type'] : 'attendance';
        $issuedOnly = ($_GET['scope'] ?? 'issued') !== 'confirmed';
        $issueWhere = $type === 'any' ? '1 = 1' : 'certType = ?';
        $issueParams = $type === 'any' ? [] : [$type];
        if (valid_date($_GET['from'] ?? '')) {
            $issueWhere .= ' AND issuedAt >= ?';
            $issueParams[] = $_GET['from'] . ' 00:00:00';
        }
        if (valid_date($_GET['to'] ?? '')) {
            $issueWhere .= ' AND issuedAt <= ?';
            $issueParams[] = $_GET['to'] . ' 23:59:59';
        }
        $where = ['r.confirmed = 1'];
        $params = [];
        if (int_in($_GET, 'programId')) {
            $where[] = 'r.programId = ?';
            $params[] = int_in($_GET, 'programId');
        } elseif (int_in($_GET, 'year')) {
            $where[] = 'r.year = ?';
            $params[] = int_in($_GET, 'year');
        }
        if ($issuedOnly) {
            $where[] = 'ci.timesIssued > 0';
        }
        $st = $pdo->prepare("SELECT r.id, r.certSerial, r.nic, r.name, r.designation, r.office, r.trainingName, r.venue, r.date, r.hours,
                r.absentDates, r.confirmedBy, r.confirmedAt, p.dates AS programDates, p.fileNo AS programFileNo,
                ci.firstIssued, ci.lastIssued, COALESCE(ci.timesIssued, 0) AS timesIssued
            FROM training_records r
            LEFT JOIN programs p ON p.id = r.programId
            LEFT JOIN (SELECT recordId, MIN(issuedAt) AS firstIssued, MAX(issuedAt) AS lastIssued, COUNT(*) AS timesIssued
                FROM certificate_issues WHERE $issueWhere GROUP BY recordId) ci ON ci.recordId = r.id
            WHERE " . implode(' AND ', $where) . "
            ORDER BY r.date, r.trainingName, r.name");
        $st->execute(array_merge($issueParams, $params));
        $rows = decode_json_fields($st->fetchAll(), ['programDates']);
        foreach ($rows as &$r) {
            $r['id'] = (int) $r['id'];
            $r['timesIssued'] = (int) $r['timesIssued'];
            $r['effectiveHours'] = effective_hours($r['hours'], $r['absentDates']);
            if (!$r['programDates']) {
                $r['programDates'] = [$r['date']];
            }
        }
        unset($r);
        respond(['status' => 'ok', 'rows' => $rows]);

    default:
        fail('Invalid action.', 404);
}
