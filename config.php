<?php
/**
 * MDTU North Western Province — shared configuration.
 * Uses the existing database, tables, and uploaded files.
 */

declare(strict_types=1);

date_default_timezone_set('Asia/Colombo');

const MDTU_NAME = 'Management Development and Training Unit';
const MDTU_ORG  = 'North Western Provincial Council';
const MDTU_PHONE = '+94 37 2222018';
const MDTU_FAX   = '+94 37 2223655';
const MDTU_PLACE = 'Kurunegala';

const YES_SI = 'ඔව්';
const NO_SI  = 'නැත';
const TYPE_MDTU = 'MDTU පුහුණුවකි';
const TYPE_PRODUCTIVITY = 'ඵලදායිතා පුහුණුවකි';

const DOWNLOAD_TYPES = [
    'චක්‍රලේක' => 'Circulars',
    'ලිපි' => 'Letters',
    'නිබන්ධන' => 'Handouts',
    'ප්‍රශ්න පත්‍ර' => 'Past papers',
    'ඡායාරූප' => 'Photographs',
    'ආකෘතිපත්‍ර' => 'Forms',
    'අයදුම්පත්‍ර' => 'Application forms',
    'වෙනත්' => 'Other',
    'Notifications' => 'Notices',
];

function app_bootstrap(): void
{
    if (session_status() !== PHP_SESSION_ACTIVE) {
        session_set_cookie_params([
            'lifetime' => 0,
            'path' => '/',
            'httponly' => true,
            'samesite' => 'Lax',
        ]);
        session_start();
    }
}

function csrf_token(): string
{
    app_bootstrap();
    if (empty($_SESSION['csrf'])) {
        $_SESSION['csrf'] = bin2hex(random_bytes(16));
    }
    return $_SESSION['csrf'];
}

function csrf_check(): void
{
    app_bootstrap();
    $sent = $_SERVER['HTTP_X_CSRF'] ?? ($_POST['csrf'] ?? '');
    if (!is_string($sent) || !hash_equals($_SESSION['csrf'] ?? '', $sent)) {
        json_out(['ok' => false, 'error' => 'The form expired. Refresh the page and try again.'], 403);
    }
}

function db(): mysqli
{
    static $con = null;
    if ($con instanceof mysqli) {
        return $con;
    }

    $host = getenv('MDTU_DB_HOST') ?: 'localhost';
    $user = getenv('MDTU_DB_USER') ?: 'mdtunwgo_dbuser';
    $pass = getenv('MDTU_DB_PASS') ?: 'LsHnaTiuBg2Ih1A&';
    $name = getenv('MDTU_DB_NAME') ?: 'mdtunwgo_mdtu';

    mysqli_report(MYSQLI_REPORT_OFF);
    $attempts = [[$host, $user, $pass, $name]];
    if ($user !== 'root') {
        $attempts[] = ['127.0.0.1', 'root', '', $name];
        $attempts[] = ['localhost', 'root', '', $name];
    }
    foreach ($attempts as $attempt) {
        $try = @new mysqli($attempt[0], $attempt[1], $attempt[2], $attempt[3]);
        if ($try->connect_errno === 0) {
            $con = $try;
            // Legacy columns are latin1 and already hold the original text bytes.
            $con->set_charset('latin1');
            $con->query("SET SESSION sql_mode=''");
            ensure_resource_columns($con);
            ensure_delivery_extras($con);
            ensure_plan_lists($con);
            ensure_saved_estimates($con);
            ensure_provisions($con);
            ensure_pace($con);
            ensure_advances($con);
            ensure_foodbills($con);
            ensure_allowances($con);
            ensure_selected_date($con);
            ensure_signatory($con);
            ensure_blacklist($con);
            ensure_modules($con);
            ensure_eval($con);
            ensure_notify($con);
            ensure_totals($con);
            ensure_adminchat($con);
            ensure_aheadsave($con);
            return $con;
        }
    }
    json_out([
        'ok' => false,
        'error' => 'Could not connect to the MDTU database. Start MySQL and import mdtunwgo_mdtu.sql.',
    ], 500);
}

function ensure_resource_columns(mysqli $con): void
{
    static $done = false;
    if ($done) {
        return;
    }
    $done = true;
    $have = [];
    $res = $con->query('SHOW COLUMNS FROM cp_resourcepersons');
    if (!$res) {
        return;
    }
    while ($row = $res->fetch_assoc()) {
        $have[$row['Field']] = true;
    }
    foreach (['rp_cv', 'rp_certificate', 'rp_code', 'rp_whatsapp', 'rp_photo', 'rp_morefields'] as $column) {
        if (!isset($have[$column])) {
            $con->query("ALTER TABLE cp_resourcepersons ADD `$column` TEXT NOT NULL DEFAULT ''");
        }
    }
    $con->query("UPDATE cp_resourcepersons SET rp_code = LPAD(FLOOR(100000 + RAND() * 899999), 6, '0') WHERE rp_code = ''");
}

function ensure_plan_lists(mysqli $con): void
{
    static $done = false;
    if ($done) {
        return;
    }
    $done = true;
    $have = [];
    $res = $con->query('SHOW COLUMNS FROM cp_atp');
    if (!$res) {
        return;
    }
    while ($row = $res->fetch_assoc()) {
        $have[$row['Field']] = true;
    }
    foreach (['atp_moredays', 'atp_moreresource', 'atp_panelno', 'atp_supervisor', 'atp_moresupport', 'atp_offweb'] as $column) {
        if (!isset($have[$column])) {
            $con->query("ALTER TABLE cp_atp ADD `$column` TEXT NOT NULL");
        }
    }
}

function ensure_saved_estimates(mysqli $con): void
{
    static $done = false;
    if ($done) {
        return;
    }
    $done = true;
    $table = $con->query("SHOW TABLES LIKE 'cp_savedestimates'");
    if ($table && $table->num_rows === 0) {
        $con->query("CREATE TABLE cp_savedestimates (
            se_id INT NOT NULL AUTO_INCREMENT,
            se_atpid INT NOT NULL,
            se_day1 VARCHAR(20) NOT NULL DEFAULT '',
            se_trname TEXT NOT NULL,
            se_fileno TEXT NOT NULL,
            se_total VARCHAR(40) NOT NULL DEFAULT '',
            se_sheet MEDIUMTEXT NOT NULL,
            se_savedat DATETIME NOT NULL,
            PRIMARY KEY (se_id),
            UNIQUE KEY se_atpid (se_atpid)
        ) ENGINE=MyISAM DEFAULT CHARSET=latin1");
    }
}

function ensure_provisions(mysqli $con): void
{
    static $done = false;
    if ($done) {
        return;
    }
    $done = true;
    $table = $con->query("SHOW TABLES LIKE 'cp_provisions'");
    if ($table && $table->num_rows === 0) {
        $con->query("CREATE TABLE cp_provisions (
            pv_id INT NOT NULL AUTO_INCREMENT,
            pv_year VARCHAR(4) NOT NULL DEFAULT '',
            pv_total VARCHAR(40) NOT NULL DEFAULT '',
            pv_general VARCHAR(40) NOT NULL DEFAULT '',
            pv_department VARCHAR(40) NOT NULL DEFAULT '',
            pv_special VARCHAR(40) NOT NULL DEFAULT '',
            pv_language VARCHAR(40) NOT NULL DEFAULT '',
            pv_drug VARCHAR(40) NOT NULL DEFAULT '',
            pv_external VARCHAR(40) NOT NULL DEFAULT '',
            pv_meeting VARCHAR(40) NOT NULL DEFAULT '',
            pv_other VARCHAR(40) NOT NULL DEFAULT '',
            PRIMARY KEY (pv_id),
            UNIQUE KEY pv_year (pv_year)
        ) ENGINE=MyISAM DEFAULT CHARSET=latin1");
    }
    $con->query("CREATE TABLE IF NOT EXISTS cp_provision_moves (
        pm_id INT NOT NULL AUTO_INCREMENT,
        pm_year VARCHAR(4) NOT NULL DEFAULT '',
        pm_date DATE NOT NULL,
        pm_from VARCHAR(20) NOT NULL DEFAULT '',
        pm_to VARCHAR(20) NOT NULL DEFAULT '',
        pm_amount DECIMAL(14,2) NOT NULL DEFAULT 0,
        pm_ref VARCHAR(120) NOT NULL DEFAULT '',
        pm_note TEXT NOT NULL,
        pm_by VARCHAR(100) NOT NULL DEFAULT '',
        pm_saved DATETIME NOT NULL,
        PRIMARY KEY (pm_id),
        KEY pm_year (pm_year)
    ) ENGINE=MyISAM DEFAULT CHARSET=latin1");
    $con->query("CREATE TABLE IF NOT EXISTS cp_provision_out (
        po_id INT NOT NULL AUTO_INCREMENT,
        po_year VARCHAR(4) NOT NULL DEFAULT '',
        po_amount VARCHAR(40) NOT NULL DEFAULT '',
        po_spent VARCHAR(40) NOT NULL DEFAULT '',
        po_note VARCHAR(500) NOT NULL DEFAULT '',
        PRIMARY KEY (po_id),
        UNIQUE KEY po_year (po_year)
    ) ENGINE=MyISAM DEFAULT CHARSET=latin1");
    $con->query("CREATE TABLE IF NOT EXISTS cp_provision_sends (
        ps_id INT NOT NULL AUTO_INCREMENT,
        ps_year VARCHAR(4) NOT NULL DEFAULT '',
        ps_atp VARCHAR(20) NOT NULL DEFAULT '',
        ps_plan VARCHAR(80) NOT NULL DEFAULT '',
        ps_name VARCHAR(255) NOT NULL DEFAULT '',
        ps_office VARCHAR(255) NOT NULL DEFAULT '',
        ps_moved DATE NOT NULL,
        ps_amount DECIMAL(14,2) NOT NULL DEFAULT 0,
        ps_kind VARCHAR(20) NOT NULL DEFAULT '',
        ps_letter VARCHAR(120) NOT NULL DEFAULT '',
        ps_date DATE NULL,
        ps_by VARCHAR(100) NOT NULL DEFAULT '',
        ps_saved DATETIME NOT NULL,
        PRIMARY KEY (ps_id),
        KEY ps_year (ps_year)
    ) ENGINE=MyISAM DEFAULT CHARSET=latin1");
}

function ensure_pace(mysqli $con): void
{
    static $done = false;
    if ($done) {
        return;
    }
    $done = true;
    $revision = $con->query("SHOW TABLES LIKE 'cp_pace_revision'");
    if ($revision && $revision->num_rows === 0) {
        $con->query("CREATE TABLE cp_pace_revision (
            pr_id INT NOT NULL AUTO_INCREMENT,
            pr_year VARCHAR(4) NOT NULL DEFAULT '',
            pr_date VARCHAR(20) NOT NULL DEFAULT '',
            pr_note VARCHAR(255) NOT NULL DEFAULT '',
            pr_total VARCHAR(40) NOT NULL DEFAULT '',
            pr_general VARCHAR(40) NOT NULL DEFAULT '',
            pr_department VARCHAR(40) NOT NULL DEFAULT '',
            pr_special VARCHAR(40) NOT NULL DEFAULT '',
            pr_language VARCHAR(40) NOT NULL DEFAULT '',
            pr_drug VARCHAR(40) NOT NULL DEFAULT '',
            pr_external VARCHAR(40) NOT NULL DEFAULT '',
            pr_other VARCHAR(40) NOT NULL DEFAULT '',
            PRIMARY KEY (pr_id),
            UNIQUE KEY pr_year (pr_year)
        ) ENGINE=MyISAM DEFAULT CHARSET=latin1");
    }
    $edit = $con->query("SHOW TABLES LIKE 'cp_pace_edit'");
    if ($edit && $edit->num_rows === 0) {
        $con->query("CREATE TABLE cp_pace_edit (
            pe_id INT NOT NULL AUTO_INCREMENT,
            pe_year VARCHAR(4) NOT NULL DEFAULT '',
            pe_month VARCHAR(2) NOT NULL DEFAULT '',
            pe_category VARCHAR(20) NOT NULL DEFAULT '',
            pe_held VARCHAR(20) NOT NULL DEFAULT '',
            pe_people VARCHAR(20) NOT NULL DEFAULT '',
            pe_spent VARCHAR(40) NOT NULL DEFAULT '',
            PRIMARY KEY (pe_id),
            UNIQUE KEY pe_slot (pe_year, pe_month, pe_category)
        ) ENGINE=MyISAM DEFAULT CHARSET=latin1");
    }
    $slide = $con->query("SHOW TABLES LIKE 'cp_pace_slide'");
    if ($slide && $slide->num_rows === 0) {
        $con->query("CREATE TABLE cp_pace_slide (
            ps_id INT NOT NULL AUTO_INCREMENT,
            ps_year VARCHAR(4) NOT NULL DEFAULT '',
            ps_until VARCHAR(20) NOT NULL DEFAULT '',
            ps_slot VARCHAR(40) NOT NULL DEFAULT '',
            ps_title VARCHAR(200) NOT NULL DEFAULT '',
            ps_body TEXT NOT NULL,
            PRIMARY KEY (ps_id),
            UNIQUE KEY ps_slot (ps_year, ps_until, ps_slot)
        ) ENGINE=MyISAM DEFAULT CHARSET=latin1");
    }
}

function ensure_advances(mysqli $con): void
{
    static $done = false;
    if ($done) {
        return;
    }
    $done = true;
    $table = $con->query("SHOW TABLES LIKE 'cp_advances'");
    if ($table && $table->num_rows === 0) {
        $con->query("CREATE TABLE cp_advances (
            ad_id INT NOT NULL AUTO_INCREMENT,
            ad_atpid INT NOT NULL,
            ad_date VARCHAR(20) NOT NULL DEFAULT '',
            ad_advance VARCHAR(40) NOT NULL DEFAULT '0',
            ad_spent VARCHAR(40) NOT NULL DEFAULT '0',
            ad_government VARCHAR(40) NOT NULL DEFAULT '0',
            ad_receipt VARCHAR(40) NOT NULL DEFAULT '0',
            PRIMARY KEY (ad_id),
            UNIQUE KEY ad_atpid (ad_atpid)
        ) ENGINE=MyISAM DEFAULT CHARSET=latin1");
    }
    $have = [];
    $columns = $con->query('SHOW COLUMNS FROM cp_advances');
    if ($columns) {
        while ($row = $columns->fetch_assoc()) {
            $have[$row['Field']] = true;
        }
    }
    if (!isset($have['ad_government'])) {
        $con->query("ALTER TABLE cp_advances ADD ad_government VARCHAR(40) NOT NULL DEFAULT '0'");
    }
}

function ensure_foodbills(mysqli $con): void
{
    static $done = false;
    if ($done) {
        return;
    }
    $done = true;
    $table = $con->query("SHOW TABLES LIKE 'cp_foodbills'");
    if ($table && $table->num_rows === 0) {
        $con->query("CREATE TABLE cp_foodbills (
            fb_id INT NOT NULL AUTO_INCREMENT,
            fb_atpid INT NOT NULL,
            fb_date VARCHAR(20) NOT NULL DEFAULT '',
            fb_advance VARCHAR(40) NOT NULL DEFAULT '0',
            fb_lines MEDIUMTEXT NOT NULL,
            fb_food VARCHAR(40) NOT NULL DEFAULT '0',
            PRIMARY KEY (fb_id),
            UNIQUE KEY fb_atpid (fb_atpid)
        ) ENGINE=MyISAM DEFAULT CHARSET=latin1");
    }
    $have = [];
    $columns = $con->query('SHOW COLUMNS FROM cp_foodbills');
    if ($columns) {
        while ($row = $columns->fetch_assoc()) {
            $have[$row['Field']] = true;
        }
    }
    if (!isset($have['fb_food'])) {
        $con->query("ALTER TABLE cp_foodbills ADD fb_food VARCHAR(40) NOT NULL DEFAULT '0'");
    }
}

function ensure_adminchat(mysqli $con): void
{
    static $done = false;
    if ($done) {
        return;
    }
    $done = true;
    $threads = $con->query("SHOW TABLES LIKE 'cp_adminchat'");
    if ($threads && $threads->num_rows === 0) {
        $con->query("CREATE TABLE cp_adminchat (
            ac_id INT NOT NULL AUTO_INCREMENT,
            ac_login INT NOT NULL DEFAULT 0,
            ac_role VARCHAR(40) NOT NULL DEFAULT '',
            ac_name VARCHAR(120) NOT NULL DEFAULT '',
            ac_office VARCHAR(160) NOT NULL DEFAULT '',
            ac_nid VARCHAR(40) NOT NULL DEFAULT '',
            ac_phone VARCHAR(40) NOT NULL DEFAULT '',
            ac_updated VARCHAR(20) NOT NULL DEFAULT '',
            ac_wait TINYINT NOT NULL DEFAULT 0,
            PRIMARY KEY (ac_id),
            KEY ac_login (ac_login),
            KEY ac_guest (ac_nid, ac_phone)
        ) ENGINE=MyISAM DEFAULT CHARSET=latin1");
    }
    $messages = $con->query("SHOW TABLES LIKE 'cp_adminchatmsg'");
    if ($messages && $messages->num_rows === 0) {
        $con->query("CREATE TABLE cp_adminchatmsg (
            am_id INT NOT NULL AUTO_INCREMENT,
            am_chat INT NOT NULL,
            am_from VARCHAR(12) NOT NULL DEFAULT '',
            am_text TEXT NOT NULL,
            am_time VARCHAR(20) NOT NULL DEFAULT '',
            PRIMARY KEY (am_id),
            KEY am_chat (am_chat)
        ) ENGINE=MyISAM DEFAULT CHARSET=latin1");
    }
}

function ensure_aheadsave(mysqli $con): void
{
    static $done = false;
    if ($done) {
        return;
    }
    $done = true;
    $table = $con->query("SHOW TABLES LIKE 'cp_aheadsave'");
    if ($table && $table->num_rows === 0) {
        $con->query("CREATE TABLE cp_aheadsave (
            as_id INT NOT NULL AUTO_INCREMENT,
            as_year VARCHAR(8) NOT NULL DEFAULT '',
            as_kind VARCHAR(20) NOT NULL DEFAULT '',
            as_atp INT NOT NULL DEFAULT 0,
            as_spent VARCHAR(40) NOT NULL DEFAULT '',
            as_people VARCHAR(20) NOT NULL DEFAULT '',
            as_money VARCHAR(40) NOT NULL DEFAULT '',
            PRIMARY KEY (as_id),
            UNIQUE KEY as_slot (as_year, as_kind, as_atp)
        ) ENGINE=MyISAM DEFAULT CHARSET=latin1");
    }
}

function ensure_allowances(mysqli $con): void
{
    static $done = false;
    if ($done) {
        return;
    }
    $done = true;
    $table = $con->query("SHOW TABLES LIKE 'cp_allowances'");
    if ($table && $table->num_rows === 0) {
        $con->query("CREATE TABLE cp_allowances (
            al_id INT NOT NULL AUTO_INCREMENT,
            al_atpid INT NOT NULL,
            al_date VARCHAR(20) NOT NULL DEFAULT '',
            al_planno TEXT NOT NULL,
            al_name TEXT NOT NULL,
            al_coordinator TEXT NOT NULL,
            al_dates TEXT NOT NULL,
            al_planned VARCHAR(80) NOT NULL DEFAULT '',
            al_attended VARCHAR(80) NOT NULL DEFAULT '',
            al_resource VARCHAR(40) NOT NULL DEFAULT '0',
            al_resourcewho TEXT NOT NULL,
            al_coord VARCHAR(40) NOT NULL DEFAULT '0',
            al_coordwho TEXT NOT NULL,
            al_supervise VARCHAR(40) NOT NULL DEFAULT '0',
            al_supervisewho TEXT NOT NULL,
            al_liaise VARCHAR(40) NOT NULL DEFAULT '0',
            al_liaisewho TEXT NOT NULL,
            al_account VARCHAR(40) NOT NULL DEFAULT '0',
            al_accountwho TEXT NOT NULL,
            al_office VARCHAR(40) NOT NULL DEFAULT '0',
            al_officeids MEDIUMTEXT NOT NULL,
            al_spent VARCHAR(40) NOT NULL DEFAULT '0',
            PRIMARY KEY (al_id),
            UNIQUE KEY al_atpid (al_atpid)
        ) ENGINE=MyISAM DEFAULT CHARSET=latin1");
    }
    $have = [];
    $columns = $con->query('SHOW COLUMNS FROM cp_allowances');
    if ($columns) {
        while ($row = $columns->fetch_assoc()) {
            $have[$row['Field']] = true;
        }
    }
    $add = [
        'al_resourcewho' => "ALTER TABLE cp_allowances ADD al_resourcewho TEXT NOT NULL",
        'al_coordwho' => "ALTER TABLE cp_allowances ADD al_coordwho TEXT NOT NULL",
        'al_supervisewho' => "ALTER TABLE cp_allowances ADD al_supervisewho TEXT NOT NULL",
        'al_liaisewho' => "ALTER TABLE cp_allowances ADD al_liaisewho TEXT NOT NULL",
        'al_account' => "ALTER TABLE cp_allowances ADD al_account VARCHAR(40) NOT NULL DEFAULT '0'",
        'al_accountwho' => "ALTER TABLE cp_allowances ADD al_accountwho TEXT NOT NULL",
        'al_officeids' => "ALTER TABLE cp_allowances ADD al_officeids MEDIUMTEXT NOT NULL",
    ];
    foreach ($add as $column => $sql) {
        if (!isset($have[$column])) {
            $con->query($sql);
        }
    }
}

function ensure_delivery_extras(mysqli $con): void
{
    static $done = false;
    if ($done) {
        return;
    }
    $done = true;
    $have = [];
    $res = $con->query('SHOW COLUMNS FROM cp_trainingattendance');
    if ($res) {
        while ($row = $res->fetch_assoc()) {
            $have[$row['Field']] = true;
        }
        foreach (['tratt_name', 'tratt_desig', 'tratt_office', 'tratt_mobile'] as $column) {
            if (!isset($have[$column])) {
                $con->query("ALTER TABLE cp_trainingattendance ADD `$column` TEXT NOT NULL DEFAULT ''");
            }
        }
    }
    $table = $con->query("SHOW TABLES LIKE 'cp_othertrainings'");
    if ($table && $table->num_rows === 0) {
        $con->query("CREATE TABLE cp_othertrainings (
            otn_id INT NOT NULL AUTO_INCREMENT,
            otn_officer TEXT NOT NULL,
            otn_programme TEXT NOT NULL,
            otn_date DATE NOT NULL,
            otn_office TEXT NOT NULL,
            otn_days TEXT NOT NULL,
            otn_details TEXT NOT NULL,
            PRIMARY KEY (otn_id)
        ) ENGINE=MyISAM DEFAULT CHARSET=latin1");
    }
}

function json_out(array $payload, int $status = 200): void
{
    http_response_code($status);
    header('Content-Type: application/json; charset=utf-8');
    $flags = JSON_UNESCAPED_UNICODE | JSON_INVALID_UTF8_SUBSTITUTE;
    $json = json_encode(repair_value($payload), $flags);
    echo $json === false ? '{"ok":false,"error":"Could not encode the response."}' : $json;
    exit;
}

function repair_value(mixed $value): mixed
{
    if (is_array($value)) {
        $out = [];
        foreach ($value as $key => $item) {
            $out[$key] = repair_value($item);
        }
        return $out;
    }
    if (!is_string($value) || $value === '') {
        return $value;
    }
    if (preg_match('/\p{Sinhala}/u', $value)) {
        return $value;
    }
    foreach (['Windows-1252', 'ISO-8859-1'] as $encoding) {
        $converted = @mb_convert_encoding($value, 'UTF-8', $encoding);
        if (is_string($converted) && preg_match('/\p{Sinhala}/u', $converted)) {
            return $converted;
        }
    }
    if (!mb_check_encoding($value, 'UTF-8')) {
        $converted = @mb_convert_encoding($value, 'UTF-8', 'UTF-8');
        return is_string($converted) ? $converted : $value;
    }
    return $value;
}

function current_user(): ?array
{
    app_bootstrap();
    if (empty($_SESSION['logid'])) {
        return null;
    }
    return [
        'id' => (int) $_SESSION['logid'],
        'office' => (string) ($_SESSION['offid'] ?? ''),
        'username' => (string) ($_SESSION['un'] ?? ''),
        'role' => (string) ($_SESSION['logtype'] ?? ''),
    ];
}

function session_idle(): bool
{
    app_bootstrap();
    if (empty($_SESSION['logid'])) {
        return false;
    }
    $now = time();
    $seen = (int) ($_SESSION['seen'] ?? $now);
    if (($now - $seen) > 300) {
        $_SESSION = [];
        session_regenerate_id(true);
        return true;
    }
    $_SESSION['seen'] = $now;
    return false;
}

function require_user(): array
{
    if (session_idle()) {
        json_out(['ok' => false, 'error' => 'විනාඩි 5 ක් භාවිතා නොකළ නිසා ඉවත් විය. නැවත ඇතුළු වන්න.'], 401);
    }
    $user = current_user();
    if ($user === null) {
        json_out(['ok' => false, 'error' => 'Please sign in.'], 401);
    }
    return $user;
}

function is_admin(array $user): bool
{
    return $user['role'] === 'Administrator';
}

function is_super(array $user): bool
{
    return $user['role'] === 'Super User' || is_admin($user);
}

function blank_date(string $value): bool
{
    return $value === '' || str_starts_with($value, '0000') || str_starts_with($value, '1111');
}

function ensure_selected_date(mysqli $con): void
{
    static $done = false;
    if ($done) {
        return;
    }
    $done = true;
    $found = $con->query("SHOW COLUMNS FROM cp_trainingapplications LIKE 'tapp_selecteddate'");
    if ($found && $found->num_rows === 0) {
        $con->query('ALTER TABLE cp_trainingapplications ADD tapp_selecteddate DATE NULL');
    }
}

function ensure_signatory(mysqli $con): void
{
    static $done = false;
    if ($done) {
        return;
    }
    $done = true;
    $con->query("CREATE TABLE IF NOT EXISTS cp_signatory (
        sg_id INT NOT NULL,
        sg_name VARCHAR(200) NOT NULL,
        sg_title VARCHAR(40) NOT NULL,
        sg_sign VARCHAR(200) NOT NULL,
        sg_photo VARCHAR(200) NOT NULL,
        PRIMARY KEY (sg_id)
    ) ENGINE=MyISAM DEFAULT CHARSET=latin1");
    foreach ([
        'sg_title' => "ALTER TABLE cp_signatory ADD sg_title VARCHAR(40) NOT NULL",
        'sg_photo' => "ALTER TABLE cp_signatory ADD sg_photo VARCHAR(200) NOT NULL",
    ] as $column => $sql) {
        $found = $con->query("SHOW COLUMNS FROM cp_signatory LIKE '" . $column . "'");
        if ($found && $found->num_rows === 0) {
            $con->query($sql);
        }
    }
}

function ensure_blacklist(mysqli $con): void
{
    static $done = false;
    if ($done) {
        return;
    }
    $done = true;
    $con->query("CREATE TABLE IF NOT EXISTS cp_blacklist (
        bl_id INT NOT NULL AUTO_INCREMENT,
        bl_nid VARCHAR(40) NOT NULL,
        bl_name VARCHAR(200) NOT NULL,
        bl_reason TEXT NOT NULL,
        bl_from DATE NOT NULL,
        bl_until DATE NOT NULL,
        PRIMARY KEY (bl_id)
    ) ENGINE=MyISAM DEFAULT CHARSET=latin1");
}

function ensure_modules(mysqli $con): void
{
    static $done = false;
    if ($done) {
        return;
    }
    $done = true;
    $con->query("CREATE TABLE IF NOT EXISTS cp_modules (
        md_id INT NOT NULL AUTO_INCREMENT,
        md_title VARCHAR(250) NOT NULL,
        md_file VARCHAR(200) NOT NULL,
        md_saved DATE NOT NULL,
        PRIMARY KEY (md_id)
    ) ENGINE=MyISAM DEFAULT CHARSET=latin1");
    $con->query("CREATE TABLE IF NOT EXISTS cp_moduledays (
        dy_id INT NOT NULL AUTO_INCREMENT,
        dy_module INT NOT NULL,
        dy_no INT NOT NULL,
        dy_title VARCHAR(250) NOT NULL,
        dy_body MEDIUMTEXT NOT NULL,
        PRIMARY KEY (dy_id),
        KEY dy_module (dy_module)
    ) ENGINE=MyISAM DEFAULT CHARSET=latin1");
    $found = $con->query("SHOW COLUMNS FROM cp_modules LIKE 'md_atp'");
    if ($found && $found->num_rows === 0) {
        $con->query('ALTER TABLE cp_modules ADD md_atp INT NOT NULL DEFAULT 0');
    }
}

function ensure_eval(mysqli $con): void
{
    static $done = false;
    if ($done) {
        return;
    }
    $done = true;
    $con->query("CREATE TABLE IF NOT EXISTS cp_eval (
        ev_id INT NOT NULL AUTO_INCREMENT,
        ev_atp INT NOT NULL,
        ev_title VARCHAR(250) NOT NULL,
        ev_token VARCHAR(40) NOT NULL,
        ev_saved DATE NOT NULL,
        PRIMARY KEY (ev_id),
        KEY ev_atp (ev_atp),
        KEY ev_token (ev_token)
    ) ENGINE=MyISAM DEFAULT CHARSET=latin1");
    $con->query("CREATE TABLE IF NOT EXISTS cp_evalq (
        eq_id INT NOT NULL AUTO_INCREMENT,
        eq_eval INT NOT NULL,
        eq_no INT NOT NULL,
        eq_text TEXT NOT NULL,
        eq_a VARCHAR(500) NOT NULL,
        eq_b VARCHAR(500) NOT NULL,
        eq_c VARCHAR(500) NOT NULL,
        eq_d VARCHAR(500) NOT NULL,
        eq_correct CHAR(1) NOT NULL,
        PRIMARY KEY (eq_id),
        KEY eq_eval (eq_eval)
    ) ENGINE=MyISAM DEFAULT CHARSET=latin1");
    $con->query("CREATE TABLE IF NOT EXISTS cp_evaltry (
        et_id INT NOT NULL AUTO_INCREMENT,
        et_eval INT NOT NULL,
        et_kind VARCHAR(8) NOT NULL,
        et_nid VARCHAR(40) NOT NULL,
        et_name VARCHAR(200) NOT NULL,
        et_score INT NOT NULL,
        et_done DATETIME NULL,
        PRIMARY KEY (et_id),
        KEY et_eval (et_eval)
    ) ENGINE=MyISAM DEFAULT CHARSET=latin1");
    $con->query("CREATE TABLE IF NOT EXISTS cp_evalans (
        ea_id INT NOT NULL AUTO_INCREMENT,
        ea_try INT NOT NULL,
        ea_no INT NOT NULL,
        ea_choice CHAR(1) NOT NULL,
        ea_ok TINYINT NOT NULL,
        ea_at DATETIME NOT NULL,
        PRIMARY KEY (ea_id),
        KEY ea_try (ea_try)
    ) ENGINE=MyISAM DEFAULT CHARSET=latin1");
}

function ensure_notify(mysqli $con): void
{
    static $done = false;
    if ($done) {
        return;
    }
    $done = true;
    $con->query("CREATE TABLE IF NOT EXISTS cp_notify (
        nt_id INT NOT NULL,
        nt_wa_token TEXT NOT NULL,
        nt_wa_phone VARCHAR(40) NOT NULL,
        nt_gmail_app VARCHAR(80) NOT NULL DEFAULT '',
        PRIMARY KEY (nt_id)
    ) ENGINE=MyISAM DEFAULT CHARSET=latin1");
    $col = $con->query("SHOW COLUMNS FROM cp_notify LIKE 'nt_gmail_app'");
    if ($col && $col->num_rows === 0) {
        $con->query("ALTER TABLE cp_notify ADD nt_gmail_app VARCHAR(80) NOT NULL DEFAULT ''");
    }
}

function ensure_totals(mysqli $con): void
{
    static $done = false;
    if ($done) {
        return;
    }
    $done = true;
    $con->query("CREATE TABLE IF NOT EXISTS cp_totals (
        tt_id INT NOT NULL AUTO_INCREMENT,
        tt_atpid INT NOT NULL,
        tt_category VARCHAR(40) NOT NULL DEFAULT '',
        tt_planned VARCHAR(40) NOT NULL DEFAULT '',
        tt_days VARCHAR(40) NOT NULL DEFAULT '',
        tt_applied VARCHAR(40) NOT NULL DEFAULT '',
        tt_selected VARCHAR(40) NOT NULL DEFAULT '',
        tt_budget VARCHAR(40) NOT NULL DEFAULT '',
        tt_estimate VARCHAR(40) NOT NULL DEFAULT '',
        tt_revised VARCHAR(40) NOT NULL DEFAULT '',
        tt_offest VARCHAR(40) NOT NULL DEFAULT '',
        tt_step1 VARCHAR(40) NOT NULL DEFAULT '',
        tt_step2 VARCHAR(40) NOT NULL DEFAULT '',
        PRIMARY KEY (tt_id),
        UNIQUE KEY tt_atpid (tt_atpid)
    ) ENGINE=MyISAM DEFAULT CHARSET=latin1");
}

function public_file(string $folder, string $name): string
{
    $name = basename(str_replace('\\', '/', $name));
    if ($name === '' || $name === '.' || $name === '..') {
        return '';
    }
    $folders = [$folder];
    if ($folder === 'uploads') {
        $folders[] = 'upload';
    }
    foreach ($folders as $dir) {
        $relative = $dir . '/' . $name;
        if (is_file(__DIR__ . '/' . $relative)) {
            return $relative;
        }
    }
    return $folder . '/' . $name;
}

/** Registry of every original table. Labels are English; stored values stay unchanged. */
function table_registry(): array
{
    return [
        'cp_desigs' => ['label' => 'Designations', 'group' => 'Setup', 'roles' => ['Administrator']],
        'offices' => ['label' => 'Offices', 'group' => 'Setup', 'roles' => ['Administrator']],
        'cp_services' => ['label' => 'Services', 'group' => 'Setup', 'roles' => ['Administrator']],
        'cp_trainings' => ['label' => 'Training programme names', 'group' => 'Setup', 'roles' => ['Administrator']],
        'cp_trfields' => ['label' => 'Subject fields', 'group' => 'Setup', 'roles' => ['Administrator']],
        'cp_trcenters' => ['label' => 'Training centres', 'group' => 'Setup', 'roles' => ['Administrator', 'Super User']],
        'cp_funds' => ['label' => 'Funding sources', 'group' => 'Setup', 'roles' => ['Administrator', 'Super User']],
        'cp_food' => ['label' => 'Food and refreshments', 'group' => 'Setup', 'roles' => ['Administrator', 'Super User']],
        'cp_login' => ['label' => 'User accounts', 'group' => 'Setup', 'roles' => ['Administrator'], 'hidden' => ['lg_pwd']],
        'cp_slideshowimgs' => ['label' => 'Home photographs', 'group' => 'Content', 'roles' => ['Administrator'], 'files' => ['slp_photo' => 'slideshow']],
        'cp_messeges' => ['label' => 'Notices', 'group' => 'Content', 'roles' => ['Administrator', 'Super User']],
        'cp_downloads' => ['label' => 'Downloads', 'group' => 'Content', 'roles' => ['Administrator', 'Super User'], 'files' => ['dwn_file' => 'uploads', 'dwn_file2' => 'uploads', 'dwn_file3' => 'uploads', 'dwn_file4' => 'uploads']],
        'cp_usercomments' => ['label' => 'Suggestions', 'group' => 'Content', 'roles' => ['Administrator']],
        'cp_foreignschols' => ['label' => 'Foreign scholarships', 'group' => 'Scholarships', 'roles' => ['Administrator', 'Super User'], 'files' => ['fs_file' => 'foriegnschols']],
        'cp_appliedforiegnscholars' => ['label' => 'Scholarship applicants', 'group' => 'Scholarships', 'roles' => ['Administrator', 'Super User']],
        'cp_foriegnscholars' => ['label' => 'Officers who received scholarships', 'group' => 'Scholarships', 'roles' => ['Administrator', 'Super User']],
        'cp_outsidetrcource' => ['label' => 'External courses', 'group' => 'Scholarships', 'roles' => ['Administrator', 'Super User'], 'files' => ['ot_file' => 'outsidetrainings']],
        'cp_staff' => ['label' => 'Staff', 'group' => 'People', 'roles' => ['Administrator', 'Super User', 'User'], 'office' => 'stf_office', 'files' => ['stf_Photo' => 'staff']],
        'cp_resourcepersons' => ['label' => 'Resource persons', 'group' => 'People', 'roles' => ['Administrator', 'Super User', 'User'], 'admin_change' => true, 'files' => ['rp_cv' => 'resource', 'rp_certificate' => 'resource', 'rp_photo' => 'resource']],
        'cp_trainingofficers' => ['label' => 'Training officers', 'group' => 'People', 'roles' => ['Administrator', 'Super User', 'User'], 'office' => 'tro_office'],
        'cp_trrequirements' => ['label' => 'Training needs', 'group' => 'Plan', 'roles' => ['Administrator', 'Super User', 'User'], 'office' => 'req_addoffice'],
        'cp_treqperiod' => ['label' => 'Needs collection period', 'group' => 'Plan', 'roles' => ['Administrator']],
        'trdate' => ['label' => 'Needs closing date', 'group' => 'Plan', 'roles' => ['Administrator']],
        'cp_atp' => ['label' => 'Annual training plan', 'group' => 'Plan', 'roles' => ['Administrator', 'Super User', 'User'], 'user_write' => false],
        'cp_trainingapplications' => ['label' => 'Training applications', 'group' => 'Delivery', 'roles' => ['Administrator', 'Super User', 'User'], 'admin_change' => true, 'office' => 'tapp_office'],
        'cp_trainingattendance' => ['label' => 'Attendance', 'group' => 'Delivery', 'roles' => ['Administrator', 'Super User', 'User'], 'user_write' => false],
        'cp_completedtrainings' => ['label' => 'Completed programmes', 'group' => 'Delivery', 'roles' => ['Administrator', 'Super User']],
        'cp_privatetrainings' => ['label' => 'Private course funding', 'group' => 'Delivery', 'roles' => ['Administrator', 'Super User']],
        'cp_othertrainings' => ['label' => 'Trainings by other offices', 'group' => 'Delivery', 'roles' => ['Administrator', 'Super User']],
        'Sheet1' => ['label' => 'Imported plan sheet 1', 'group' => 'Archives', 'roles' => ['Administrator'], 'write' => false],
        'Sheet2' => ['label' => 'Imported plan sheet 2', 'group' => 'Archives', 'roles' => ['Administrator'], 'write' => false],
        'Sheet3' => ['label' => 'Imported plan sheet 3', 'group' => 'Archives', 'roles' => ['Administrator'], 'write' => false],
        'Sheet4' => ['label' => 'Imported plan sheet 4', 'group' => 'Archives', 'roles' => ['Administrator'], 'write' => false],
        'Summerized_on_Mgt_Level' => ['label' => 'Management-level summary sheet', 'group' => 'Archives', 'roles' => ['Administrator'], 'write' => false],
    ];
}

function field_label(string $column): string
{
    static $map = [
        'des_id' => 'ID', 'des_name' => 'Designation',
        'of_id' => 'ID', 'of_name' => 'Office', 'of_headdesig' => 'Head of office', 'of_addr' => 'Address',
        'of_tele' => 'Telephone', 'of_tele2' => 'Telephone 2', 'of_fax' => 'Fax', 'of_email' => 'Email',
        'ser_id' => 'ID', 'ser_name' => 'Service',
        'tr_id' => 'ID', 'tr_name' => 'Programme name',
        'tf_id' => 'ID', 'tf_name' => 'Subject field',
        'trc_id' => 'ID', 'trc_name' => 'Training centre',
        'fnd_id' => 'ID', 'fnd_name' => 'Funding source',
        'fd_id' => 'ID', 'fd_name' => 'Item', 'fd_price' => 'Price',
        'lg_id' => 'ID', 'lg_office' => 'Office', 'lg_uname' => 'Username', 'lg_pwd' => 'Password', 'lg_type' => 'Role',
        'slp_id' => 'ID', 'slp_photo' => 'Photograph', 'slp_status' => 'Show on home',
        'msg_id' => 'ID', 'msg_date' => 'Date', 'msg_message' => 'Notice', 'msg_status' => 'Published',
        'dwn_id' => 'ID', 'dwn_date' => 'Date', 'dwn_name' => 'Title', 'dwn_training' => 'Related programme',
        'dwn_file' => 'File 1', 'dwn_file2' => 'File 2', 'dwn_file3' => 'File 3', 'dwn_file4' => 'File 4',
        'dwn_des' => 'Description', 'dwn_type' => 'Category',
        'uc_id' => 'ID', 'uc_name' => 'Name', 'uc_office' => 'Office', 'uc_tele' => 'Telephone',
        'uc_email' => 'Email', 'uc_comment' => 'Suggestion', 'uc_date' => 'Date', 'uc_time' => 'Time',
        'fs_id' => 'ID', 'fs_file' => 'Circular', 'fs_name' => 'Scholarship', 'fs_country' => 'Country',
        'fs_closingdate' => 'Closing date', 'fs_comment' => 'Notes',
        'apsch_id' => 'ID', 'apsch_nid' => 'National ID', 'apsch_applydate' => 'Applied on', 'apsch_name' => 'Scholarship',
        'apsch_country' => 'Country', 'apsch_depaturedate' => 'Departure', 'apsch_duration' => 'Duration', 'apsch_comment' => 'Notes',
        'sch_id' => 'ID', 'sch_nid' => 'National ID', 'sch_name' => 'Scholarship', 'sch_country' => 'Country',
        'sch_depaturedate' => 'Departure', 'sch_arrivedate' => 'Return', 'sch_duration' => 'Duration',
        'sch_spendamnt' => 'Amount spent', 'sch_comment' => 'Notes',
        'ot_id' => 'ID', 'ot_file' => 'Circular', 'ot_training' => 'Course', 'ot_institute' => 'Institute',
        'ot_closingdate' => 'Closing date', 'ot_fees' => 'Fees', 'ot_comnt' => 'Notes',
        'stf_ID' => 'ID', 'stf_Photo' => 'Photograph', 'stf_Nid' => 'National ID', 'stf_Name' => 'Name',
        'stf_dob' => 'Date of birth', 'stf_sex' => 'Gender', 'stf_desig' => 'Designation', 'stf_office' => 'Office',
        'stf_suboff' => 'Sub office', 'stf_mobile' => 'Mobile', 'stf_ofstele' => 'Office telephone', 'stf_email' => 'Email',
        'stf_desigtype' => 'Designation type', 'stf_service' => 'Service', 'stf_class' => 'Class',
        'stf_firstappdate' => 'First appointment', 'stf_cdesigdate' => 'Present designation date', 'stf_blacklisted' => 'Blacklist',
        'rp_id' => 'ID', 'rp_nid' => 'National ID', 'rp_name' => 'Name', 'rp_dob' => 'Date of birth', 'rp_gender' => 'Gender',
        'rp_desig' => 'Designation', 'rp_office' => 'Office', 'rp_mobile' => 'Mobile', 'rp_offtele' => 'Office telephone',
        'rp_hometele' => 'Home telephone', 'rp_whatsapp' => 'WhatsApp', 'rp_email' => 'Email', 'rp_phd' => 'PhD', 'rp_msc' => 'Master degree',
        'rp_degree' => 'Degree', 'rp_al' => 'Advanced level', 'rp_profq' => 'Professional qualifications',
        'rpexp' => 'Experience', 'rp_fld1' => 'Field 1', 'rp_fld2' => 'Field 2', 'rp_fld3' => 'Field 3',
        'rp_fld4' => 'Field 4', 'rp_fld5' => 'Field 5', 'rp_morefields' => 'More subject fields',
        'rp_cv' => 'CV', 'rp_certificate' => 'Certificate', 'rp_photo' => 'Photograph', 'rp_code' => 'Update code',
        'tro_id' => 'ID', 'tro_nid' => 'National ID', 'tro_name' => 'Name', 'tro_desig' => 'Designation',
        'tro_office' => 'Office', 'tro_mobile' => 'Mobile', 'tro_email' => 'Email',
        'req_id' => 'ID', 'req_adddate' => 'Date', 'req_addoffice' => 'Office', 'req_post' => 'Designation',
        'req_training' => 'Training need', 'req_noofemps' => 'Number of officers', 'req_comments' => 'Notes', 'req_isadd' => 'Added to plan',
        'trq_id' => 'ID', 'trq_sdate' => 'Opens', 'trq_edate' => 'Closes',
        'trd_id' => 'ID', 'trd_date' => 'Closing date',
        'atp_id' => 'ID', 'atp_trReqID' => 'Need ID', 'atp_requestDate' => 'Request date', 'atp_trname' => 'Programme',
        'atp_reqdesig' => 'Requested designation', 'atp_reqoffice' => 'Requesting office', 'atp_isinatp' => 'In annual plan',
        'atp_fileno' => 'File number', 'atp_subjctno' => 'Subject number', 'atp_purpose' => 'Purpose', 'atp_content' => 'Content',
        'atp_targetgroup' => 'Target group', 'atp_nooftrainings' => 'Number of programmes', 'atp_noofdays' => 'Days',
        'atp_noofparticipants' => 'Participants', 'atp_location' => 'Location',
        'atp_day1' => 'Day 1', 'atp_day2' => 'Day 2', 'atp_day3' => 'Day 3', 'atp_day4' => 'Day 4', 'atp_day5' => 'Day 5',
        'atp_day6' => 'Day 6', 'atp_day7' => 'Day 7', 'atp_day8' => 'Day 8', 'atp_day9' => 'Day 9', 'atp_day10' => 'Day 10',
        'atp_moredays' => 'More days', 'atp_moreresource' => 'More resource persons', 'atp_moresupport' => 'More support staff',
        'atp_panelno' => 'Training panel number', 'atp_supervisor' => 'Supervising officer',
        'atp_stime' => 'Start time', 'atp_etime' => 'End time', 'atp_fundsource' => 'Funding source', 'atp_bdjet' => 'Budget',
        'atp_isaddatp' => 'Added to plan', 'atp_addhome' => 'Show on home', 'atp_lastdateapply' => 'Application deadline',
        'atp_otherfacts' => 'Other facts', 'atp_specialfacts' => 'Special facts', 'atp_showspecialfacts' => 'Show special facts',
        'atp_specialfinletter' => 'Special finance letter',
        'atp_resourcep1' => 'Resource person 1', 'atp_resourcep2' => 'Resource person 2', 'atp_resourcep3' => 'Resource person 3',
        'atp_resourcep4' => 'Resource person 4', 'atp_resourcep5' => 'Resource person 5', 'atp_resourcep6' => 'Resource person 6',
        'atp_resourcep7' => 'Resource person 7', 'atp_resourcep8' => 'Resource person 8', 'atp_resourcep9' => 'Resource person 9',
        'atp_resourcep10' => 'Resource person 10',
        'atp_cashofficername' => 'Cash officer', 'atp_cashofficerdesig' => 'Cash officer designation',
        'atp_cashofficerotherdetails' => 'Cash officer details',
        'atp_supportstaff1' => 'Support staff 1', 'atp_supportstaff2' => 'Support staff 2', 'atp_supportstaff3' => 'Support staff 3',
        'atp_supportstaff4' => 'Support staff 4', 'atp_supportstaff5' => 'Support staff 5', 'atp_supportstaff6' => 'Support staff 6',
        'atp_trtype' => 'Programme type',
        'tapp_id' => 'ID', 'tapp_officerNid' => 'Officer ID', 'tapp_office' => 'Office', 'tapp_atpid' => 'Plan ID',
        'tapp_trname' => 'Programme', 'tapp_applieddate' => 'Applied on', 'tapp_trstartdate' => 'Start date',
        'tapp_isrelevent' => 'Relevant', 'tapp_priority' => 'Priority', 'tapp_accomodation' => 'Accommodation',
        'tapp_diet' => 'Diet', 'tapp_isselected' => 'Selected',
        'tratt_id' => 'ID', 'tratt_atpid' => 'Plan ID', 'tratt_atpfileno' => 'File number', 'tratt_atpname' => 'Programme',
        'tratt_startdate' => 'Start date', 'tratt_empnid' => 'Officer ID', 'tratt_isparti' => 'Participated', 'tratt_comnt' => 'Notes',
        'tratt_name' => 'Name', 'tratt_desig' => 'Designation', 'tratt_office' => 'Office', 'tratt_mobile' => 'Mobile',
        'otn_id' => 'ID', 'otn_officer' => 'Officer', 'otn_programme' => 'Programme', 'otn_date' => 'Date',
        'otn_office' => 'Office that conducted it', 'otn_days' => 'Days', 'otn_details' => 'Details',
        'ct_id' => 'ID', 'ct_atpid' => 'Plan ID', 'ct_trname' => 'Programme', 'ct_fileno' => 'File number', 'ct_subjno' => 'Subject number',
        'ct_trpurpose' => 'Purpose', 'ct_trcontent' => 'Content', 'ct_trtargetgroup' => 'Target group', 'ct_noofdays' => 'Days',
        'ct_noofparticipant' => 'Planned participants', 'ct_location' => 'Location',
        'ct_day1' => 'Day 1', 'ct_day2' => 'Day 2', 'ct_day3' => 'Day 3', 'ct_day4' => 'Day 4', 'ct_day5' => 'Day 5',
        'ct_day6' => 'Day 6', 'ct_day7' => 'Day 7', 'ct_day8' => 'Day 8', 'ct_day9' => 'Day 9', 'ct_day10' => 'Day 10',
        'ct_fundsource' => 'Funding source', 'ct_resourcepersons' => 'Resource persons',
        'ct_cashofficername' => 'Cash officer', 'ct_cashofficerdesig' => 'Cash officer designation', 'ct_cashofficerdetails' => 'Cash officer details',
        'ct_suportstaffnid1' => 'Support staff 1', 'ct_suportstaffnid2' => 'Support staff 2', 'ct_suportstaffnid3' => 'Support staff 3',
        'ct_suportstaffnid4' => 'Support staff 4', 'ct_suportstaffnid5' => 'Support staff 5', 'ct_suportstaffnid6' => 'Support staff 6',
        'ct_trtype' => 'Programme type', 'ct_noofactualparticipant' => 'Actual participants', 'ct_estimate' => 'Estimate',
        'ct_actualexpenditure' => 'Actual expenditure', 'ct_comments' => 'Notes',
        'pvtt_id' => 'ID', 'pvtt_nid' => 'National ID', 'pvtt_eduq' => 'Education', 'pvtt_othercourse' => 'Other courses',
        'pvtt_applydate' => 'Applied on', 'pvtt_cname' => 'Course', 'pvtt_cinstitute' => 'Institute',
        'pvtt_cstartdate' => 'Start', 'pvtt_cduration' => 'Duration', 'pvtt_cenddate' => 'End', 'pvtt_fees' => 'Fees',
        'pvtt_relevant' => 'Relevant', 'pvtt_approved' => 'Approved', 'pvtt_reason' => 'Reason', 'pvtt_chequeno' => 'Cheque number',
        'pvtt_chequeissuedate' => 'Cheque issued', 'pvtt_chequedate' => 'Cheque date', 'pvtt_chequebank' => 'Bank',
        'pvtt_amount' => 'Amount paid', 'pvtt_comment' => 'Notes', 'pvtt_certificatesubmit' => 'Certificate submitted',
    ];
    return $map[$column] ?? ucwords(str_replace('_', ' ', preg_replace('/^(atp|ct|stf|tapp|req|rp|tro|dwn|msg|fs|ot|pvtt|sch|apsch|lg|of|des|ser|tr|tf|trc|fnd|fd|slp|uc|trq|trd)_/i', '', $column) ?? $column));
}

function table_meta(string $table): array
{
    $registry = table_registry();
    if (!isset($registry[$table])) {
        json_out(['ok' => false, 'error' => 'Unknown record type.'], 404);
    }
    $meta = $registry[$table];
    $meta['table'] = $table;
    return $meta;
}

function can_access(array $user, string $table, string $op): bool
{
    $meta = table_meta($table);
    if (!in_array($user['role'], $meta['roles'], true)) {
        return false;
    }
    if ($op === 'read') {
        return true;
    }
    if (($meta['write'] ?? true) === false) {
        return false;
    }
    if ($user['role'] === 'User' && ($meta['user_write'] ?? true) === false) {
        return false;
    }
    return true;
}

function can_change(array $user, string $table): bool
{
    return can_access($user, $table, 'write')
        && (empty(table_meta($table)['admin_change']) || is_admin($user));
}

function describe_table(string $table): array
{
    table_meta($table);
    $safe = '`' . str_replace('`', '', $table) . '`';
    $result = db()->query('DESCRIBE ' . $safe);
    if (!$result) {
        json_out(['ok' => false, 'error' => 'Could not read the table structure.'], 500);
    }
    $columns = [];
    $primary = null;
    while ($row = $result->fetch_assoc()) {
        $columns[] = $row;
        if ($row['Key'] === 'PRI' && $primary === null) {
            $primary = $row['Field'];
        }
    }
    if ($primary === null && isset($columns[0])) {
        $primary = $columns[0]['Field'];
    }
    return ['columns' => $columns, 'primary' => $primary];
}

function office_clause(array $user, array $meta, string $alias = ''): array
{
    if ($user['role'] !== 'User' || empty($meta['office'])) {
        return ['', '', null];
    }
    $column = ($alias !== '' ? $alias . '.' : '') . '`' . $meta['office'] . '`';
    return [' AND ' . $column . ' = ? ', 's', $user['office']];
}
