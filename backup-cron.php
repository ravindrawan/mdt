<?php
/**
 * Daily 16:00 full backup runner.
 * CLI:  php backup-cron.php
 * Web:  backup-cron.php?key=BACKUP_CRON_KEY
 * Schedule with Windows Task Scheduler every day at 16:00.
 */

declare(strict_types=1);

require __DIR__ . '/config.php';
require __DIR__ . '/backup_lib.php';

$cli = (PHP_SAPI === 'cli' || PHP_SAPI === 'phpdbg');
if (!$cli) {
    $key = (string) ($_GET['key'] ?? $_POST['key'] ?? '');
    if (!hash_equals(BACKUP_CRON_KEY, $key)) {
        http_response_code(403);
        header('Content-Type: application/json; charset=UTF-8');
        echo json_encode(['ok' => false, 'error' => 'Forbidden'], JSON_UNESCAPED_UNICODE);
        exit;
    }
}

try {
    db();
    backup_purge_expired();
    $now = new DateTimeImmutable('now');
    $force = $cli && in_array('--force', $argv ?? [], true);
    if (!$force && (int) $now->format('G') < 16) {
        $payload = ['ok' => true, 'skipped' => true, 'reason' => 'before-16:00', 'now' => $now->format('c')];
    } elseif (!$force && backup_today_exists($now)) {
        $payload = ['ok' => true, 'skipped' => true, 'reason' => 'already-exists', 'stamp' => backup_stamp($now)];
    } else {
        $when = $force ? $now : $now->setTime(16, 0, 0);
        $meta = backup_create($when, $force ? 'cron-force' : 'cron-16:00');
        $payload = ['ok' => true, 'skipped' => false, 'backup' => $meta];
    }
} catch (Throwable $e) {
    $payload = ['ok' => false, 'error' => $e->getMessage()];
}

if ($cli) {
    echo json_encode($payload, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT) . PHP_EOL;
    exit(!empty($payload['ok']) ? 0 : 1);
}

header('Content-Type: application/json; charset=UTF-8');
echo json_encode($payload, JSON_UNESCAPED_UNICODE);
