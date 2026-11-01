<?php
/** Merge officers that are the same person under old V/X and 12-digit NIC keys. Prefer 12-digit row. */
if (PHP_SAPI !== 'cli') {
    exit(1);
}
require dirname(__DIR__) . '/db.php';

$rows = $pdo->query('SELECT nic, name, designation, office, phone, gender FROM officers')->fetchAll(PDO::FETCH_ASSOC);
$byNorm = [];
foreach ($rows as $r) {
    $n = normalize_nic($r['nic']);
    if ($n === '') {
        continue;
    }
    $byNorm[$n][] = $r;
}

$dupGroups = array_filter($byNorm, fn($a) => count($a) > 1);
echo 'Duplicate groups: ' . count($dupGroups) . "\n";

$del = $pdo->prepare('DELETE FROM officers WHERE nic = ?');
$upd = $pdo->prepare('UPDATE officers SET name = ?, designation = ?, office = ?, phone = ?, gender = ? WHERE nic = ?');
$merged = 0;

$pdo->beginTransaction();
try {
    foreach ($dupGroups as $norm => $list) {
        usort($list, function ($a, $b) use ($norm) {
            $aExact = ($a['nic'] === $norm) ? 0 : 1;
            $bExact = ($b['nic'] === $norm) ? 0 : 1;
            if ($aExact !== $bExact) {
                return $aExact - $bExact;
            }
            return strlen($b['nic']) - strlen($a['nic']);
        });
        $keep = $list[0];
        // Prefer richest non-empty fields across duplicates
        foreach ($list as $r) {
            foreach (['name', 'designation', 'office', 'phone', 'gender'] as $f) {
                if (($keep[$f] === null || $keep[$f] === '') && $r[$f] !== null && $r[$f] !== '') {
                    $keep[$f] = $r[$f];
                }
            }
        }
        // Ensure canonical 12-digit key exists
        if ($keep['nic'] !== $norm) {
            // If no exact 12-digit row, rename by insert+delete
            $exists = $pdo->prepare('SELECT COUNT(*) FROM officers WHERE nic = ?');
            $exists->execute([$norm]);
            if (!(int) $exists->fetchColumn()) {
                $pdo->prepare('INSERT INTO officers (nic, name, designation, office, phone, gender) VALUES (?, ?, ?, ?, ?, ?)')
                    ->execute([$norm, $keep['name'], $keep['designation'], $keep['office'], $keep['phone'], $keep['gender']]);
            }
            $keep['nic'] = $norm;
        } else {
            $upd->execute([$keep['name'], $keep['designation'], $keep['office'], $keep['phone'], $keep['gender'], $norm]);
        }
        foreach ($list as $r) {
            if ($r['nic'] === $norm) {
                continue;
            }
            $del->execute([$r['nic']]);
            $merged++;
        }
    }
    $pdo->commit();
} catch (Throwable $e) {
    if ($pdo->inTransaction()) {
        $pdo->rollBack();
    }
    fwrite(STDERR, $e->getMessage() . "\n");
    exit(1);
}

echo "Removed duplicate NIC rows: $merged\n";
echo 'officers total now: ' . (int) $pdo->query('SELECT COUNT(*) FROM officers')->fetchColumn() . "\n";
