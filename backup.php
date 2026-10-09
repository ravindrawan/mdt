<?php
// Automatic server-side backups. One full copy of the database is written per day to backups/.
// Daily copies are kept for MDTU_BACKUP_KEEP_DAYS days; the first copy of every month is kept forever.

const MDTU_BACKUP_KEEP_DAYS = 40;
const MDTU_BACKUP_DIR = __DIR__ . '/backups';
const MDTU_BACKUP_TABLES = ['users', 'programs', 'training_records', 'officers', 'progress_submissions', 'training_plans',
    'staff_matrix', 'resource_persons', 'notifications', 'chat_messages', 'settings', 'certificate_issues', 'audit_log'];

const BACKUPS_HTACCESS = <<<'HTACCESS'
# Backups contain the whole database: never serve them directly
<IfModule mod_authz_core.c>
    Require all denied
</IfModule>
<IfModule !mod_authz_core.c>
    Order allow,deny
    Deny from all
</IfModule>

HTACCESS;

function mdtu_backup_prepare_dir()
{
    if (!is_dir(MDTU_BACKUP_DIR) && !@mkdir(MDTU_BACKUP_DIR, 0750, true)) {
        return false;
    }
    if (!file_exists(MDTU_BACKUP_DIR . '/.htaccess')) {
        @file_put_contents(MDTU_BACKUP_DIR . '/.htaccess', BACKUPS_HTACCESS);
    }
    if (!file_exists(MDTU_BACKUP_DIR . '/index.html')) {
        @file_put_contents(MDTU_BACKUP_DIR . '/index.html', '');
    }
    return is_writable(MDTU_BACKUP_DIR);
}

function mdtu_backup_ext()
{
    return function_exists('gzopen') ? '.json.gz' : '.json';
}

/** Creates today's backup if it does not exist yet. Cheap to call on every page load. */
function mdtu_auto_backup(PDO $pdo)
{
    $name = 'mdtu_backup_' . date('Y-m-d') . mdtu_backup_ext();
    if (file_exists(MDTU_BACKUP_DIR . '/' . $name)) {
        return null;
    }
    try {
        return mdtu_create_backup($pdo, 'automatic');
    } catch (Throwable $e) {
        error_log('MDTU backup: ' . $e->getMessage());
        return null;
    }
}

/** Writes a full backup and returns its file name. $kind is 'automatic' or 'manual'. */
function mdtu_create_backup(PDO $pdo, $kind)
{
    if (!mdtu_backup_prepare_dir()) {
        throw new RuntimeException('The backups folder cannot be created or is not writable.');
    }
    $lock = fopen(MDTU_BACKUP_DIR . '/.lock', 'c');
    if (!$lock || !flock($lock, LOCK_EX | LOCK_NB)) {
        throw new RuntimeException('Another backup is running. Try again in a minute.');
    }
    try {
        $ext = mdtu_backup_ext();
        $name = 'mdtu_backup_' . date('Y-m-d') . ($kind === 'manual' ? '_' . date('His') : '') . $ext;
        $path = MDTU_BACKUP_DIR . '/' . $name;
        if ($kind !== 'manual' && file_exists($path)) {
            return $name;
        }
        $tmp = $path . '.part';
        $gz = $ext === '.json.gz';
        $fh = $gz ? gzopen($tmp, 'wb6') : fopen($tmp, 'wb');
        if (!$fh) {
            throw new RuntimeException('Cannot write the backup file.');
        }
        $write = function ($s) use ($fh, $gz) {
            if (($gz ? gzwrite($fh, $s) : fwrite($fh, $s)) === false) {
                throw new RuntimeException('Writing the backup failed (disk full?).');
            }
        };

        $existing = $pdo->query("SHOW TABLES")->fetchAll(PDO::FETCH_COLUMN);
        $write('{"system":"MDTU NWP Training Management System","kind":' . json_encode($kind)
            . ',"exportedAt":' . json_encode(date('c')) . ',"tables":{');
        $first = true;
        foreach (MDTU_BACKUP_TABLES as $t) {
            if (!in_array($t, $existing, true)) {
                continue;
            }
            $write(($first ? '' : ',') . json_encode($t) . ':[');
            $first = false;
            // Stream rows one by one so large tables do not exhaust memory
            $pdo->setAttribute(PDO::MYSQL_ATTR_USE_BUFFERED_QUERY, false);
            try {
                $st = $pdo->query("SELECT * FROM `$t`");
                $n = 0;
                while ($row = $st->fetch()) {
                    $write(($n++ ? ',' : '') . "\n" . mdtu_json($row));
                }
                $st->closeCursor();
            } finally {
                $pdo->setAttribute(PDO::MYSQL_ATTR_USE_BUFFERED_QUERY, true);
            }
            $write(']');
        }
        $write("}}\n");
        $gz ? gzclose($fh) : fclose($fh);
        if (!rename($tmp, $path)) {
            @unlink($tmp);
            throw new RuntimeException('Cannot finish the backup file.');
        }
        mdtu_backup_prune();
        mdtu_audit($pdo, 'backup.created', 'backup', $name, ['kind' => $kind, 'bytes' => filesize($path)]);
        return $name;
    } finally {
        flock($lock, LOCK_UN);
        fclose($lock);
    }
}

/** Keeps every daily copy for MDTU_BACKUP_KEEP_DAYS days and the first copy of each month forever. */
function mdtu_backup_prune()
{
    $files = mdtu_list_backups();
    $firstOfMonth = [];
    foreach (array_reverse($files) as $f) {
        $month = substr($f['date'], 0, 7);
        if (!isset($firstOfMonth[$month])) {
            $firstOfMonth[$month] = $f['name'];
        }
    }
    $cutoff = date('Y-m-d', strtotime('-' . MDTU_BACKUP_KEEP_DAYS . ' days'));
    foreach ($files as $f) {
        if ($f['date'] < $cutoff && !in_array($f['name'], $firstOfMonth, true)) {
            @unlink(MDTU_BACKUP_DIR . '/' . $f['name']);
        }
    }
}

/** Newest first. */
function mdtu_list_backups()
{
    $out = [];
    foreach ((array) glob(MDTU_BACKUP_DIR . '/mdtu_backup_*.json*') as $path) {
        $name = basename($path);
        if (!mdtu_valid_backup_name($name)) {
            continue;
        }
        $out[] = ['name' => $name, 'date' => substr($name, 12, 10), 'size' => filesize($path), 'modified' => date('Y-m-d H:i:s', filemtime($path))];
    }
    usort($out, function ($a, $b) { return strcmp($b['name'], $a['name']); });
    return $out;
}

function mdtu_valid_backup_name($name)
{
    return (bool) preg_match('/^mdtu_backup_\d{4}-\d{2}-\d{2}(_\d{6})?\.json(\.gz)?$/', (string) $name);
}
