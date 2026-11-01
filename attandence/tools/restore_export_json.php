<?php
/**
 * Full restore from a browser "Export all" JSON (MDTU_Backup_*.json)
 * into the local MySQL database configured in config.php / db.php.
 *
 * Usage:
 *   php tools/restore_export_json.php "C:\path\to\MDTU_Backup_....json"
 *
 * Note: export_all does not include password hashes. Matching usernames keep
 * the current DB password; new accounts get temporary password "123" and
 * mustChangePassword=1.
 */
declare(strict_types=1);

$path = $argv[1] ?? '';
if ($path === '' || !is_file($path)) {
    fwrite(STDERR, "Usage: php tools/restore_export_json.php <MDTU_Backup.json>\n");
    exit(1);
}

echo "Loading backup: $path\n";
$raw = file_get_contents($path);
if ($raw === false) {
    fwrite(STDERR, "Cannot read file.\n");
    exit(1);
}
$data = json_decode($raw, true);
if (!is_array($data) || empty($data['tables']) || !is_array($data['tables'])) {
    fwrite(STDERR, "Invalid backup JSON (expected tables object).\n");
    exit(1);
}
$tables = $data['tables'];
echo 'Exported at: ' . ($data['exportedAt'] ?? '?') . PHP_EOL;

require dirname(__DIR__) . '/db.php';

/** @var PDO $pdo */

function mdtu_table_columns(PDO $pdo, string $table): array
{
    $cols = [];
    foreach ($pdo->query("SHOW COLUMNS FROM `$table`") as $row) {
        $cols[$row['Field']] = $row;
    }
    return $cols;
}

function mdtu_truncate(PDO $pdo, string $table): void
{
    // Prefer TRUNCATE (resets AI). Audit-log delete triggers require a temporary drop.
    if ($table === 'audit_log') {
        $pdo->exec('DROP TRIGGER IF EXISTS audit_log_no_delete');
        $pdo->exec('DROP TRIGGER IF EXISTS audit_log_no_update');
    }
    try {
        $pdo->exec("TRUNCATE TABLE `$table`");
    } catch (Throwable $e) {
        $pdo->exec("DELETE FROM `$table`");
        try {
            $pdo->exec("ALTER TABLE `$table` AUTO_INCREMENT = 1");
        } catch (Throwable $e2) {
            // ignore
        }
    }
}

function mdtu_insert_rows(PDO $pdo, string $table, array $rows, array $columnMeta, array $defaults = []): int
{
    if (!$rows) {
        return 0;
    }
    $allowed = array_keys($columnMeta);
    $n = 0;
    $batch = [];
    $flush = function () use ($pdo, $table, &$batch, &$n) {
        if (!$batch) {
            return;
        }
        // rows may have different column sets; insert one-by-one for safety with mixed schemas
        foreach ($batch as $row) {
            $cols = array_keys($row);
            $placeholders = implode(',', array_fill(0, count($cols), '?'));
            $sql = 'INSERT INTO `' . $table . '` (`' . implode('`,`', $cols) . '`) VALUES (' . $placeholders . ')';
            $pdo->prepare($sql)->execute(array_values($row));
            $n++;
        }
        $batch = [];
    };

    foreach ($rows as $row) {
        if (!is_array($row)) {
            continue;
        }
        $clean = [];
        foreach ($allowed as $col) {
            if (array_key_exists($col, $row)) {
                $clean[$col] = $row[$col];
            } elseif (array_key_exists($col, $defaults)) {
                $clean[$col] = $defaults[$col];
            }
        }
        if (!$clean) {
            continue;
        }
        $batch[] = $clean;
        if (count($batch) >= 200) {
            $flush();
            echo "  ... $table: $n rows\n";
        }
    }
    $flush();
    return $n;
}

// Preserve passwords for usernames that already exist locally
$existingPasswords = [];
foreach ($pdo->query('SELECT username, password FROM users') as $u) {
    $existingPasswords[strtolower((string) $u['username'])] = $u['password'];
}

$orderClear = [
    'certificate_issues',
    'staff_certs',
    'audit_log',
    'chat_messages',
    'notifications',
    'progress_submissions',
    'training_plans',
    'training_records',
    'programs',
    'staff_matrix',
    'resource_persons',
    'officers',
    'login_attempts',
];

// TRUNCATE / ALTER cause implicit commits in MySQL — do not wrap the whole restore in one transaction.
try {
    $pdo->exec('SET FOREIGN_KEY_CHECKS=0');
    $pdo->exec('SET UNIQUE_CHECKS=0');

    echo "Clearing tables...\n";
    foreach ($orderClear as $t) {
        try {
            mdtu_truncate($pdo, $t);
            echo "  cleared $t\n";
        } catch (Throwable $e) {
            echo "  skip clear $t: " . $e->getMessage() . "\n";
        }
    }

    // Settings: replace all except schema_version (keep current schema)
    $schemaVersion = (string) $pdo->query("SELECT v FROM settings WHERE k='schema_version'")->fetchColumn();
    $auditHead = (string) $pdo->query("SELECT v FROM settings WHERE k='audit_head'")->fetchColumn();
    $pdo->exec("DELETE FROM settings");
    $setIns = $pdo->prepare('REPLACE INTO settings (k, v) VALUES (?, ?)');
    $settings = $tables['settings'] ?? [];
    if (is_array($settings)) {
        // export_all stores settings as {k: v} map
        $isMap = $settings && array_keys($settings) !== range(0, count($settings) - 1);
        if ($isMap) {
            foreach ($settings as $k => $v) {
                if ($k === 'schema_version' || $k === 'audit_head') {
                    continue;
                }
                $setIns->execute([(string) $k, is_scalar($v) || $v === null ? (string) $v : json_encode($v, JSON_UNESCAPED_UNICODE)]);
            }
        } else {
            foreach ($settings as $row) {
                if (!is_array($row) || !isset($row['k'])) {
                    continue;
                }
                if ($row['k'] === 'schema_version' || $row['k'] === 'audit_head') {
                    continue;
                }
                $setIns->execute([(string) $row['k'], (string) ($row['v'] ?? '')]);
            }
        }
    }
    if ($schemaVersion !== '') {
        $setIns->execute(['schema_version', $schemaVersion]);
    }
    if ($auditHead !== '') {
        $setIns->execute(['audit_head', $auditHead]);
    }
    echo "  settings restored\n";

    // Users
    mdtu_truncate($pdo, 'users');
    $userCols = mdtu_table_columns($pdo, 'users');
    $tempHash = password_hash('123', PASSWORD_DEFAULT);
    $userRows = [];
    foreach ((array) ($tables['users'] ?? []) as $u) {
        if (!is_array($u) || empty($u['username'])) {
            continue;
        }
        $uname = (string) $u['username'];
        $key = strtolower($uname);
        $row = [
            'id' => $u['id'] ?? null,
            'username' => $uname,
            'password' => $existingPasswords[$key] ?? $tempHash,
            'role' => $u['role'] ?? 'admin',
            'nic' => $u['nic'] ?? null,
            'officerName' => $u['officerName'] ?? null,
            'designation' => $u['designation'] ?? null,
            'office' => $u['office'] ?? null,
            'mustChangePassword' => isset($existingPasswords[$key])
                ? (int) ($u['mustChangePassword'] ?? 0)
                : 1,
            'passwordChangedAt' => $u['passwordChangedAt'] ?? null,
            'lastLoginAt' => $u['lastLoginAt'] ?? null,
            'createdAt' => $u['createdAt'] ?? null,
        ];
        if (!isset($existingPasswords[$key])) {
            echo "  user {$uname}: temporary password 123 (must change)\n";
        } else {
            echo "  user {$uname}: kept existing password hash\n";
        }
        $userRows[] = $row;
    }
    $n = mdtu_insert_rows($pdo, 'users', $userRows, $userCols);
    echo "  users: $n\n";

    $dataTables = [
        'programs' => [],
        'officers' => [],
        'training_records' => [
            'showCompletion' => 1,
            'showAttendance' => 1,
        ],
        'progress_submissions' => [],
        'training_plans' => [],
        'staff_matrix' => [],
        'resource_persons' => [],
        'staff_certs' => [],
        'notifications' => [],
        'chat_messages' => [],
        'certificate_issues' => [],
        'audit_log' => [],
    ];

    foreach ($dataTables as $table => $defaults) {
        $rows = $tables[$table] ?? [];
        if (!is_array($rows)) {
            $rows = [];
        }
        echo "Restoring $table (" . count($rows) . " in backup)...\n";
        $cols = mdtu_table_columns($pdo, $table);
        $n = mdtu_insert_rows($pdo, $table, $rows, $cols, $defaults);
        echo "  inserted $n\n";
    }

    if (function_exists('mdtu_protect_audit_log')) {
        mdtu_protect_audit_log($pdo);
    }
    $pdo->exec('SET UNIQUE_CHECKS=1');
    $pdo->exec('SET FOREIGN_KEY_CHECKS=1');
} catch (Throwable $e) {
    try {
        $pdo->exec('SET UNIQUE_CHECKS=1');
        $pdo->exec('SET FOREIGN_KEY_CHECKS=1');
        if (function_exists('mdtu_protect_audit_log')) {
            mdtu_protect_audit_log($pdo);
        }
    } catch (Throwable $e2) {
    }
    fwrite(STDERR, 'RESTORE FAILED: ' . $e->getMessage() . PHP_EOL);
    exit(1);
}

echo "\n=== Final counts ===\n";
foreach (array_merge(['users', 'settings'], array_keys($dataTables)) as $t) {
    echo "$t: " . $pdo->query("SELECT COUNT(*) FROM `$t`")->fetchColumn() . PHP_EOL;
}
echo "\nDone. Backup data is now in the local database.\n";
echo "New accounts without a saved password use temporary password: 123 (forced change on login).\n";
echo "Accounts that already existed locally kept their previous password.\n";
