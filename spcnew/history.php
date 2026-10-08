<?php
declare(strict_types=1);

require __DIR__ . '/includes/bootstrap.php';
require __DIR__ . '/includes/health.php';
require __DIR__ . '/includes/layout.php';

$user = require_user();

if ($_SERVER['REQUEST_METHOD'] === 'POST' && (($_POST['action'] ?? '') === 'delete')) {
    csrf_check();
    delete_reading($user, (int) ($_POST['reading_id'] ?? 0));
    $keep = (string) ($_GET['m'] ?? '');
    $back = valid_month($keep) ? 'history.php?m=' . urlencode($keep) : 'history.php';
    redirect($back);
}

$month = (string) ($_GET['m'] ?? date('Y-m'));
if (!valid_month($month) || $month > date('Y-m')) {
    $month = date('Y-m');
}
$metric = (string) ($_GET['metric'] ?? 'sugar');
if (!in_array($metric, ['sugar', 'bp', 'cholesterol', 'bmi'], true)) {
    $metric = 'sugar';
}
[$start, $end] = month_bounds($month);
[$pStart, $pEnd] = month_bounds(shift_month($month, -1));
$rows = readings_between((int) $user['id'], $start, $end);
$prevRows = readings_between((int) $user['id'], $pStart, $pEnd);
$report = build_month_report($rows, $prevRows);
if ($report['chart'][$metric]['lines'] === [] ) {
    foreach (['sugar', 'bp', 'cholesterol', 'bmi'] as $candidate) {
        if ($report['chart'][$candidate]['lines'] !== []) {
            $metric = $candidate;
            break;
        }
    }
}
$chart = $report['chart'];
$chart['initial'] = $metric;
$prevM = shift_month($month, -1);
$nextM = shift_month($month, 1);

$stats = [
    ['label' => 'සීනි', 'now' => $report['avg']['sugar'], 'then' => $report['prev']['sugar'], 'dec' => -1, 'unit' => 'mg/dL'],
    ['label' => 'ඉහළ පීඩනය', 'now' => $report['avg']['systolic'], 'then' => $report['prev']['systolic'], 'dec' => 0, 'unit' => 'mmHg'],
    ['label' => 'පහළ පීඩනය', 'now' => $report['avg']['diastolic'], 'then' => $report['prev']['diastolic'], 'dec' => 0, 'unit' => 'mmHg'],
    ['label' => 'කොලෙස්ටරෝල්', 'now' => $report['avg']['cholesterol'], 'then' => $report['prev']['cholesterol'], 'dec' => -1, 'unit' => 'mg/dL'],
    ['label' => 'BMI', 'now' => $report['avg']['bmi'], 'then' => $report['prev']['bmi'], 'dec' => 1, 'unit' => ''],
];

$scope = (($_GET['scope'] ?? '') === 'all') ? 'all' : 'month';
$allRows = [];
if ($scope === 'all') {
    $allStmt = db()->prepare('SELECT * FROM readings WHERE user_id = ? ORDER BY recorded_on DESC, id DESC');
    $allStmt->execute([(int) $user['id']]);
    $allRows = $allStmt->fetchAll();
}
$printTitle = $scope === 'all' ? 'සියලු ඉතිහාසය' : month_label($month);

page_header($scope === 'all' ? 'සියලු ඉතිහාසය' : 'මාසික විශ්ලේෂණය', 'history');
?>
<header class="print-head">
    <p class="print-kicker">වයඹ පළාත් සභාව</p>
    <strong>කළමනාකරණ සංවර්ධන හා පුහුණු ඒකකය · SPC සෞඛ්‍ය දිනපොත</strong>
    <p><?= e((string) $user['name']) ?> · හැඳුනුම <?= e((string) $user['user_code']) ?></p>
    <p><?= e($printTitle) ?> · මුද්‍රණය <?= e(nice_date(date('Y-m-d'), true)) ?></p>
    <p class="print-note">මෙය වෛද්‍ය රෝග විනිශ්චයක් නොවේ. අගයන් වෛද්‍යවරයාට පෙන්වීමට පමණක් භාවිත කරන්න.</p>
</header>

<section class="month-bar">
    <div>
        <p class="eyebrow"><?= $scope === 'all' ? 'සියලු ඉතිහාසය' : 'මාසික විශ්ලේෂණය' ?></p>
        <h1><?= e($printTitle) ?></h1>
        <p class="muted">
            <?php if ($scope === 'all'): ?>
                මුළු මැනුම් <?= count($allRows) ?>
            <?php else: ?>
                මැනුම් <?= (int) $report['count'] ?> · දින <?= (int) $report['days'] ?>
            <?php endif; ?>
        </p>
    </div>
    <div class="month-nav no-print">
        <?php if ($scope === 'month'): ?>
            <a class="btn btn-ghost" href="<?= e(url('history.php?m=' . $prevM)) ?>">පෙර මාසය</a>
            <?php if ($nextM <= date('Y-m')): ?>
                <a class="btn btn-ghost" href="<?= e(url('history.php?m=' . $nextM)) ?>">ඊළඟ මාසය</a>
            <?php endif; ?>
            <a class="btn btn-ghost" href="<?= e(url('history.php?scope=all')) ?>">සියලු ඉතිහාසය</a>
        <?php else: ?>
            <a class="btn btn-ghost" href="<?= e(url('history.php?m=' . $month)) ?>">මෙම මාසය</a>
        <?php endif; ?>
        <button class="btn btn-navy" type="button" onclick="window.print()">මුද්‍රණය</button>
    </div>
</section>

<?php if ($scope === 'month'): ?>
<section class="letter plain">
    <?php foreach ($report['paragraphs'] as $paragraph): ?>
        <p><?= e($paragraph) ?></p>
    <?php endforeach; ?>
</section>

<section class="card">
    <div class="tabs" role="tablist">
        <?php foreach (['sugar' => 'සීනි', 'bp' => 'පීඩනය', 'cholesterol' => 'කොලෙස්ටරෝල්', 'bmi' => 'BMI'] as $key => $label): ?>
            <button type="button" class="tab<?= $key === $metric ? ' is-on' : '' ?>" data-series="<?= e($key) ?>"><?= e($label) ?></button>
        <?php endforeach; ?>
    </div>
    <div class="chart-box">
        <canvas id="monthChart"></canvas>
        <div class="chart-tip" hidden></div>
        <p class="chart-empty" hidden>මෙම මාසයේ මෙම මැනුමේ සටහන් නැත.</p>
    </div>
    <p class="help" id="chart-caption"></p>
    <script type="application/json" id="chart-data"><?= json_encode($chart, JSON_UNESCAPED_UNICODE | JSON_HEX_TAG | JSON_HEX_AMP | JSON_HEX_APOS | JSON_HEX_QUOT) ?></script>
</section>

<section class="stats five">
    <?php foreach ($stats as $stat): ?>
        <article class="stat">
            <span><?= e($stat['label']) ?></span>
            <strong><?= e($stat['now'] === null ? '—' : num($stat['now'], $stat['dec'])) ?></strong>
            <em><?= e($stat['unit']) ?></em>
            <p><?= e(change_phrase($stat['now'] !== null ? (float) $stat['now'] : null, $stat['then'] !== null ? (float) $stat['then'] : null) ?? 'පෙර මාසයේ සැසඳීමක් නැත') ?></p>
        </article>
    <?php endforeach; ?>
</section>

<section class="card">
    <h2>මෙම මාසයේ සටහන්</h2>
    <?php readings_table(array_reverse($rows), true); ?>
</section>
<?php else: ?>
<section class="card">
    <h2>සියලු සටහන්</h2>
    <p class="muted no-print">ඕන නම් මෙම ලැයිස්තුව මුද්‍රණය කර වෛද්‍යවරයාට දෙන්න පුළුවන්. මකන්න බොත්තම් පත්‍රයේ නොපෙනේ.</p>
    <?php readings_table($allRows, true); ?>
</section>
<?php endif; ?>
<?php
page_footer();
