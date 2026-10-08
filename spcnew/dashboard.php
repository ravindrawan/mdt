<?php
declare(strict_types=1);

require __DIR__ . '/includes/bootstrap.php';
require __DIR__ . '/includes/health.php';
require __DIR__ . '/includes/layout.php';

$user = require_user();
$errors = [];
$form = [
    'recorded_on' => date('Y-m-d'),
    'sugar_type' => 'fasting',
    'sugar_mgdl' => '',
    'systolic' => '',
    'diastolic' => '',
    'cholesterol_mgdl' => '',
    'weight_kg' => '',
    'height_cm' => $user['height_cm'] !== null ? num($user['height_cm'], 1) : '',
    'note' => '',
];

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    csrf_check();
    $action = (string) ($_POST['action'] ?? '');
    if ($action === 'delete') {
        delete_reading($user, (int) ($_POST['reading_id'] ?? 0));
        redirect('dashboard.php');
    }
    if ($action === 'habit') {
        toggle_habit((int) $user['id'], (string) ($_POST['habit_key'] ?? ''));
        redirect('dashboard.php#habits');
    }
    if ($action === 'reading') {
        foreach ($form as $key => $_) {
            if (isset($_POST[$key])) {
                $form[$key] = trim((string) $_POST[$key]);
            }
        }
        $checked = validate_reading($form, fval($user['height_cm']));
        if ($checked['errors']) {
            $errors = $checked['errors'];
        } elseif ($checked['height_only']) {
            db()->prepare('UPDATE users SET height_cm = ? WHERE id = ?')->execute([$checked['data']['height_input'], $user['id']]);
            flash('ok', 'උස සුරකින ලදි. ඊළඟ බර සටහනෙන් BMI ගණනය වේ.');
            redirect('dashboard.php');
        } else {
            save_reading((int) $user['id'], $checked['data']);
            flash('ok', 'මැනුම සුරකින ලදි. උපදෙස් ඔබේ අගයන් අනුව සකස් වුණා.');
            redirect('dashboard.php');
        }
    }
}

$snap = latest_snapshot((int) $user['id']);
$pack = advice_pack($snap);
$habits = today_habits((int) $user['id']);
$habitDone = (int) $habits['water'] + (int) $habits['walk'] + (int) $habits['veg'] + (int) $habits['low_salt'] + (int) $habits['sleep'];
$activity = activity_dates((int) $user['id']);
$streak = streak_count($activity);
$activitySet = array_flip($activity);
$week = [];
for ($i = 6; $i >= 0; $i--) {
    $day = new DateTime('today');
    if ($i > 0) {
        $day->modify('-' . $i . ' day');
    }
    $key = $day->format('Y-m-d');
    $week[] = [
        'label' => weekday_short((int) $day->format('w')),
        'on' => isset($activitySet[$key]),
        'today' => $i === 0,
    ];
}
$last = last_reading_date((int) $user['id']);
$since = null;
if ($last) {
    $since = (new DateTime('today'))->diff(new DateTime($last))->days;
}
$month = date('Y-m');
[$start, $end] = month_bounds($month);
$recentStmt = db()->prepare('SELECT * FROM readings WHERE user_id = ? ORDER BY recorded_on DESC, id DESC LIMIT 8');
$recentStmt->execute([(int) $user['id']]);
$recent = $recentStmt->fetchAll();
$monthCount = db()->prepare('SELECT COUNT(*) FROM readings WHERE user_id = ? AND recorded_on >= ? AND recorded_on < ?');
$monthCount->execute([(int) $user['id'], $start, $end]);
$thisMonth = (int) $monthCount->fetchColumn();

$cards = [
    ['key' => 'sugar', 'mark' => 'S', 'kicker' => 'රුධිර සීනි', 'unit' => 'mg/dL', 'value' => $snap['sugar'] !== null ? num($snap['sugar']) : null, 'extra' => $snap['sugar'] !== null ? sugar_type_label((string) $snap['sugar_type']) : '', 'status' => sugar_status($snap['sugar'], (string) $snap['sugar_type']), 'date' => $snap['sugar_date']],
    ['key' => 'bp', 'mark' => 'P', 'kicker' => 'රුධිර පීඩනය', 'unit' => 'mmHg', 'value' => $snap['systolic'] !== null ? $snap['systolic'] . '/' . $snap['diastolic'] : null, 'extra' => '', 'status' => bp_status($snap['systolic'], $snap['diastolic']), 'date' => $snap['bp_date']],
    ['key' => 'chol', 'mark' => 'C', 'kicker' => 'කොලෙස්ටරෝල්', 'unit' => 'mg/dL', 'value' => $snap['cholesterol'] !== null ? num($snap['cholesterol']) : null, 'extra' => '', 'status' => chol_status($snap['cholesterol']), 'date' => $snap['chol_date']],
    ['key' => 'bmi', 'mark' => 'B', 'kicker' => 'BMI', 'unit' => $snap['weight'] !== null ? num($snap['weight'], 1) . ' kg' : '', 'value' => $snap['bmi'] !== null ? num($snap['bmi'], 1) : null, 'extra' => '', 'status' => bmi_status($snap['bmi']), 'date' => $snap['bmi_date']],
];

page_header('අද', 'dashboard');
?>
<section class="hello">
    <div>
        <p class="eyebrow">SPC දිනපොත</p>
        <h1><?= e(greeting((string) $user['name'])) ?></h1>
        <p class="muted">හැඳුනුම <?= e((string) $user['user_code']) ?> · <?= e(format_phone((string) $user['phone'])) ?></p>
    </div>
    <div class="hello-side">
        <div class="streak">
            <strong><?= (int) $streak ?></strong>
            <span><?= $streak === 1 ? 'දිනයක් එක දිගට' : 'දින එක දිගට' ?></span>
        </div>
        <p>
            <?php if ($since === null): ?>
                අද පළමු මැනුම දැම්මොත් දාමය පටන් ගනී.
            <?php elseif ($since === 0): ?>
                අද මැනුම සටහන් වෙලා තියෙනවා. <?= (int) $thisMonth ?>ක් මේ මාසයේ.
            <?php elseif ($since === 1): ?>
                අවසන් මැනුම ඊයේ. අදත් එකක් දාන්න.
            <?php else: ?>
                අවසන් මැනුම දින <?= (int) $since ?>කට පෙරයි.
            <?php endif; ?>
        </p>
        <a class="btn btn-gold" href="#record"><?= $since === 0 ? 'තව මැනුමක්' : 'අද මැනුම' ?></a>
    </div>
</section>

<section class="card week-card">
    <div class="week-copy">
        <p class="eyebrow">මේ සතිය</p>
        <h2><?= e(streak_cheer($streak, $since === 0 || $habitDone > 0)) ?></h2>
        <p class="muted">සටහනක් හෝ අද කළ දේ එකක් සලකුණු කළාම ඒ දවස පිරෙනවා. හෙට ටිප් එක වෙනස්.</p>
    </div>
    <div class="week" aria-label="පසුගිය දින හත">
        <?php foreach ($week as $day): ?>
            <span class="<?= $day['on'] ? 'is-on' : '' ?><?= $day['today'] ? ' is-today' : '' ?>">
                <em><?= e($day['label']) ?></em>
                <?= $day['on'] ? '✓' : '·' ?>
            </span>
        <?php endforeach; ?>
    </div>
</section>

<section class="metrics">
    <?php foreach ($cards as $card): ?>
        <article class="metric metric-<?= e($card['key']) ?>">
            <header>
                <span class="mark"><?= e($card['mark']) ?></span>
                <?= pill_html($card['status']) ?>
            </header>
            <p class="metric-kicker"><?= e($card['kicker']) ?><?= $card['extra'] !== '' ? ' · ' . e($card['extra']) : '' ?></p>
            <p class="metric-value"><?= $card['value'] === null ? '—' : e((string) $card['value']) ?> <?php if ($card['value'] !== null && $card['key'] !== 'bmi'): ?><small><?= e($card['unit']) ?></small><?php endif; ?></p>
            <p class="metric-date"><?= $card['date'] ? 'අවසන් ' . e(nice_date((string) $card['date'])) : 'තවම නැත' ?><?= $card['key'] === 'bmi' && $card['unit'] !== '' ? ' · බර ' . e($card['unit']) : '' ?></p>
        </article>
    <?php endforeach; ?>
</section>

<?php advice_panel($pack); ?>

<div class="work">
    <section class="card" id="record">
        <h2>මැනුම ඇතුළත් කරන්න</h2>
        <p class="muted">හැම දෙයක්ම දිනපතා ඕනෑ නැත. තියෙන අගය පමණක් දාන්න. වැරදුණොත් පහළ ලැයිස්තුවෙන් මකා නැවත දාන්න.</p>
        <?php foreach ($errors as $error): ?><div class="flash bad"><?= e($error) ?></div><?php endforeach; ?>
        <form method="post" class="stack">
            <?= csrf_field() ?>
            <input type="hidden" name="action" value="reading">
            <div class="pair">
                <label>දිනය
                    <input type="date" name="recorded_on" required max="<?= e(date('Y-m-d')) ?>" value="<?= e($form['recorded_on']) ?>">
                </label>
                <label>සීනි වර්ගය
                    <select name="sugar_type">
                        <?php foreach (['fasting' => 'නිරාහාර', 'random' => 'අහඹු', 'post' => 'ආහාරයෙන් පසු'] as $value => $label): ?>
                            <option value="<?= e($value) ?>"<?= $form['sugar_type'] === $value ? ' selected' : '' ?>><?= e($label) ?></option>
                        <?php endforeach; ?>
                    </select>
                </label>
            </div>
            <div class="pair">
                <label>සීනි (mg/dL)
                    <input name="sugar_mgdl" inputmode="decimal" value="<?= e($form['sugar_mgdl']) ?>" placeholder="96">
                    <span class="help">නිරාහාර 70–99 හොඳයි. අහඹු සහ ආහාරයෙන් පසු 140ට අඩු නම් හොඳයි.</span>
                </label>
                <label>කොලෙස්ටරෝල් (mg/dL)
                    <input name="cholesterol_mgdl" inputmode="decimal" value="<?= e($form['cholesterol_mgdl']) ?>" placeholder="180">
                    <span class="help">200ට අඩු නම් හොඳයි. මසකට වරක් මැනීම ඇත.</span>
                </label>
            </div>
            <div class="pair">
                <label>ඉහළ පීඩනය
                    <input name="systolic" inputmode="numeric" value="<?= e($form['systolic']) ?>" placeholder="118">
                </label>
                <label>පහළ පීඩනය
                    <input name="diastolic" inputmode="numeric" value="<?= e($form['diastolic']) ?>" placeholder="76">
                    <span class="help">සාමාන්‍යය 120/80ට අඩු.</span>
                </label>
            </div>
            <div class="pair">
                <label>බර (kg)
                    <input name="weight_kg" inputmode="decimal" value="<?= e($form['weight_kg']) ?>" placeholder="64">
                </label>
                <label>උස (cm)
                    <input name="height_cm" inputmode="decimal" value="<?= e($form['height_cm']) ?>" placeholder="165">
                    <span class="help">එක් වරක් දැම්මොත් මතක තියාගනී. BMI එයින් ගණනය වේ.</span>
                </label>
            </div>
            <label>සටහන
                <input name="note" maxlength="200" value="<?= e($form['note']) ?>" placeholder="උදා: උදේ ඖෂධයට පෙර">
            </label>
            <button class="btn btn-navy" type="submit">සුරකින්න</button>
        </form>
    </section>

    <section class="card" id="habits">
        <h2>අද කළ දේ</h2>
        <p class="muted"><?= (int) $habitDone ?> / 5. මැනුමක් නැති දවසකත් මෙය සටහන් කළාම දාමය රැකේ.</p>
        <form method="post" class="habits">
            <?= csrf_field() ?>
            <input type="hidden" name="action" value="habit">
            <?php
            $habitLabels = [
                'water' => 'වතුර වීදුරු 6–8',
                'walk' => 'විනාඩි 30 ඇවිද්ඩා',
                'veg' => 'එළවළු පිඟානක්',
                'low_salt' => 'ලුණු අඩුවෙන්',
                'sleep' => 'පැය 7 නින්ද',
            ];
            foreach ($habitLabels as $key => $label):
                $on = (int) ($habits[$key] ?? 0) === 1;
            ?>
                <button class="habit<?= $on ? ' is-on' : '' ?>" type="submit" name="habit_key" value="<?= e($key) ?>"><?= e($label) ?></button>
            <?php endforeach; ?>
        </form>
        <p class="month-link"><a href="<?= e(url('history.php')) ?>"><?= e(month_label($month)) ?> විශ්ලේෂණය · මුද්‍රණය · මැනුම් <?= (int) $thisMonth ?></a></p>
        <p class="month-link"><a href="<?= e(url('chat.php')) ?>">සංවාදයෙන් තව අහන්න</a></p>
    </section>
</div>

<section class="card">
    <h2>මෑත සටහන්</h2>
    <?php readings_table($recent, true); ?>
</section>
<?php
page_footer();
