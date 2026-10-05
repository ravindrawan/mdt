<?php
require __DIR__ . '/config.php';
$c = db();
$nid = '198331601750';
$stmt = $c->prepare("SELECT a.tratt_atpid, a.tratt_atpname, a.tratt_startdate, p.atp_trname, p.atp_location, p.atp_stime, p.atp_etime, p.atp_day1 FROM cp_trainingattendance a LEFT JOIN cp_atp p ON p.atp_id = a.tratt_atpid WHERE a.tratt_empnid = ? ORDER BY a.tratt_startdate DESC LIMIT 8");
$stmt->bind_param('s', $nid);
$stmt->execute();
$res = $stmt->get_result();
$out = '';
while ($row = $res->fetch_assoc()) {
    $out .= ($row['atp_trname'] ?: $row['tratt_atpname']) . ' | loc=[' . $row['atp_location'] . '] | ' . $row['atp_stime'] . '-' . $row['atp_etime'] . ' | ' . substr((string) $row['atp_day1'], 0, 10) . PHP_EOL;
}
file_put_contents(__DIR__ . '/_letter_place.txt', $out === '' ? 'none' : $out);
