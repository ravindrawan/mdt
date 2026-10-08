<?php
declare(strict_types=1);

require __DIR__ . '/includes/bootstrap.php';
require __DIR__ . '/includes/health.php';
require __DIR__ . '/includes/layout.php';

$user = require_user();
$errors = [];
$pwErrors = [];
$form = [
    'name' => (string) $user['name'],
    'phone' => (string) $user['phone'],
    'height_cm' => $user['height_cm'] !== null ? num($user['height_cm'], 1) : '',
];

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    csrf_check();
    $action = (string) ($_POST['action'] ?? '');
    if ($action === 'details') {
        $form['name'] = trim((string) ($_POST['name'] ?? ''));
        $form['phone'] = trim((string) ($_POST['phone'] ?? ''));
        $form['height_cm'] = trim((string) ($_POST['height_cm'] ?? ''));
        $phone = normalize_phone($form['phone']);
        $height = parse_num($form['height_cm']);
        if (!valid_name($form['name'])) {
            $errors[] = 'නම අකුරු 2–80 අතර දෙන්න.';
        }
        if ($phone === null) {
            $errors[] = 'දුරකථන අංකය 07xxxxxxxx ආකාරයට දෙන්න.';
        }
        if (!$height['ok']) {
            $errors[] = 'උස ඉලක්කම් වලින් දෙන්න.';
        } elseif ($height['value'] !== null && ($height['value'] < 80 || $height['value'] > 230)) {
            $errors[] = 'උස සෙන්ටිමීටර 80 සහ 230 අතර විය යුතුයි.';
        }
        if (!$errors && $phone !== null) {
            db()->prepare('UPDATE users SET name = ?, phone = ?, height_cm = ? WHERE id = ?')->execute([
                $form['name'],
                $phone,
                $height['value'] !== null ? round((float) $height['value'], 1) : null,
                (int) $user['id'],
            ]);
            flash('ok', 'පැතිකඩ සුරකින ලදි.');
            redirect('profile.php');
        }
    }
    if ($action === 'password') {
        $current = (string) ($_POST['current'] ?? '');
        $next = (string) ($_POST['next'] ?? '');
        $confirm = (string) ($_POST['confirm'] ?? '');
        if (!password_verify($current, (string) $user['password_hash'])) {
            $pwErrors[] = 'දැනට තියෙන මුරපදය වැරදියි.';
        }
        if (strlen($next) < 4) {
            $pwErrors[] = 'නව මුරපදය අකුරු 4කට වඩා දිග විය යුතුයි.';
        }
        if ($next !== $confirm) {
            $pwErrors[] = 'නව මුරපද දෙක නොගැලපේ.';
        }
        if (!$pwErrors) {
            db()->prepare('UPDATE users SET password_hash = ? WHERE id = ?')->execute([
                password_hash($next, PASSWORD_DEFAULT),
                (int) $user['id'],
            ]);
            flash('ok', 'මුරපදය වෙනස් වුණා.');
            redirect('profile.php');
        }
    }
}

page_header('පැතිකඩ', 'profile');
?>
<section class="hello slim">
    <div>
        <p class="eyebrow">ගිණුම</p>
        <h1><?= e((string) $user['name']) ?></h1>
        <p class="muted">හැඳුනුම් අංකය <?= e((string) $user['user_code']) ?> · ලියාපදිංචිය <?= e(nice_date(substr((string) $user['created_at'], 0, 10), true)) ?></p>
    </div>
</section>
<div class="work">
    <section class="card">
        <h2>නම සහ දුරකථනය</h2>
        <?php foreach ($errors as $error): ?><div class="flash bad"><?= e($error) ?></div><?php endforeach; ?>
        <form method="post" class="stack">
            <?= csrf_field() ?>
            <input type="hidden" name="action" value="details">
            <label>නම
                <input name="name" required maxlength="80" value="<?= e($form['name']) ?>">
            </label>
            <label>දුරකථන අංකය
                <input name="phone" required value="<?= e($form['phone']) ?>">
            </label>
            <label>උස (cm)
                <input name="height_cm" inputmode="decimal" value="<?= e($form['height_cm']) ?>">
                <span class="help">ඊළඟ බර සටහනේ සිට BMI මෙම උසින් ගණනය වේ.</span>
            </label>
            <button class="btn btn-navy" type="submit">සුරකින්න</button>
        </form>
    </section>
    <section class="card">
        <h2>මුරපදය වෙනස් කරන්න</h2>
        <?php foreach ($pwErrors as $error): ?><div class="flash bad"><?= e($error) ?></div><?php endforeach; ?>
        <form method="post" class="stack">
            <?= csrf_field() ?>
            <input type="hidden" name="action" value="password">
            <label>දැනට තියෙන මුරපදය
                <input type="password" name="current" required autocomplete="current-password">
            </label>
            <label>නව මුරපදය
                <input type="password" name="next" required minlength="4" autocomplete="new-password">
            </label>
            <label>නව මුරපදය නැවත
                <input type="password" name="confirm" required minlength="4" autocomplete="new-password">
            </label>
            <button class="btn btn-gold" type="submit">මුරපදය යාවත්කාලීන කරන්න</button>
        </form>
    </section>
</div>
<?php
page_footer();
