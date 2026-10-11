<?php
// Database connection. The database name, user and password are set in config.php.
require_once __DIR__ . '/config.php';
require_once __DIR__ . '/security.php';

date_default_timezone_set(APP_TIMEZONE);

$db = DB_NAME;

const MDTU_SCHEMA_VERSION = 8;

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
try {
    $pdo->query('SELECT 1 FROM audit_log LIMIT 0');
    mdtu_protect_audit_log($pdo);
} catch (PDOException $e) {
    // audit_log is created with the rest of the schema; a brand-new database reaches this only if that step failed
}

function mdtu_expected_tables()
{
    return ['users', 'programs', 'officers', 'training_records', 'progress_submissions', 'training_plans',
        'staff_matrix', 'resource_persons', 'notifications', 'chat_messages', 'settings', 'audit_log',
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
    mdtu_add_column($pdo, 'programs', 'fileNo', 'VARCHAR(100) NULL AFTER venue');
    mdtu_add_column($pdo, 'training_records', 'programId', 'INT NULL AFTER year');
    mdtu_add_column($pdo, 'training_records', 'venue', 'VARCHAR(255) NULL AFTER trainingName');
    mdtu_add_column($pdo, 'training_records', 'confirmedBy', 'VARCHAR(100) NULL');
    mdtu_add_column($pdo, 'training_records', 'confirmedAt', 'DATETIME NULL');
    mdtu_add_column($pdo, 'training_records', 'certSerial', 'VARCHAR(40) NULL');
    mdtu_add_column($pdo, 'training_records', 'createdAt', 'DATETIME DEFAULT CURRENT_TIMESTAMP');
    mdtu_add_column($pdo, 'training_plans', 'createdAt', 'DATETIME DEFAULT CURRENT_TIMESTAMP');
    mdtu_add_column($pdo, 'officers', 'phone', 'VARCHAR(20) NULL AFTER office');
    mdtu_add_column($pdo, 'officers', 'gender', "VARCHAR(10) NULL AFTER phone");
    mdtu_add_index($pdo, 'training_records', 'uq_cert_serial', 'UNIQUE KEY uq_cert_serial (certSerial)');
    mdtu_add_index($pdo, 'training_records', 'uq_attendance', 'UNIQUE KEY uq_attendance (nic, trainingName(191), date)');
    mdtu_add_index($pdo, 'training_records', 'idx_records_year', 'KEY idx_records_year (year)');
    mdtu_add_index($pdo, 'training_records', 'idx_records_nic', 'KEY idx_records_nic (nic)');
    mdtu_add_index($pdo, 'training_records', 'idx_records_program', 'KEY idx_records_program (programId)');

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
