<?php
// Database connection. The database name, user and password are set in config.php.
require_once __DIR__ . '/config.php';
require_once __DIR__ . '/security.php';

date_default_timezone_set(APP_TIMEZONE);

$db = DB_NAME;

const MDTU_SCHEMA_VERSION = 15;

$options = [
    PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    PDO::ATTR_EMULATE_PREPARES   => false,
];

$dsn = 'mysql:host=' . DB_HOST . ';port=' . DB_PORT . ';charset=utf8mb4';
try {
    $pdo = new PDO("$dsn;dbname=$db", DB_USER, DB_PASS, $options);
} catch (PDOException $e) {
    // 1049 = unknown database. On XAMPP we can create it. On SLT/cPanel the database
    // already exists and the account is not allowed to create another one.
    $unknown = strpos($e->getMessage(), '1049') !== false || stripos($e->getMessage(), 'Unknown database') !== false;
    if (!$unknown || stripos(PHP_OS, 'WIN') !== 0) {
        throw $e;
    }
    $pdo = new PDO($dsn, DB_USER, DB_PASS, $options);
    $pdo->exec("CREATE DATABASE IF NOT EXISTS `$db` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci");
    $pdo->exec("USE `$db`");
}
// Keep MySQL timestamps (NOW(), CURRENT_TIMESTAMP) in Sri Lanka time even if the server runs in UTC.
// A hosting account that cannot change the session time zone should still open the site.
try {
    $pdo->exec("SET time_zone = '" . (new DateTime())->format('P') . "'");
} catch (PDOException $e) {
    error_log('MDTU: could not set time_zone: ' . $e->getMessage());
}

$repaired = mdtu_repair_orphan_tables($pdo);
mdtu_ensure_schema($pdo, $repaired);
mdtu_import_officer_seed($pdo);
mdtu_import_resource_seed($pdo);
require_once __DIR__ . '/name_romanize.php';
mdtu_english_resource_names($pdo);
mdtu_import_resource_nics($pdo);
try {
    $pdo->query('SELECT 1 FROM audit_log LIMIT 0');
    mdtu_protect_audit_log($pdo);
} catch (PDOException $e) {
    // audit_log is created with the rest of the schema; a brand-new database reaches this only if that step failed
}

function mdtu_expected_tables()
{
    return ['users', 'programs', 'officers', 'training_records', 'progress_submissions', 'training_plans',
        'staff_matrix', 'resource_persons', 'staff_certs', 'notifications', 'chat_messages', 'settings', 'audit_log',
        'login_attempts', 'certificate_issues'];
}

function mdtu_is_engine_orphan(PDOException $e)
{
    $msg = $e->getMessage();
    return strpos($msg, '1932') !== false
        || strpos($msg, '1812') !== false
        || strpos($msg, '1814') !== false
        || stripos($msg, "doesn't exist in engine") !== false
        || stripos($msg, 'Tablespace is missing') !== false;
}

/**
 * XAMPP sometimes keeps the table name after InnoDB has lost the table
 * (error 1932: "doesn't exist in engine"). CREATE TABLE IF NOT EXISTS does
 * not replace that broken name, so the whole site looks like it cannot connect.
 * Drop only those broken tables. A missing table is left for the schema installer.
 */
function mdtu_repair_orphan_tables(PDO $pdo)
{
    $dropped = false;
    foreach (mdtu_expected_tables() as $table) {
        try {
            $pdo->query("SELECT 1 FROM `$table` LIMIT 0");
        } catch (PDOException $e) {
            if (!mdtu_is_engine_orphan($e)) {
                continue;
            }
            mdtu_drop_orphan_table($pdo, $table);
            $dropped = true;
        }
    }
    return $dropped;
}

function mdtu_drop_orphan_table(PDO $pdo, $table)
{
    if (!preg_match('/^[A-Za-z0-9_]+$/', $table)) {
        throw new RuntimeException('Unexpected table name.');
    }
    mdtu_copy_orphan_files($pdo, $table);
    try {
        $pdo->exec("DROP TABLE `$table`");
        return;
    } catch (PDOException $e) {
        if (!mdtu_is_engine_orphan($e)) {
            throw $e;
        }
    }
    // MariaDB refuses DROP when the table is missing from the engine.
    // On this computer the leftover .frm/.ibd files can be moved aside.
    if (stripos(PHP_OS, 'WIN') !== 0) {
        throw new RuntimeException("Table `$table` is broken in MySQL (error 1932) and could not be removed.");
    }
    $dir = mdtu_datadir($pdo);
    $moved = false;
    foreach (array_merge(
        [$table . '.frm', $table . '.ibd', $table . '.TRG', $table . '.cfg'],
        array_map('basename', glob($dir . DIRECTORY_SEPARATOR . $table . '_*.TRN') ?: [])
    ) as $file) {
        $path = $dir . DIRECTORY_SEPARATOR . $file;
        if (!is_file($path)) {
            continue;
        }
        if (!@unlink($path)) {
            throw new RuntimeException("Could not remove the broken MySQL file for `$table`. Restart MySQL from the XAMPP control panel and open the site again.");
        }
        $moved = true;
    }
    if (!$moved) {
        throw new RuntimeException("Table `$table` is broken in MySQL (error 1932) and its files were not found.");
    }
    $pdo->exec('FLUSH TABLES');
}

function mdtu_datadir(PDO $pdo)
{
    $root = rtrim(str_replace(['/', '\\'], DIRECTORY_SEPARATOR, (string) $pdo->query('SELECT @@datadir')->fetchColumn()), DIRECTORY_SEPARATOR);
    $dir = $root . DIRECTORY_SEPARATOR . DB_NAME;
    if (!is_dir($dir)) {
        throw new RuntimeException('MySQL data folder for this database was not found.');
    }
    return $dir;
}

function mdtu_exec_schema_statement(PDO $pdo, $statement)
{
    try {
        $pdo->exec($statement);
        return;
    } catch (PDOException $e) {
        // 1813 / 168: the .ibd file is still on disk after the broken table name was removed.
        $leftover = strpos($e->getMessage(), '1813') !== false
            || strpos($e->getMessage(), '168') !== false
            || stripos($e->getMessage(), 'already exists') !== false;
        if (!$leftover
            || !preg_match('/CREATE\s+TABLE\s+IF\s+NOT\s+EXISTS\s+`?([A-Za-z0-9_]+)`?/i', $statement, $m)) {
            throw $e;
        }
        mdtu_unlink_table_file($pdo, $m[1], '.ibd');
        $pdo->exec($statement);
        mdtu_import_saved_tablespace($pdo, $m[1], $statement);
    }
}

function mdtu_unlink_table_file(PDO $pdo, $table, $ext)
{
    $path = mdtu_datadir($pdo) . DIRECTORY_SEPARATOR . $table . $ext;
    if (is_file($path) && !@unlink($path)) {
        throw new RuntimeException("Could not remove the leftover MySQL file for `$table`. Restart MySQL from the XAMPP control panel and open the site again.");
    }
}

function mdtu_saved_tablespace($table)
{
    $dirs = glob(__DIR__ . '/backups/broken-tables-*', GLOB_ONLYDIR) ?: [];
    rsort($dirs);
    foreach ($dirs as $dir) {
        $path = $dir . DIRECTORY_SEPARATOR . $table . '.ibd';
        if (is_file($path)) {
            return $path;
        }
    }
    return null;
}

function mdtu_bare_table(string $table)
{
    if ($table === 'users') {
        return [
            'create' => "CREATE TABLE `users` (
                id INT AUTO_INCREMENT PRIMARY KEY,
                username VARCHAR(100) NOT NULL,
                password VARCHAR(255) NOT NULL,
                role VARCHAR(50) NOT NULL,
                mustChangePassword TINYINT(1) NOT NULL DEFAULT 0,
                passwordChangedAt DATETIME NULL,
                lastLoginAt DATETIME NULL,
                createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci",
            'indexes' => ["ALTER TABLE `users` ADD UNIQUE KEY username (username)"],
        ];
    }
    if ($table === 'programs') {
        return [
            'create' => "CREATE TABLE `programs` (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                venue VARCHAR(255) NOT NULL,
                fileNo VARCHAR(100) NULL,
                dates TEXT NOT NULL,
                firstDate DATE NOT NULL,
                hours INT NOT NULL DEFAULT 6,
                resourcePersons TEXT,
                createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci",
            'indexes' => [
                "ALTER TABLE `programs` ADD UNIQUE KEY uq_program_name_date (name(191), firstDate)",
                "ALTER TABLE `programs` ADD KEY idx_program_first_date (firstDate)",
            ],
        ];
    }
    return null;
}

function mdtu_import_saved_tablespace(PDO $pdo, $table, $createSql)
{
    if (stripos(PHP_OS, 'WIN') !== 0) {
        return;
    }
    $saved = mdtu_saved_tablespace($table);
    if ($saved === null) {
        return;
    }
    try {
        if ((int) $pdo->query("SELECT COUNT(*) FROM `$table`")->fetchColumn() > 0) {
            return;
        }
    } catch (PDOException $e) {
        return;
    }
    $bare = mdtu_bare_table($table);
    $dest = mdtu_datadir($pdo) . DIRECTORY_SEPARATOR . $table . '.ibd';
    try {
        if ($bare) {
            $pdo->exec("DROP TABLE `$table`");
            $pdo->exec($bare['create']);
        }
        $pdo->exec("ALTER TABLE `$table` DISCARD TABLESPACE");
        if (is_file($dest) && !@unlink($dest)) {
            throw new RuntimeException("Could not replace the table file for `$table`.");
        }
        if (!@copy($saved, $dest)) {
            throw new RuntimeException("Could not copy the saved table file for `$table`.");
        }
        $pdo->exec("ALTER TABLE `$table` IMPORT TABLESPACE");
        if ($bare) {
            foreach ($bare['indexes'] as $sql) {
                $pdo->exec($sql);
            }
        }
        mdtu_fix_autoincrement($pdo, $table);
    } catch (Throwable $e) {
        error_log("MDTU: could not restore `$table` from the saved table file: " . $e->getMessage());
        if ($createSql !== '') {
            try {
                $pdo->exec("DROP TABLE IF EXISTS `$table`");
            } catch (PDOException $ignored) {
            }
            if (is_file($dest)) {
                @unlink($dest);
            }
            $pdo->exec($createSql);
        }
    }
}

function mdtu_fix_autoincrement(PDO $pdo, $table)
{
    $col = $pdo->query("SHOW COLUMNS FROM `$table` WHERE Extra LIKE '%auto_increment%'")->fetch();
    if (!$col) {
        return;
    }
    $field = $col['Field'];
    $max = (int) $pdo->query("SELECT MAX(`$field`) FROM `$table`")->fetchColumn();
    if ($max > 0) {
        $pdo->exec("ALTER TABLE `$table` AUTO_INCREMENT = " . ($max + 1));
    }
}

function mdtu_copy_orphan_files(PDO $pdo, $table)
{
    if (stripos(PHP_OS, 'WIN') !== 0) {
        return;
    }
    try {
        $dir = mdtu_datadir($pdo);
    } catch (Throwable $e) {
        return;
    }
    $backup = __DIR__ . '/backups/broken-tables-' . date('Ymd');
    if (!is_dir($backup) && !@mkdir($backup, 0750, true)) {
        return;
    }
    if (!file_exists(__DIR__ . '/backups/.htaccess')) {
        @file_put_contents(__DIR__ . '/backups/.htaccess', "Require all denied\n");
    }
    foreach (glob($dir . DIRECTORY_SEPARATOR . $table . '.*') ?: [] as $path) {
        @copy($path, $backup . DIRECTORY_SEPARATOR . basename($path));
    }
}

function mdtu_person_key_local($name)
{
    $s = mb_strtolower(trim((string) $name));
    $s = str_replace('.', ' ', $s);
    $s = preg_replace('/\b(mr|mrs|ms|miss|dr|prof|rev|sir)\b/u', ' ', $s);
    $s = preg_replace('/[^\p{L}\p{N}]+/u', ' ', $s);
    return preg_replace('/\s+/u', ' ', trim($s));
}

function mdtu_merge_duplicate_resource_names(PDO $pdo)
{
    try {
        $rows = $pdo->query("SELECT id, resourcePersons FROM programs")->fetchAll();
    } catch (Throwable $e) {
        return;
    }
    $canon = [];
    $lists = [];
    foreach ($rows as $row) {
        $list = json_decode((string) $row['resourcePersons'], true) ?: [];
        $lists[$row['id']] = $list;
        foreach ($list as $name) {
            $key = mdtu_person_key_local($name);
            if ($key !== '' && !isset($canon[$key])) {
                $canon[$key] = $name;
            }
        }
    }
    $upd = $pdo->prepare("UPDATE programs SET resourcePersons = ? WHERE id = ?");
    foreach ($lists as $id => $list) {
        $next = [];
        $changed = false;
        foreach ($list as $name) {
            $key = mdtu_person_key_local($name);
            $keep = ($key !== '' && isset($canon[$key])) ? $canon[$key] : $name;
            if ($keep !== $name) {
                $changed = true;
            }
            if ($keep !== '' && !in_array($keep, $next, true)) {
                $next[] = $keep;
            }
        }
        if ($changed || count($next) !== count($list)) {
            $upd->execute([json_encode($next, JSON_UNESCAPED_UNICODE), $id]);
        }
    }
}

function mdtu_ensure_schema(PDO $pdo, $force = false)
{
    if (!$force) {
        try {
            $current = (int) $pdo->query("SELECT v FROM settings WHERE k = 'schema_version'")->fetchColumn();
            if ($current >= MDTU_SCHEMA_VERSION) {
                $have = array_flip($pdo->query('SHOW TABLES')->fetchAll(PDO::FETCH_COLUMN));
                $complete = true;
                foreach (mdtu_expected_tables() as $table) {
                    if (!isset($have[$table])) {
                        $complete = false;
                        break;
                    }
                }
                if ($complete) {
                    return;
                }
            }
        } catch (PDOException $e) {
            // settings table does not exist yet, or it was just removed as a broken table
        }
    }

    $sql = file_get_contents(__DIR__ . '/databasesql.sql');
    $sql = preg_replace('/^\s*--.*$/m', '', $sql);
    foreach (array_filter(array_map('trim', explode(';', $sql))) as $statement) {
        if (preg_match('/^(CREATE\s+DATABASE|USE)\b/i', $statement)) {
            continue;
        }
        mdtu_exec_schema_statement($pdo, $statement);
    }
    mdtu_import_saved_tablespace($pdo, 'users', '');
    mdtu_import_saved_tablespace($pdo, 'programs', '');

    // Upgrade tables created by older versions of the system
    mdtu_add_column($pdo, 'users', 'createdAt', 'DATETIME DEFAULT CURRENT_TIMESTAMP');
    mdtu_add_column($pdo, 'users', 'mustChangePassword', 'TINYINT(1) NOT NULL DEFAULT 0 AFTER role');
    mdtu_add_column($pdo, 'users', 'passwordChangedAt', 'DATETIME NULL AFTER mustChangePassword');
    mdtu_add_column($pdo, 'users', 'lastLoginAt', 'DATETIME NULL AFTER passwordChangedAt');
    mdtu_add_column($pdo, 'users', 'nic', 'VARCHAR(20) NULL AFTER role');
    mdtu_add_column($pdo, 'users', 'officerName', 'VARCHAR(255) NULL AFTER nic');
    mdtu_add_column($pdo, 'users', 'designation', 'VARCHAR(255) NULL AFTER officerName');
    mdtu_add_column($pdo, 'users', 'office', 'VARCHAR(255) NULL AFTER designation');
    mdtu_add_column($pdo, 'programs', 'fileNo', 'VARCHAR(100) NULL AFTER venue');
    mdtu_add_column($pdo, 'programs', 'coordinators', 'TEXT NULL AFTER resourcePersons');
    mdtu_add_column($pdo, 'programs', 'assistantCoordinators', 'TEXT NULL AFTER coordinators');
    mdtu_add_column($pdo, 'programs', 'kksHelpers', 'TEXT NULL AFTER assistantCoordinators');
    mdtu_add_column($pdo, 'programs', 'issueCompletion', 'TINYINT(1) NOT NULL DEFAULT 0 AFTER kksHelpers');
    mdtu_add_column($pdo, 'programs', 'issueAttendance', 'TINYINT(1) NOT NULL DEFAULT 0 AFTER issueCompletion');
    mdtu_add_column($pdo, 'resource_persons', 'nic', 'VARCHAR(20) NULL AFTER name');
    mdtu_add_column($pdo, 'certificate_issues', 'staffCertId', 'INT NULL AFTER recordId');
    mdtu_add_column($pdo, 'training_records', 'programId', 'INT NULL AFTER year');
    mdtu_add_column($pdo, 'training_records', 'venue', 'VARCHAR(255) NULL AFTER trainingName');
    mdtu_add_column($pdo, 'training_records', 'confirmedBy', 'VARCHAR(100) NULL');
    mdtu_add_column($pdo, 'training_records', 'confirmedAt', 'DATETIME NULL');
    mdtu_add_column($pdo, 'training_records', 'certSerial', 'VARCHAR(40) NULL');
    mdtu_add_column($pdo, 'training_records', 'showCompletion', 'TINYINT(1) NOT NULL DEFAULT 1');
    mdtu_add_column($pdo, 'training_records', 'showAttendance', 'TINYINT(1) NOT NULL DEFAULT 1');
    mdtu_add_column($pdo, 'training_records', 'createdAt', 'DATETIME DEFAULT CURRENT_TIMESTAMP');
    mdtu_add_column($pdo, 'training_plans', 'createdAt', 'DATETIME DEFAULT CURRENT_TIMESTAMP');
    mdtu_add_column($pdo, 'officers', 'phone', 'VARCHAR(20) NULL AFTER office');
    mdtu_add_column($pdo, 'officers', 'gender', "VARCHAR(10) NULL AFTER phone");
    mdtu_add_index($pdo, 'training_records', 'uq_cert_serial', 'UNIQUE KEY uq_cert_serial (certSerial)');
    mdtu_add_index($pdo, 'training_records', 'uq_attendance', 'UNIQUE KEY uq_attendance (nic, trainingName(191), date)');
    mdtu_add_index($pdo, 'training_records', 'idx_records_year', 'KEY idx_records_year (year)');
    mdtu_add_index($pdo, 'training_records', 'idx_records_nic', 'KEY idx_records_nic (nic)');
    mdtu_add_index($pdo, 'training_records', 'idx_records_program', 'KEY idx_records_program (programId)');
    mdtu_add_index($pdo, 'officers', 'idx_officers_name', 'KEY idx_officers_name (name(191))');
    mdtu_add_index($pdo, 'officers', 'idx_officers_office', 'KEY idx_officers_office (office(191))');
    mdtu_add_index($pdo, 'officers', 'idx_officers_designation', 'KEY idx_officers_designation (designation(191))');

    // Every record needs a unique certificate verification code for its QR code
    $missing = $pdo->query("SELECT id, year FROM training_records WHERE certSerial IS NULL OR certSerial = ''")->fetchAll();
    $upd = $pdo->prepare("UPDATE training_records SET certSerial = ? WHERE id = ?");
    foreach ($missing as $row) {
        $upd->execute([mdtu_cert_serial((int) $row['year'], (int) $row['id']), $row['id']]);
    }

    if ((int) $pdo->query("SELECT COUNT(*) FROM users")->fetchColumn() === 0) {
        $ins = $pdo->prepare("INSERT INTO users (username, password, role, mustChangePassword) VALUES (?, ?, ?, 1)");
        foreach ([['admin', 'admin'], ['superadmin', 'super'], ['officer', 'superuser']] as $u) {
            $ins->execute([$u[0], password_hash('123', PASSWORD_DEFAULT), $u[1]]);
        }
    }
    // Accounts still using the published default password must choose a new one at the next login
    $mark = $pdo->prepare("UPDATE users SET mustChangePassword = 1 WHERE id = ?");
    foreach ($pdo->query("SELECT id, password FROM users WHERE mustChangePassword = 0")->fetchAll() as $u) {
        if ($u['password'] === '123' || password_verify('123', $u['password'])) {
            $mark->execute([$u['id']]);
        }
    }

    mdtu_protect_audit_log($pdo);

    $defaults = [
        'signatoryName'  => 'Ms. S.M. Peththawadu',
        'signatoryTitle' => 'Deputy Chief Secretary (Training)',
        'orgAddress'     => 'Management Development and Training Unit, Chief Secretariat, Kurunegala',
        'orgPhone'       => '037 2222018',
        'alertText'      => 'MDTU Training Management System - Live Support & News Alerts Active.',
        'publicBaseUrl'  => '',
        'logo'           => '',
        'signature'      => 'assets/peththawadu-signature.png',
        'seal'           => '',
        'stateEmblem'    => '',
    ];
    $insSetting = $pdo->prepare("INSERT IGNORE INTO settings (k, v) VALUES (?, ?)");
    foreach ($defaults as $k => $v) {
        $insSetting->execute([$k, $v]);
    }

    mdtu_merge_duplicate_resource_names($pdo);

    $pdo->prepare("REPLACE INTO settings (k, v) VALUES ('schema_version', ?)")->execute([MDTU_SCHEMA_VERSION]);
    mdtu_audit($pdo, 'system.schema_upgrade', 'database', null, ['from' => $current ?? 0, 'to' => MDTU_SCHEMA_VERSION], 'system');
}

/**
 * A new SLT database has the tables but not the officer directory.
 * The first visit loads data/officers_seed.sql. An existing directory is left as it is.
 */
function mdtu_import_officer_seed(PDO $pdo)
{
    try {
        $flag = $pdo->query("SELECT v FROM settings WHERE k = 'officers_seeded'")->fetchColumn();
    } catch (PDOException $e) {
        return;
    }
    if ($flag === '1') {
        return;
    }
    $count = (int) $pdo->query('SELECT COUNT(*) FROM officers')->fetchColumn();
    if ($count >= 1000) {
        $pdo->exec("REPLACE INTO settings (k, v) VALUES ('officers_seeded', '1')");
        return;
    }
    $path = __DIR__ . '/data/officers_seed.sql';
    if (!is_readable($path)) {
        return;
    }
    $sql = preg_replace('/^--.*\R/m', '', file_get_contents($path));
    $pdo->beginTransaction();
    try {
        foreach (preg_split("/;\\r?\\n/", $sql) as $stmt) {
            $stmt = trim($stmt);
            if ($stmt === '' || strncmp($stmt, '--', 2) === 0) {
                continue;
            }
            $pdo->exec($stmt);
        }
        $pdo->exec("REPLACE INTO settings (k, v) VALUES ('officers_seeded', '1')");
        $pdo->commit();
    } catch (PDOException $e) {
        if ($pdo->inTransaction()) {
            $pdo->rollBack();
        }
        error_log('MDTU officer seed: ' . $e->getMessage());
    }
}

/**
 * Fill empty resource_persons.nic from data/resource_persons_nic_map.sql
 * (legacy cp_resourcepersons NICs, already converted to 12-digit form).
 * Also copies those NICs into saved program lecturer rows when missing.
 */
function mdtu_import_resource_nics(PDO $pdo)
{
    try {
        $flag = $pdo->query("SELECT v FROM settings WHERE k = 'resource_persons_nic_imported'")->fetchColumn();
    } catch (PDOException $e) {
        return;
    }
    if ($flag === '1') {
        return;
    }
    $path = __DIR__ . '/data/resource_persons_nic_map.sql';
    if (is_readable($path)) {
        $sql = preg_replace('/^--.*\R/m', '', file_get_contents($path));
        try {
            $pdo->beginTransaction();
            foreach (preg_split("/;\\r?\\n/", $sql) as $stmt) {
                $stmt = trim($stmt);
                if ($stmt === '' || strncmp($stmt, '--', 2) === 0) {
                    continue;
                }
                $pdo->exec($stmt);
            }
            $pdo->commit();
        } catch (PDOException $e) {
            if ($pdo->inTransaction()) {
                $pdo->rollBack();
            }
            error_log('MDTU resource person NIC map: ' . $e->getMessage());
        }
    }
    mdtu_fill_program_lecturer_nics($pdo);
    try {
        $pdo->exec("REPLACE INTO settings (k, v) VALUES ('resource_persons_nic_imported', '1')");
    } catch (PDOException $e) {
        error_log('MDTU resource person NIC flag: ' . $e->getMessage());
    }
}

/** Copy directory NIC/field onto program.resourcePersons JSON entries that still lack a NIC. */
function mdtu_fill_program_lecturer_nics(PDO $pdo)
{
    $byKey = [];
    foreach ($pdo->query('SELECT name, nic, field FROM resource_persons')->fetchAll(PDO::FETCH_ASSOC) as $r) {
        $key = mdtu_person_key_local($r['name']);
        if ($key === '' || trim((string) ($r['nic'] ?? '')) === '') {
            continue;
        }
        $byKey[$key] = $r;
    }
    if (!$byKey) {
        return;
    }
    $rows = $pdo->query('SELECT id, resourcePersons FROM programs')->fetchAll(PDO::FETCH_ASSOC);
    $upd = $pdo->prepare('UPDATE programs SET resourcePersons = ? WHERE id = ?');
    foreach ($rows as $row) {
        $list = json_decode((string) ($row['resourcePersons'] ?? ''), true);
        if (!is_array($list) || !$list) {
            continue;
        }
        $changed = false;
        foreach ($list as &$item) {
            if (is_string($item)) {
                $key = mdtu_person_key_local($item);
                if ($key !== '' && isset($byKey[$key])) {
                    $item = [
                        'name' => $byKey[$key]['name'],
                        'nic' => trim((string) $byKey[$key]['nic']),
                        'field' => trim((string) ($byKey[$key]['field'] ?? '')),
                    ];
                    $changed = true;
                }
                continue;
            }
            if (!is_array($item)) {
                continue;
            }
            $name = trim((string) ($item['name'] ?? ''));
            $nic = trim((string) ($item['nic'] ?? ''));
            $key = mdtu_person_key_local($name);
            if ($nic === '' && $key !== '' && isset($byKey[$key])) {
                $item['nic'] = trim((string) $byKey[$key]['nic']);
                if (trim((string) ($item['field'] ?? '')) === '' && trim((string) ($byKey[$key]['field'] ?? '')) !== '') {
                    $item['field'] = trim((string) $byKey[$key]['field']);
                }
                $changed = true;
            }
        }
        unset($item);
        if ($changed) {
            $upd->execute([json_encode($list, JSON_UNESCAPED_UNICODE), (int) $row['id']]);
        }
    }
}

/**
 * A new SLT database has the tables but not the resource-person directory.
 * The first visit loads data/resource_persons_seed.sql. An existing directory is left as it is.
 */
function mdtu_import_resource_seed(PDO $pdo)
{
    try {
        $flag = $pdo->query("SELECT v FROM settings WHERE k = 'resource_persons_seeded'")->fetchColumn();
    } catch (PDOException $e) {
        return;
    }
    if ($flag === '1') {
        return;
    }
    if ((int) $pdo->query('SELECT COUNT(*) FROM resource_persons')->fetchColumn() > 0) {
        $pdo->exec("REPLACE INTO settings (k, v) VALUES ('resource_persons_seeded', '1')");
        return;
    }
    $path = __DIR__ . '/data/resource_persons_seed.sql';
    if (!is_readable($path)) {
        return;
    }
    $sql = preg_replace('/^--.*\R/m', '', file_get_contents($path));
    $pdo->beginTransaction();
    try {
        foreach (preg_split("/;\\r?\\n/", $sql) as $stmt) {
            $stmt = trim($stmt);
            if ($stmt === '' || strncmp($stmt, '--', 2) === 0) {
                continue;
            }
            $pdo->exec($stmt);
        }
        $pdo->exec("REPLACE INTO settings (k, v) VALUES ('resource_persons_seeded', '1')");
        $pdo->commit();
    } catch (PDOException $e) {
        if ($pdo->inTransaction()) {
            $pdo->rollBack();
        }
        error_log('MDTU resource person seed: ' . $e->getMessage());
    }
}

/** Database triggers that refuse any change or deletion of audit entries (skipped if the host does not allow triggers). */
function mdtu_protect_audit_log(PDO $pdo)
{
    foreach (['UPDATE' => 'changed', 'DELETE' => 'deleted'] as $event => $word) {
        $name = 'audit_log_no_' . strtolower($event);
        $q = $pdo->prepare("SELECT COUNT(*) FROM information_schema.TRIGGERS WHERE TRIGGER_SCHEMA = DATABASE() AND TRIGGER_NAME = ?");
        $q->execute([$name]);
        if ((int) $q->fetchColumn() > 0) {
            continue;
        }
        try {
            $pdo->exec("CREATE TRIGGER `$name` BEFORE $event ON audit_log FOR EACH ROW
                SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Audit log entries cannot be $word'");
        } catch (PDOException $e) {
            error_log("MDTU: could not create trigger $name: " . $e->getMessage());
        }
    }
}

function mdtu_add_column(PDO $pdo, $table, $column, $definition)
{
    $q = $pdo->prepare("SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ? AND COLUMN_NAME = ?");
    $q->execute([$table, $column]);
    if ((int) $q->fetchColumn() === 0) {
        $pdo->exec("ALTER TABLE `$table` ADD COLUMN `$column` $definition");
    }
}

function mdtu_add_index(PDO $pdo, $table, $index, $definition)
{
    $q = $pdo->prepare("SELECT COUNT(*) FROM information_schema.STATISTICS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ? AND INDEX_NAME = ?");
    $q->execute([$table, $index]);
    if ((int) $q->fetchColumn() > 0) {
        return;
    }
    try {
        $pdo->exec("ALTER TABLE `$table` ADD $definition");
    } catch (PDOException $e) {
        // Old data may contain duplicates; the system still works without this index.
        error_log("MDTU: could not add index $index: " . $e->getMessage());
    }
}

function mdtu_cert_serial($year, $id)
{
    return sprintf('MDTU-%d-%05d-%s', $year, $id, strtoupper(bin2hex(random_bytes(2))));
}

function mdtu_staff_cert_serial($year, $id)
{
    return sprintf('MDTU-S-%d-%05d-%s', $year, $id, strtoupper(bin2hex(random_bytes(2))));
}

/** Century for old 9-digit NIC year-of-birth (YY): 00–currentYY → 20, else 19. */
function mdtu_nic_century($yy)
{
    $yy = (int) $yy;
    $nowYy = (int) (new DateTime('now', new DateTimeZone(APP_TIMEZONE)))->format('y');
    return ($yy > $nowYy) ? '19' : '20';
}

/** Convert old 9-digit+V/X NIC to the 12-digit form used in this system. */
function normalize_nic($nic)
{
    $clean = strtoupper(preg_replace('/\s+/', '', (string) $nic));
    if ($clean === '' || strpos($clean, '*') !== false) {
        return '';
    }
    if (preg_match('/^(\d{12})$/', $clean, $m)) {
        return $m[1];
    }
    if (preg_match('/^(\d{2})(\d{3})(\d{4})[VX]$/', $clean, $m)) {
        return mdtu_nic_century($m[1]) . $m[1] . $m[2] . '0' . $m[3];
    }
    $digits = preg_replace('/\D+/', '', $clean);
    if (strlen($digits) === 12) {
        return $digits;
    }
    if (strlen($digits) === 9 && (preg_match('/[VX]/', $clean) || preg_match('/^\d{9}.+/u', $clean))) {
        return mdtu_nic_century(substr($digits, 0, 2))
            . substr($digits, 0, 2) . substr($digits, 2, 3) . '0' . substr($digits, 5, 4);
    }
    return preg_replace('/[^0-9A-Z]/', '', $clean);
}

/** New 12-digit form plus old 9+V / 9+X forms so lookups work either way. */
function nic_lookup_values($nic)
{
    $n = normalize_nic($nic);
    if ($n === '') {
        return [];
    }
    $out = [$n];
    $raw = strtoupper(preg_replace('/\s+/', '', (string) $nic));
    if ($raw !== '' && $raw !== $n) {
        $out[] = $raw;
    }
    if (preg_match('/^(19|20)(\d{2})(\d{3})0(\d{4})$/', $n, $m)) {
        $body = $m[2] . $m[3] . $m[4];
        $out[] = $body . 'V';
        $out[] = $body . 'X';
    }
    if (preg_match('/^(\d{9})[VX]$/', $raw, $m)) {
        $out[] = $m[1] . 'V';
        $out[] = $m[1] . 'X';
        $out[] = normalize_nic($m[1] . 'V');
    }
    return array_values(array_unique(array_filter($out)));
}

/** Expand abbreviated / misspelt designations to full cadre titles. */
function mdtu_canonical_designation($raw)
{
    $s = trim(preg_replace('/\s+/u', ' ', (string) $raw));
    if ($s === '') {
        return '';
    }
    $s = preg_replace('/[*#«»]+/u', '', $s);
    do {
        $prev = $s;
        $s = trim(preg_replace('/\s*[\(\[][^\)\]]*[\)\]]\s*$/u', '', $s));
    } while ($s !== $prev);
    $s = trim(preg_replace('/\s*[-–—]\s*\d{4}(\s*\(.*\))?\s*$/iu', '', $s));
    $s = trim(preg_replace('/\s*[-–—]\s*(new|gt|old)\s*$/iu', '', $s));
    $lookup = strtolower(trim(preg_replace('/\s+/', ' ', str_replace('.', ' ', $s))));
    $aliases = [
        'dev officer' => 'Development Officer',
        'dev. officer' => 'Development Officer',
        'devo off' => 'Development Officer',
        'development off' => 'Development Officer',
        'development oficer' => 'Development Officer',
        'developmet officer' => 'Development Officer',
        'deverlopment officer' => 'Development Officer',
        'devolopment officer' => 'Development Officer',
        'mana ass' => 'Management Assistant',
        'mana. ass' => 'Management Assistant',
        'managment assistant' => 'Management Assistant',
        'mangement assistant' => 'Management Assistant',
        'management servise officer' => 'Management Service Officer',
        'mangement service officer' => 'Management Service Officer',
        'agri instructor' => 'Agriculture Instructor',
        'p k s' => 'Office Assistant',
        'pks' => 'Office Assistant',
        'k k s' => 'Office Assistant',
        'kks' => 'Office Assistant',
        'labrary assistant' => 'Library Assistant',
        'sanitory labourer' => 'Sanitary Labourer',
        'health labour' => 'Health Labourer',
        'co-perativedevelopmentofficer' => 'Co-operative Development Officer',
    ];
    if (isset($aliases[$lookup])) {
        return $aliases[$lookup];
    }
    $compact = str_replace(' ', '', $lookup);
    foreach ($aliases as $k => $v) {
        if (str_replace(' ', '', $k) === $compact) {
            return $v;
        }
    }
    return $s;
}

/** Roll Ayurveda sub-units + spelling twins into one office name. */
function mdtu_canonical_office($raw)
{
    $s = trim(preg_replace('/\s+/u', ' ', (string) $raw));
    if ($s === '') {
        return '';
    }
    $s = str_ireplace(['Personel', 'Duputy', 'Departhment'], ['Personnel', 'Deputy', 'Department'], $s);
    $fp = strtolower(str_replace('&', ' and ', $s));
    $fp = trim(preg_replace('/\s+/u', ' ', preg_replace('/[^\p{L}\p{N}\s]+/u', ' ', $fp)));
    if ($fp === '') {
        return $s;
    }
    $isAyur = (bool) preg_match('/ayurveda|ayurvedic|ආයුර්වේද/u', $fp);
    if ($isAyur) {
        if (preg_match('/^department of (provincial )?ayurveda$/u', $fp)
            || preg_match('/dispensary|hospital|drugs? manufacturing|welagedara|central dispensary/u', $fp)
            || preg_match('/^department of (provincial )?ayurveda /u', $fp)
            || preg_match('/^ayurveda (central )?dispensary/u', $fp)
            || preg_match('/^ayurveda hospital/u', $fp)) {
            return 'Department of Provincial Ayurveda';
        }
    }
    $aliases = [
        'department of ayurveda' => 'Department of Provincial Ayurveda',
        'department of provincial ayurveda' => 'Department of Provincial Ayurveda',
        'duputy chief secretarys officepersoneltraining' => "Deputy Chief Secretary's Office (Personnel & Training)",
        'deputy chief secretarys office personnel training' => "Deputy Chief Secretary's Office (Personnel & Training)",
        'deputy chief secretarys office personel training' => "Deputy Chief Secretary's Office (Personnel & Training)",
    ];
    if (isset($aliases[$fp])) {
        return $aliases[$fp];
    }
    $glued = str_replace(' ', '', $fp);
    foreach ($aliases as $k => $v) {
        if (str_replace(' ', '', $k) === $glued) {
            return $v;
        }
    }
    return $s;
}

/** Map CSV / form gender text (Sinhala or English) to Male|Female|null. */
function mdtu_map_officer_gender($raw)
{
    $g = trim((string) $raw);
    if ($g === '') {
        return null;
    }
    if ($g === 'Male' || $g === 'Female') {
        return $g;
    }
    $u = mb_strtolower($g, 'UTF-8');
    if (strpos($u, 'female') !== false || strpos($u, 'ස්ත්') !== false || $u === 'f') {
        return 'Female';
    }
    if (strpos($u, 'male') !== false || strpos($u, 'පුරුෂ') !== false || $u === 'm') {
        return 'Male';
    }
    return null;
}

/**
 * Upsert one officer from karyamandala-style row.
 * Uses National ID + Old National ID so old/new forms merge to one 12-digit row (no duplicates).
 * Remaps training_records / staff_certs / users NIC keys to the canonical 12-digit form.
 *
 * @return string 'inserted'|'updated'|'skipped'
 */
function mdtu_upsert_officer_import(PDO $pdo, array $row)
{
    $rawNew = strtoupper(preg_replace('/\s+/', '', (string) ($row['nic'] ?? $row['nationalId'] ?? '')));
    $rawOld = strtoupper(preg_replace('/\s+/', '', (string) ($row['oldNic'] ?? $row['oldNationalId'] ?? '')));
    $name = trim((string) ($row['name'] ?? ''));
    if ($name === '') {
        return 'skipped';
    }

    $canon = normalize_nic($rawNew !== '' ? $rawNew : $rawOld);
    if ($canon === '' || !preg_match('/^\d{12}$/', $canon)) {
        // Prefer explicit 12-digit National ID even if normalize failed oddly
        if (preg_match('/^\d{12}$/', $rawNew)) {
            $canon = $rawNew;
        } elseif (preg_match('/^\d{12}$/', normalize_nic($rawOld))) {
            $canon = normalize_nic($rawOld);
        } else {
            return 'skipped';
        }
    }

    $candidates = array_values(array_unique(array_filter(array_merge(
        nic_lookup_values($rawNew),
        nic_lookup_values($rawOld),
        nic_lookup_values($canon),
        [$rawNew, $rawOld, $canon]
    ))));
    if (!$candidates) {
        return 'skipped';
    }

    $ph = implode(',', array_fill(0, count($candidates), '?'));
    $st = $pdo->prepare("SELECT nic, name, designation, office, phone, gender FROM officers WHERE nic IN ($ph)");
    $st->execute($candidates);
    $existing = $st->fetchAll(PDO::FETCH_ASSOC);

    $designation = mdtu_canonical_designation(trim((string) ($row['designation'] ?? '')));
    $office = mdtu_canonical_office(trim((string) ($row['office'] ?? '')));
    $phone = preg_replace('/[^\d+]/', '', (string) ($row['phone'] ?? ''));
    if (strlen($phone) > 20) {
        $phone = substr($phone, 0, 20);
    }
    $gender = mdtu_map_officer_gender($row['gender'] ?? '');

    $merged = [
        'name' => $name,
        'designation' => $designation,
        'office' => $office,
        'phone' => $phone,
        'gender' => $gender,
    ];
    foreach ($existing as $ex) {
        foreach (['name', 'designation', 'office', 'phone', 'gender'] as $f) {
            if (($merged[$f] === null || $merged[$f] === '') && trim((string) ($ex[$f] ?? '')) !== '') {
                $merged[$f] = $ex[$f];
            }
        }
    }

    $ins = $pdo->prepare("INSERT INTO officers (nic, name, designation, office, phone, gender) VALUES (?, ?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE
            name = VALUES(name),
            designation = IF(VALUES(designation) IS NULL OR VALUES(designation) = '', designation, VALUES(designation)),
            office = IF(VALUES(office) IS NULL OR VALUES(office) = '', office, VALUES(office)),
            phone = IF(VALUES(phone) IS NULL OR VALUES(phone) = '', phone, VALUES(phone)),
            gender = IF(VALUES(gender) IS NULL OR VALUES(gender) = '', gender, VALUES(gender))");
    $ins->execute([
        $canon,
        mb_substr($merged['name'], 0, 255, 'UTF-8'),
        $merged['designation'] !== '' ? mb_substr($merged['designation'], 0, 255, 'UTF-8') : null,
        $merged['office'] !== '' ? mb_substr($merged['office'], 0, 255, 'UTF-8') : null,
        $merged['phone'] !== '' ? $merged['phone'] : null,
        $merged['gender'],
    ]);

    $wasNew = !$existing;
    $oldKeys = [];
    foreach ($existing as $ex) {
        if ($ex['nic'] !== $canon) {
            $oldKeys[] = $ex['nic'];
        }
    }
    // Also remap any candidate keys that are not the canonical row
    foreach ($candidates as $c) {
        if ($c !== $canon) {
            $oldKeys[] = $c;
        }
    }
    $oldKeys = array_values(array_unique($oldKeys));

    if ($oldKeys) {
        $phOld = implode(',', array_fill(0, count($oldKeys), '?'));
        $params = array_merge([$canon], $oldKeys);
        try {
            $pdo->prepare("UPDATE training_records SET nic = ? WHERE nic IN ($phOld)")->execute($params);
        } catch (PDOException $e) {
            // Unique (nic, trainingName, date) clash: drop obsolete key rows only after remap attempt
        }
        try {
            $pdo->prepare("UPDATE staff_certs SET nic = ? WHERE nic IN ($phOld)")->execute($params);
        } catch (PDOException $e) {
        }
        try {
            $pdo->prepare("UPDATE users SET nic = ? WHERE nic IN ($phOld)")->execute($params);
        } catch (PDOException $e) {
        }
        $pdo->prepare("DELETE FROM officers WHERE nic IN ($phOld) AND nic <> ?")->execute(array_merge($oldKeys, [$canon]));
    }

    return $wasNew ? 'inserted' : 'updated';
}

function mdtu_officer_by_nic(PDO $pdo, $nic)
{
    $vals = nic_lookup_values($nic);
    if (!$vals) {
        return null;
    }
    $ph = implode(',', array_fill(0, count($vals), '?'));
    $st = $pdo->prepare("SELECT nic, name, designation, office, phone, gender FROM officers WHERE nic IN ($ph) LIMIT 1");
    $st->execute($vals);
    $row = $st->fetch();
    return $row ?: null;
}

/**
 * Permanent designation + office for staff attendance certificates.
 * Prefer officers master data (e.g. Development Officer + office name).
 * Lecturers with no master record get designation "Lecturer" only.
 */
function mdtu_staff_posting_from_db(PDO $pdo, $nic, $role, $fallbackName = '', $fallbackDesig = '', $fallbackOffice = '')
{
    $officer = mdtu_officer_by_nic($pdo, $nic);
    $name = trim((string) ($officer['name'] ?? ''));
    $desig = trim((string) ($officer['designation'] ?? ''));
    $office = trim((string) ($officer['office'] ?? ''));
    if ($name === '') {
        $name = trim((string) $fallbackName);
    }
    if ($role === 'lecturer') {
        if ($desig === '') {
            $desig = 'Lecturer';
        }
    } elseif ($role === 'kks') {
        // Permanent post from officer directory; fallback label if directory has none.
        if ($desig === '') {
            $desig = trim((string) $fallbackDesig);
            if ($desig === '') {
                $desig = 'කම්කරු (KKS)';
            }
        }
        if (function_exists('mdtu_canonical_designation')) {
            $canon = mdtu_canonical_designation($desig);
            if ($canon !== '') {
                $desig = $canon;
            }
        }
        if ($office === '') {
            $office = trim((string) $fallbackOffice);
        }
        if (function_exists('mdtu_canonical_office') && $office !== '') {
            $office = mdtu_canonical_office($office) ?: $office;
        }
    } else {
        if ($desig === '') {
            $desig = trim((string) $fallbackDesig);
            if ($desig === '') {
                $desig = $role === 'assistant' ? 'Assistant Coordinating Officer' : 'Training Coordinating Officer';
            }
        }
        if ($office === '') {
            $office = trim((string) $fallbackOffice);
        }
    }
    return ['name' => $name, 'designation' => $desig, 'office' => $office];
}
