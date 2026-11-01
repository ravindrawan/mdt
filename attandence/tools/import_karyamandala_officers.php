<?php
/**
 * Import / update officers from karyamandala-lekhanaya-upload.csv
 * Only fields used by this system: nic, name, designation, office, phone, gender.
 *
 * Usage (CLI):
 *   php tools/import_karyamandala_officers.php "C:\path\to\karyamandala-lekhanaya-upload.csv"
 */
if (PHP_SAPI !== 'cli') {
    fwrite(STDERR, "Run from command line only.\n");
    exit(1);
}

require dirname(__DIR__) . '/db.php';

$csvPath = $argv[1] ?? '';
if ($csvPath === '' || !is_readable($csvPath)) {
    fwrite(STDERR, "CSV not found. Pass full path to karyamandala-lekhanaya-upload.csv\n");
    exit(1);
}

function map_gender($raw)
{
    $g = trim((string) $raw);
    if ($g === '') {
        return null;
    }
    $u = mb_strtolower($g, 'UTF-8');
    if (strpos($u, 'female') !== false || strpos($u, 'ස්ත්') !== false || $u === 'f' || strpos($u, 'stri') !== false) {
        return 'Female';
    }
    if (strpos($u, 'male') !== false || strpos($u, 'පුරුෂ') !== false || $u === 'm' || strpos($u, 'puru') !== false) {
        return 'Male';
    }
    return null;
}

function clean_phone($raw)
{
    $p = preg_replace('/[^\d+]/', '', (string) $raw);
    if ($p === '' || $p === '0') {
        return '';
    }
    if (strlen($p) > 20) {
        $p = substr($p, 0, 20);
    }
    return $p;
}

$fh = fopen($csvPath, 'rb');
if (!$fh) {
    fwrite(STDERR, "Cannot open CSV.\n");
    exit(1);
}

// Strip UTF-8 BOM if present
$first = fgets($fh);
if ($first === false) {
    fwrite(STDERR, "Empty CSV.\n");
    exit(1);
}
$first = preg_replace('/^\xEF\xBB\xBF/', '', $first);
$header = str_getcsv($first);
$col = [];
foreach ($header as $i => $h) {
    $col[trim($h)] = $i;
}
$need = ['National ID', 'Name', 'Gender', 'Designation', 'Office'];
foreach ($need as $h) {
    if (!isset($col[$h])) {
        fwrite(STDERR, "Missing column: $h\n");
        exit(1);
    }
}

$sql = "INSERT INTO officers (nic, name, designation, office, phone, gender) VALUES (?, ?, ?, ?, ?, ?)
    ON DUPLICATE KEY UPDATE
        name = VALUES(name),
        designation = VALUES(designation),
        office = VALUES(office),
        phone = IF(VALUES(phone) IS NULL OR VALUES(phone) = '', phone, VALUES(phone)),
        gender = IF(VALUES(gender) IS NULL OR VALUES(gender) = '', gender, VALUES(gender))";
$st = $pdo->prepare($sql);

$inserted = 0;
$updated = 0;
$skipped = 0;
$errors = 0;
$seen = [];

$pdo->beginTransaction();
try {
    while (($row = fgetcsv($fh)) !== false) {
        if (count($row) === 1 && trim((string) $row[0]) === '') {
            continue;
        }
        $rawNic = isset($row[$col['National ID']]) ? trim($row[$col['National ID']]) : '';
        $nic = normalize_nic($rawNic);
        if ($nic === '' || isset($seen[$nic])) {
            $skipped++;
            continue;
        }
        $seen[$nic] = true;

        $name = trim((string) ($row[$col['Name']] ?? ''));
        if ($name === '') {
            $skipped++;
            continue;
        }
        $designation = trim((string) ($row[$col['Designation']] ?? ''));
        $office = trim((string) ($row[$col['Office']] ?? ''));
        $mobile = isset($col['Mobile']) ? ($row[$col['Mobile']] ?? '') : '';
        $officeTel = isset($col['Office telephone']) ? ($row[$col['Office telephone']] ?? '') : '';
        $phone = clean_phone($mobile !== '' && $mobile !== null ? $mobile : $officeTel);
        $gender = map_gender($row[$col['Gender']] ?? '');

        try {
            $st->execute([
                $nic,
                mb_substr($name, 0, 255, 'UTF-8'),
                $designation !== '' ? mb_substr($designation, 0, 255, 'UTF-8') : null,
                $office !== '' ? mb_substr($office, 0, 255, 'UTF-8') : null,
                $phone !== '' ? $phone : null,
                $gender,
            ]);
            if ($st->rowCount() === 1) {
                $inserted++;
            } else {
                $updated++;
            }
        } catch (PDOException $e) {
            $errors++;
            fwrite(STDERR, "Row NIC $rawNic: " . $e->getMessage() . "\n");
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
fclose($fh);

$total = (int) $pdo->query('SELECT COUNT(*) FROM officers')->fetchColumn();
echo "CSV: " . basename($csvPath) . "\n";
echo "Unique NICs processed: " . count($seen) . "\n";
echo "Inserted (new): $inserted\n";
echo "Updated / unchanged: $updated\n";
echo "Skipped: $skipped\n";
echo "Errors: $errors\n";
echo "officers table total now: $total\n";
