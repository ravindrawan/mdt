<?php
// Database connection. The database name, user and password are set in config.php.
require_once __DIR__ . '/config.php';
require_once __DIR__ . '/security.php';

date_default_timezone_set(APP_TIMEZONE);

$db = DB_NAME;

const MDTU_SCHEMA_VERSION = 6;

$options = [
    PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    PDO::ATTR_EMULATE_PREPARES   => false,
];

$dsn = 'mysql:host=' . DB_HOST . ';port=' . DB_PORT . ';charset=utf8mb4';
try {
    $pdo = new PDO("$dsn;dbname=$db", DB_USER, DB_PASS, $options);
} catch (PDOException $e) {
    // 1049 = unknown database. Hosting accounts (cPanel) usually cannot create databases, so only try when it is missing.
    if (strpos($e->getMessage(), '1049') === false && stripos($e->getMessage(), 'Unknown database') === false) {
        throw $e;
    }
    $pdo = new PDO($dsn, DB_USER, DB_PASS, $options);
    $pdo->exec("CREATE DATABASE IF NOT EXISTS `$db` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci");
    $pdo->exec("USE `$db`");
}
// Keep MySQL timestamps (NOW(), CURRENT_TIMESTAMP) in Sri Lanka time even if the server runs in UTC
$pdo->exec("SET time_zone = '" . (new DateTime())->format('P') . "'");

mdtu_ensure_schema($pdo);

function mdtu_ensure_schema(PDO $pdo)
{
    try {
        $current = (int) $pdo->query("SELECT v FROM settings WHERE k = 'schema_version'")->fetchColumn();
        if ($current >= MDTU_SCHEMA_VERSION) {
            return;
        }
    } catch (PDOException $e) {
        // settings table does not exist yet: fresh install
    }

    $sql = file_get_contents(__DIR__ . '/databasesql.sql');
    $sql = preg_replace('/^\s*--.*$/m', '', $sql);
    foreach (array_filter(array_map('trim', explode(';', $sql))) as $statement) {
        if (preg_match('/^(CREATE\s+DATABASE|USE)\b/i', $statement)) {
            continue;
        }
        $pdo->exec($statement);
    }

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
