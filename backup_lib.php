<?php
/**
 * Full database backup helpers — SQL + JSON, daily 16:00, retention rules.
 */

declare(strict_types=1);

function backup_dir(): string
{
    $dir = __DIR__ . DIRECTORY_SEPARATOR . 'backups';
    if (!is_dir($dir)) {
        @mkdir($dir, 0755, true);
    }
    $deny = $dir . DIRECTORY_SEPARATOR . '.htaccess';
    if (!is_file($deny)) {
        @file_put_contents($deny, "Require all denied\nDeny from all\n");
    }
    $index = $dir . DIRECTORY_SEPARATOR . 'index.html';
    if (!is_file($index)) {
        @file_put_contents($index, '');
    }
    return $dir;
}

function backup_db_name(): string
{
    $name = '';
    $result = db()->query('SELECT DATABASE() AS d');
    if ($result) {
        $row = $result->fetch_assoc();
        $name = trim((string) ($row['d'] ?? ''));
        $result->free();
    }
    return $name !== '' ? $name : (getenv('MDTU_DB_NAME') ?: 'mdtunwgo_mdtu');
}

function backup_keep_until(DateTimeImmutable $created): DateTimeImmutable
{
    // Friday 16:00 backup stays until Tuesday 16:00.
    if ((int) $created->format('N') === 5) {
        return $created->modify('next tuesday')->setTime(16, 0, 0);
    }
    // Other days: delete after 2 days (same clock time).
    return $created->modify('+2 days');
}

function backup_stamp(DateTimeImmutable $when): string
{
    return $when->format('Y-m-d');
}

function backup_paths(string $stamp): array
{
    $base = backup_dir() . DIRECTORY_SEPARATOR . 'mdtu-full-' . $stamp;
    return [
        'stamp' => $stamp,
        'base' => $base,
        'sql' => $base . '.sql',
        'json' => $base . '.json',
        'meta' => $base . '.meta.json',
    ];
}

function backup_sql_escape(string $value): string
{
    return db()->real_escape_string($value);
}

function backup_write_sql(string $path): int
{
    $db = db();
    $name = backup_db_name();
    $fh = fopen($path, 'wb');
    if (!$fh) {
        throw new RuntimeException('SQL backup file could not be created.');
    }
    $bytes = 0;
    $write = static function (string $chunk) use ($fh, &$bytes): void {
        $n = fwrite($fh, $chunk);
        if ($n === false) {
            throw new RuntimeException('SQL backup write failed.');
        }
        $bytes += $n;
    };
    $write("-- MDTU full database backup\n");
    $write('-- Created: ' . date('c') . "\n");
    $write('-- Database: ' . $name . "\n");
    $write("SET NAMES latin1;\nSET FOREIGN_KEY_CHECKS=0;\n\n");
    $tables = [];
    $result = $db->query('SHOW TABLES');
    if ($result) {
        while ($row = $result->fetch_row()) {
            $tables[] = (string) $row[0];
        }
        $result->free();
    }
    foreach ($tables as $table) {
        if (!preg_match('/^[A-Za-z0-9_]+$/', $table)) {
            continue;
        }
        $create = $db->query('SHOW CREATE TABLE `' . $table . '`');
        $createRow = $create ? $create->fetch_assoc() : null;
        if ($create) {
            $create->free();
        }
        $ddl = (string) ($createRow['Create Table'] ?? $createRow['Create View'] ?? '');
        if ($ddl === '') {
            continue;
        }
        $write("DROP TABLE IF EXISTS `{$table}`;\n");
        $write($ddl . ";\n\n");
        $data = $db->query('SELECT * FROM `' . $table . '`', MYSQLI_USE_RESULT);
        if (!$data) {
            continue;
        }
        $fields = $data->fetch_fields();
        $cols = [];
        foreach ($fields as $field) {
            $cols[] = '`' . $field->name . '`';
        }
        $colSql = implode(', ', $cols);
        $batch = [];
        $flush = static function () use (&$batch, $write, $table, $colSql): void {
            if (!$batch) {
                return;
            }
            $write("INSERT INTO `{$table}` ({$colSql}) VALUES\n" . implode(",\n", $batch) . ";\n");
            $batch = [];
        };
        while ($row = $data->fetch_assoc()) {
            $vals = [];
            foreach ($row as $value) {
                if ($value === null) {
                    $vals[] = 'NULL';
                } else {
                    $vals[] = "'" . backup_sql_escape((string) $value) . "'";
                }
            }
            $batch[] = '(' . implode(',', $vals) . ')';
            if (count($batch) >= 80) {
                $flush();
            }
        }
        $flush();
        $data->free();
        $write("\n");
    }
    $write("SET FOREIGN_KEY_CHECKS=1;\n");
    fclose($fh);
    return $bytes;
}

function backup_write_json(string $path): int
{
    $db = db();
    $fh = fopen($path, 'wb');
    if (!$fh) {
        throw new RuntimeException('JSON backup file could not be created.');
    }
    $bytes = 0;
    $write = static function (string $chunk) use ($fh, &$bytes): void {
        $n = fwrite($fh, $chunk);
        if ($n === false) {
            throw new RuntimeException('JSON backup write failed.');
        }
        $bytes += $n;
    };
    $write("{\n");
    $write('  "created": ' . json_encode(date('c'), JSON_UNESCAPED_UNICODE) . ",\n");
    $write('  "database": ' . json_encode(backup_db_name(), JSON_UNESCAPED_UNICODE) . ",\n");
    $write("  \"tables\": {\n");
    $tables = [];
    $result = $db->query('SHOW TABLES');
    if ($result) {
        while ($row = $result->fetch_row()) {
            $tables[] = (string) $row[0];
        }
        $result->free();
    }
    $firstTable = true;
    foreach ($tables as $table) {
        if (!preg_match('/^[A-Za-z0-9_]+$/', $table)) {
            continue;
        }
        if (!$firstTable) {
            $write(",\n");
        }
        $firstTable = false;
        $write('    ' . json_encode($table, JSON_UNESCAPED_UNICODE) . ": [\n");
        $data = $db->query('SELECT * FROM `' . $table . '`', MYSQLI_USE_RESULT);
        $firstRow = true;
        if ($data) {
            while ($row = $data->fetch_assoc()) {
                if (!$firstRow) {
                    $write(",\n");
                }
                $firstRow = false;
                $write('      ' . json_encode($row, JSON_UNESCAPED_UNICODE | JSON_INVALID_UTF8_SUBSTITUTE));
            }
            $data->free();
        }
        $write("\n    ]");
    }
    $write("\n  }\n}\n");
    fclose($fh);
    return $bytes;
}

function backup_create(?DateTimeImmutable $when = null, string $reason = 'auto'): array
{
    @set_time_limit(0);
    @ini_set('memory_limit', '1024M');
    $when = $when ?? new DateTimeImmutable('now');
    $stamp = backup_stamp($when);
    $paths = backup_paths($stamp);
    $sqlBytes = backup_write_sql($paths['sql']);
    $jsonBytes = backup_write_json($paths['json']);
    $keep = backup_keep_until($when);
    $meta = [
        'stamp' => $stamp,
        'created' => $when->format('c'),
        'weekday' => (int) $when->format('N'),
        'reason' => $reason,
        'keepUntil' => $keep->format('c'),
        'sqlBytes' => $sqlBytes,
        'jsonBytes' => $jsonBytes,
        'database' => backup_db_name(),
    ];
    file_put_contents($paths['meta'], json_encode($meta, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT));
    backup_purge_expired();
    return $meta + ['sql' => basename($paths['sql']), 'json' => basename($paths['json'])];
}

function backup_read_meta(string $metaPath): ?array
{
    if (!is_file($metaPath)) {
        return null;
    }
    $raw = json_decode((string) file_get_contents($metaPath), true);
    return is_array($raw) ? $raw : null;
}

function backup_purge_expired(): int
{
    $now = new DateTimeImmutable('now');
    $removed = 0;
    foreach (glob(backup_dir() . DIRECTORY_SEPARATOR . 'mdtu-full-*.meta.json') ?: [] as $metaPath) {
        $meta = backup_read_meta($metaPath);
        $keepUntil = isset($meta['keepUntil']) ? date_create_immutable((string) $meta['keepUntil']) : null;
        if (!$keepUntil) {
            // Fallback from stamp + weekday.
            $stamp = (string) ($meta['stamp'] ?? '');
            if (preg_match('/^\d{4}-\d{2}-\d{2}$/', $stamp)) {
                $created = date_create_immutable($stamp . ' 16:00:00') ?: null;
                $keepUntil = $created ? backup_keep_until($created) : null;
            }
        }
        if (!$keepUntil || $keepUntil > $now) {
            continue;
        }
        $base = preg_replace('/\.meta\.json$/', '', $metaPath) ?? $metaPath;
        foreach ([$metaPath, $base . '.sql', $base . '.json'] as $file) {
            if (is_file($file) && @unlink($file)) {
                $removed++;
            }
        }
    }
    return $removed;
}

function backup_list(): array
{
    backup_purge_expired();
    $items = [];
    foreach (glob(backup_dir() . DIRECTORY_SEPARATOR . 'mdtu-full-*.meta.json') ?: [] as $metaPath) {
        $meta = backup_read_meta($metaPath) ?? [];
        $base = preg_replace('/\.meta\.json$/', '', $metaPath) ?? '';
        $sql = $base . '.sql';
        $json = $base . '.json';
        $stamp = (string) ($meta['stamp'] ?? basename($base, ''));
        if (!preg_match('/\d{4}-\d{2}-\d{2}/', $stamp, $found)) {
            continue;
        }
        $stamp = $found[0];
        $items[] = [
            'stamp' => $stamp,
            'created' => (string) ($meta['created'] ?? ''),
            'keepUntil' => (string) ($meta['keepUntil'] ?? ''),
            'reason' => (string) ($meta['reason'] ?? ''),
            'weekday' => (int) ($meta['weekday'] ?? 0),
            'sqlBytes' => (int) ($meta['sqlBytes'] ?? (is_file($sql) ? filesize($sql) : 0)),
            'jsonBytes' => (int) ($meta['jsonBytes'] ?? (is_file($json) ? filesize($json) : 0)),
            'hasSql' => is_file($sql),
            'hasJson' => is_file($json),
        ];
    }
    usort($items, static fn (array $a, array $b): int => strcmp((string) $b['stamp'], (string) $a['stamp']));
    return $items;
}

function backup_file_for(string $stamp, string $kind): ?string
{
    if (!preg_match('/^\d{4}-\d{2}-\d{2}$/', $stamp)) {
        return null;
    }
    $paths = backup_paths($stamp);
    $path = $kind === 'json' ? $paths['json'] : $paths['sql'];
    return is_file($path) ? $path : null;
}

function backup_today_exists(?DateTimeImmutable $when = null): bool
{
    $when = $when ?? new DateTimeImmutable('now');
    $paths = backup_paths(backup_stamp($when));
    return is_file($paths['sql']) && is_file($paths['json']) && is_file($paths['meta']);
}

/**
 * After 16:00, ensure today's full backup exists. Safe to call often.
 */
function backup_maybe_auto(): ?array
{
    static $checked = false;
    if ($checked) {
        return null;
    }
    $checked = true;
    try {
        backup_purge_expired();
        $now = new DateTimeImmutable('now');
        if ((int) $now->format('G') < 16) {
            return null;
        }
        if (backup_today_exists($now)) {
            return null;
        }
        return backup_create($now->setTime(16, 0, 0), 'auto-16:00');
    } catch (Throwable $e) {
        return null;
    }
}
