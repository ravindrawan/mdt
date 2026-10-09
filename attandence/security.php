<?php
// Shared security helpers: session, HTTP headers, audit trail and password rules.
require_once __DIR__ . '/config.php';

if (!function_exists('mb_substr')) {
    function mb_substr($s, $start, $length = null) { return $length === null ? substr($s, $start) : substr($s, $start, $length); }
    function mb_strtolower($s) { return strtolower($s); }
}

const MDTU_IDLE_TIMEOUT = 1800;          // log out after 30 minutes without activity
const MDTU_MAX_FAILS_PER_USER = 5;       // failed logins per username ...
const MDTU_MAX_FAILS_PER_IP = 20;        // ... or per computer ...
const MDTU_LOCK_MINUTES = 15;            // ... within this many minutes block further tries

function mdtu_is_https()
{
    return (!empty($_SERVER['HTTPS']) && strtolower((string) $_SERVER['HTTPS']) !== 'off')
        || (int) ($_SERVER['SERVER_PORT'] ?? 0) === 443
        || strtolower((string) ($_SERVER['HTTP_X_FORWARDED_PROTO'] ?? '')) === 'https';
}

function mdtu_is_local_request()
{
    return in_array($_SERVER['REMOTE_ADDR'] ?? '', ['127.0.0.1', '::1'], true);
}

function mdtu_security_headers()
{
    if (headers_sent()) {
        return;
    }
    header_remove('X-Powered-By');
    header('X-Content-Type-Options: nosniff');
    header('X-Frame-Options: SAMEORIGIN');
    header('Referrer-Policy: strict-origin-when-cross-origin');
    header('Permissions-Policy: camera=(), microphone=(), geolocation=(), payment=()');
    if (mdtu_is_https()) {
        header('Strict-Transport-Security: max-age=31536000');
    }
}

/** Starts the login session with safe cookie settings. $touch = false for background polling. */
function mdtu_session_start($touch = true)
{
    ini_set('session.use_strict_mode', '1');
    ini_set('session.use_only_cookies', '1');
    ini_set('session.use_trans_sid', '0');
    session_name('MDTUSESSID');
    if (PHP_VERSION_ID >= 70300) {
        session_set_cookie_params(['lifetime' => 0, 'path' => '/', 'secure' => mdtu_is_https(), 'httponly' => true, 'samesite' => 'Lax']);
    } else {
        session_set_cookie_params(0, '/; samesite=Lax', '', mdtu_is_https(), true);
    }
    session_start();

    if (!empty($_SESSION['user'])) {
        $last = (int) ($_SESSION['lastActivity'] ?? time());
        if (time() - $last > MDTU_IDLE_TIMEOUT) {
            $_SESSION = ['sessionExpired' => true];
            session_regenerate_id(true);
        }
    }
    if ($touch || empty($_SESSION['lastActivity'])) {
        $_SESSION['lastActivity'] = time();
    }
}

function mdtu_client_ip()
{
    return substr((string) ($_SERVER['REMOTE_ADDR'] ?? ''), 0, 45);
}

// ---------- audit trail ----------

function mdtu_audit_key()
{
    if (defined('AUDIT_KEY') && AUDIT_KEY !== '') {
        return AUDIT_KEY;
    }
    return hash('sha256', 'mdtu|' . DB_NAME . '|' . DB_USER . '|' . DB_PASS);
}

function mdtu_audit_hash($prevHash, array $row)
{
    $fields = [$prevHash];
    foreach (['createdAt', 'username', 'role', 'action', 'entity', 'entityId', 'details', 'ip', 'userAgent'] as $f) {
        $fields[] = isset($row[$f]) ? (string) $row[$f] : null;
    }
    return hash_hmac('sha256', json_encode($fields, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES), mdtu_audit_key());
}

function mdtu_json($value)
{
    $flags = JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES | JSON_PARTIAL_OUTPUT_ON_ERROR;
    if (defined('JSON_INVALID_UTF8_SUBSTITUTE')) {
        $flags |= JSON_INVALID_UTF8_SUBSTITUTE;
    }
    return json_encode($value, $flags);
}

/**
 * Appends one entry to the audit trail. Call it after the change has been committed.
 * $details may hold the full old row of anything deleted or replaced, so nothing is ever lost.
 */
function mdtu_audit(PDO $pdo, $action, $entity = null, $entityId = null, $details = null, $username = null)
{
    $user = $_SESSION['user'] ?? null;
    $row = [
        'createdAt' => date('Y-m-d H:i:s'),
        'username'  => mb_substr((string) ($username ?? ($user['username'] ?? 'public')), 0, 100),
        'role'      => $user['role'] ?? 'public',
        'action'    => substr((string) $action, 0, 60),
        'entity'    => $entity === null ? null : substr((string) $entity, 0, 60),
        'entityId'  => $entityId === null ? null : mb_substr((string) $entityId, 0, 100),
        'details'   => $details === null ? null : mdtu_json($details),
        'ip'        => mdtu_client_ip(),
        'userAgent' => substr(preg_replace('/[^\x20-\x7E]/', '', (string) ($_SERVER['HTTP_USER_AGENT'] ?? '')), 0, 255),
    ];
    $locked = false;
    $own = false;
    try {
        $locked = (int) $pdo->query("SELECT GET_LOCK('mdtu_audit_chain', 10)")->fetchColumn() === 1;
        $own = !$pdo->inTransaction() && $pdo->beginTransaction();
        // Chain from the signed checkpoint, so entries removed from the end stay detectable forever
        $prev = mdtu_audit_head_hash($pdo)
            ?: ($pdo->query("SELECT hash FROM audit_log ORDER BY id DESC LIMIT 1")->fetchColumn() ?: str_repeat('0', 64));
        $hash = mdtu_audit_hash($prev, $row);
        $pdo->prepare("INSERT INTO audit_log (createdAt, username, role, action, entity, entityId, details, ip, userAgent, prevHash, hash)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)")
            ->execute([$row['createdAt'], $row['username'], $row['role'], $row['action'], $row['entity'], $row['entityId'],
                $row['details'], $row['ip'], $row['userAgent'], $prev, $hash]);
        $id = (int) $pdo->lastInsertId();
        $head = $id . '|' . $hash;
        $pdo->prepare("REPLACE INTO settings (k, v) VALUES ('audit_head', ?)")
            ->execute([$head . '|' . hash_hmac('sha256', $head, mdtu_audit_key())]);
        if ($own) {
            $pdo->commit();
        }
    } catch (Throwable $e) {
        if ($own && $pdo->inTransaction()) {
            $pdo->rollBack();
        }
        error_log('MDTU audit: ' . $e->getMessage());
    } finally {
        if ($locked) {
            $pdo->query("SELECT RELEASE_LOCK('mdtu_audit_chain')");
        }
    }
}

/** Hash of the newest entry according to the signed checkpoint, or null if there is no valid checkpoint. */
function mdtu_audit_head_hash(PDO $pdo)
{
    $head = (string) $pdo->query("SELECT v FROM settings WHERE k = 'audit_head'")->fetchColumn();
    $parts = explode('|', $head);
    if (count($parts) === 3 && hash_equals(hash_hmac('sha256', $parts[0] . '|' . $parts[1], mdtu_audit_key()), $parts[2])) {
        return $parts[1];
    }
    return null;
}

/** Re-checks every audit entry. Any edited, inserted or removed entry breaks the chain. */
function mdtu_audit_verify(PDO $pdo)
{
    $prev = str_repeat('0', 64);
    $lastId = 0;
    $total = 0;
    $st = $pdo->prepare("SELECT * FROM audit_log WHERE id > ? ORDER BY id LIMIT 1000");
    while (true) {
        $st->execute([$lastId]);
        $rows = $st->fetchAll();
        if (!$rows) {
            break;
        }
        foreach ($rows as $r) {
            if (!hash_equals($prev, (string) $r['prevHash'])) {
                return ['ok' => false, 'total' => $total, 'brokenId' => (int) $r['id'], 'reason' => 'An entry before #' . $r['id'] . ' was removed or changed.'];
            }
            if (!hash_equals(mdtu_audit_hash($prev, $r), (string) $r['hash'])) {
                return ['ok' => false, 'total' => $total, 'brokenId' => (int) $r['id'], 'reason' => 'Entry #' . $r['id'] . ' was changed after it was written.'];
            }
            $prev = $r['hash'];
            $lastId = (int) $r['id'];
            $total++;
        }
    }

    $head = (string) $pdo->query("SELECT v FROM settings WHERE k = 'audit_head'")->fetchColumn();
    if ($head !== '') {
        $parts = explode('|', $head);
        $valid = count($parts) === 3 && hash_equals(hash_hmac('sha256', $parts[0] . '|' . $parts[1], mdtu_audit_key()), $parts[2]);
        if (!$valid) {
            return ['ok' => false, 'total' => $total, 'brokenId' => null, 'reason' => 'The audit checkpoint was altered.'];
        }
        if ((int) $parts[0] !== $lastId || !hash_equals($parts[1], $prev)) {
            return ['ok' => false, 'total' => $total, 'brokenId' => (int) $parts[0], 'reason' => 'The latest audit entries (after #' . $lastId . ') were removed.'];
        }
    }
    return ['ok' => true, 'total' => $total, 'brokenId' => null, 'reason' => ''];
}

// ---------- passwords ----------

/** Returns an error message, or null when the password is strong enough. */
function mdtu_password_problem($password, $username = '')
{
    if (strlen($password) < 8) {
        return 'Password must be at least 8 characters.';
    }
    if (!preg_match('/[A-Za-z]/', $password) || !preg_match('/[0-9]/', $password)) {
        return 'Password must contain both letters and numbers.';
    }
    if ($username !== '' && stripos($password, $username) !== false) {
        return 'Password must not contain the username.';
    }
    $common = ['password1', 'password123', 'admin123', 'admin1234', 'abc12345', 'qwerty123', 'mdtu1234', 'mdtu12345', 'welcome1', 'super123'];
    if (in_array(strtolower($password), $common, true)) {
        return 'This password is too common. Choose another one.';
    }
    return null;
}
