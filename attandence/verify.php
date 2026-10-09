<?php
ini_set('display_errors', '0');
require_once __DIR__ . '/security.php';
mdtu_security_headers();
$code = strtoupper(trim($_GET['code'] ?? ''));
$record = null;
$settings = [];
$error = null;

try {
    require __DIR__ . '/db.php';
    foreach ($pdo->query("SELECT k, v FROM settings")->fetchAll() as $row) {
        $settings[$row['k']] = $row['v'];
    }
    if ($code !== '') {
        $st = $pdo->prepare("SELECT r.*, p.dates AS programDates, p.fileNo AS programFileNo FROM training_records r LEFT JOIN programs p ON p.id = r.programId WHERE r.certSerial = ?");
        $st->execute([$code]);
        $record = $st->fetch() ?: null;
    }
} catch (Throwable $e) {
    $error = 'The verification service is temporarily unavailable. Please try again later.';
}

function e($v)
{
    return htmlspecialchars((string) $v, ENT_QUOTES, 'UTF-8');
}

function mask_nic($nic)
{
    $len = strlen($nic);
    return $len <= 4 ? $nic : str_repeat('•', $len - 4) . substr($nic, -4);
}

$dates = [];
$absent = [];
$hours = 0;
if ($record) {
    $dates = json_decode((string) $record['programDates'], true) ?: [$record['date']];
    $absent = array_filter(array_map('trim', explode(',', (string) $record['absentDates'])));
    $hours = max(0, (int) $record['hours'] - 6 * count($absent));
}
$valid = $record && (int) $record['confirmed'] === 1;
$logo = $settings['logo'] ?? '';
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Certificate Verification - MDTU NWP</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@700;800&family=Inter:wght@400;600;700;900&display=swap" rel="stylesheet">
    <style>
        body { font-family: 'Inter', sans-serif; }
        .font-cinzel { font-family: 'Cinzel', serif; }
    </style>
</head>
<body class="bg-slate-100 min-h-screen flex flex-col">
    <header class="bg-indigo-950 text-white border-b-4 border-amber-500">
        <div class="max-w-3xl mx-auto px-4 py-4 flex items-center gap-3">
            <div class="w-12 h-12 shrink-0 rounded-full bg-white/10 flex items-center justify-center overflow-hidden">
                <?php if ($logo): ?>
                    <img src="<?= e($logo) ?>" alt="MDTU Logo" class="max-w-full max-h-full object-contain">
                <?php else: ?>
                    <span class="text-2xl">🏛️</span>
                <?php endif; ?>
            </div>
            <div class="min-w-0">
                <p class="text-[10px] sm:text-xs font-bold text-amber-400 uppercase tracking-widest">North Western Province, Sri Lanka</p>
                <h1 class="text-sm sm:text-lg font-black uppercase leading-tight">Management Development and Training Unit</h1>
                <p class="text-[11px] sm:text-xs text-slate-300">Official Certificate Verification</p>
            </div>
        </div>
    </header>

    <main class="flex-1 w-full max-w-3xl mx-auto p-4 space-y-4">
        <form method="get" class="bg-white rounded-xl shadow border border-slate-200 p-4 flex flex-col sm:flex-row gap-2">
            <input type="text" name="code" value="<?= e($code) ?>" placeholder="Enter verification code e.g. MDTU-2026-00012-A3F9" class="flex-1 p-3 border-2 rounded-lg font-mono text-sm uppercase outline-none focus:border-indigo-600">
            <button class="bg-indigo-900 hover:bg-indigo-800 text-white font-bold px-6 py-3 rounded-lg text-sm">Verify</button>
        </form>

        <?php if ($error): ?>
            <div class="bg-amber-50 border-2 border-amber-400 text-amber-900 rounded-xl p-5 text-sm font-semibold"><?= e($error) ?></div>
        <?php elseif ($code === ''): ?>
            <div class="bg-white rounded-xl shadow border p-6 text-center text-slate-500 text-sm">
                Scan the QR code on an MDTU certificate, or enter the verification code printed on it.
            </div>
        <?php elseif (!$record): ?>
            <div class="bg-rose-50 border-2 border-rose-500 rounded-xl p-6 text-center space-y-2">
                <div class="text-5xl">✖</div>
                <h2 class="text-lg font-black text-rose-800 uppercase">Certificate Not Found</h2>
                <p class="text-sm text-rose-700">No certificate with code <span class="font-mono font-bold"><?= e($code) ?></span> exists in the MDTU database. This document may not be genuine.</p>
            </div>
        <?php else: ?>
            <div class="<?= $valid ? 'bg-emerald-50 border-emerald-500' : 'bg-amber-50 border-amber-500' ?> border-2 rounded-xl p-5 flex items-center gap-4">
                <div class="w-14 h-14 shrink-0 rounded-full flex items-center justify-center text-3xl text-white <?= $valid ? 'bg-emerald-600' : 'bg-amber-500' ?>"><?= $valid ? '✓' : '!' ?></div>
                <div>
                    <h2 class="text-base sm:text-lg font-black uppercase <?= $valid ? 'text-emerald-800' : 'text-amber-800' ?>">
                        <?= $valid ? 'Valid Certificate' : 'Attendance Not Yet Confirmed' ?>
                    </h2>
                    <p class="text-xs sm:text-sm <?= $valid ? 'text-emerald-700' : 'text-amber-700' ?>">
                        <?= $valid
                            ? 'This certificate was issued by MDTU - NWP and matches the official training record.'
                            : 'This training record exists, but MDTU has not yet confirmed the attendance. A certificate should not be issued yet.' ?>
                    </p>
                </div>
            </div>

            <div class="bg-white rounded-xl shadow border border-slate-200 overflow-hidden">
                <div class="bg-indigo-900 text-amber-300 px-5 py-3 font-cinzel font-bold tracking-wider text-sm">Certificate Details</div>
                <dl class="divide-y text-sm">
                    <?php
                    $rows = [
                        'Verification Code' => '<span class="font-mono font-bold">' . e($record['certSerial']) . '</span>',
                        'Officer Name'      => '<span class="font-bold text-indigo-950">' . e($record['name']) . '</span>',
                        'NIC'               => '<span class="font-mono">' . e(mask_nic($record['nic'])) . '</span>',
                        'Designation'       => e($record['designation']),
                        'Office'            => e($record['office']),
                        'Training Program'  => '<span class="font-bold">' . e($record['trainingName']) . '</span>',
                        'File No'           => '<span class="font-mono">' . e($record['programFileNo'] ?: '-') . '</span>',
                        'Venue'             => e($record['venue'] ?: '-'),
                        'Program Dates'     => e(implode(', ', $dates)),
                        'Absent Dates'      => $absent ? '<span class="text-rose-700 font-semibold">' . e(implode(', ', $absent)) . '</span>' : 'None',
                        'Hours Completed'   => '<span class="font-bold text-emerald-700">' . $hours . ' Hours</span>',
                        'Confirmed'         => $valid ? (e(trim(($record['confirmedAt'] ? date('Y-m-d', strtotime($record['confirmedAt'])) : '') . ($record['confirmedBy'] ? ' by ' . $record['confirmedBy'] : ''))) ?: 'Yes') : 'Pending',
                    ];
                    foreach ($rows as $label => $value): ?>
                        <div class="px-5 py-3 grid grid-cols-1 sm:grid-cols-3 gap-1">
                            <dt class="text-xs font-bold text-slate-500 uppercase"><?= e($label) ?></dt>
                            <dd class="sm:col-span-2 text-slate-800 break-words"><?= $value ?></dd>
                        </div>
                    <?php endforeach; ?>
                </dl>
            </div>
        <?php endif; ?>
    </main>

    <footer class="text-center text-[11px] text-slate-500 py-4">
        &copy; <?= date('Y') ?> MDTU NWP · <?= e($settings['orgAddress'] ?? '') ?> <?= !empty($settings['orgPhone']) ? '· ' . e($settings['orgPhone']) : '' ?>
    </footer>
</body>
</html>
