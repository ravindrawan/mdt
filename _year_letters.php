<?php
require __DIR__ . '/config.php';
$con = db();
$pick = $con->query("SELECT tapp_officerNid AS nid FROM cp_trainingapplications WHERE tapp_isselected IN ('ඔව්','Yes','yes') AND tapp_officerNid <> '' GROUP BY tapp_officerNid HAVING COUNT(DISTINCT LEFT(tapp_trstartdate,4)) > 1 LIMIT 1");
$row = $pick ? $pick->fetch_assoc() : null;
if (!$row) {
    echo json_encode(['found' => false]), PHP_EOL;
    exit;
}
$_GET['action'] = 'officer-history';
$_GET['nid'] = $row['nid'];
$_GET['year'] = '2026';
ob_start();
register_shutdown_function(static function (): void {
    $raw = ob_get_clean();
    $data = json_decode((string) $raw, true);
    $years = [];
    foreach ($data['trainings'] ?? [] as $item) {
        $year = substr((string) ($item['start_date'] ?? ''), 0, 4);
        $years[$year] = ($years[$year] ?? 0) + 1;
    }
    echo json_encode([
        'ok' => $data['ok'] ?? false,
        'asked' => $data['year'] ?? '',
        'shown' => count($data['trainings'] ?? []),
        'years' => $years,
    ]), PHP_EOL;
});
require __DIR__ . '/api.php';
