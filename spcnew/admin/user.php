<?php
declare(strict_types=1);

require __DIR__ . '/../includes/bootstrap.php';
require __DIR__ . '/../includes/health.php';
require __DIR__ . '/../includes/layout.php';

$admin = require_admin();
$id = (int) ($_GET['id'] ?? 0);
$person = user_by_id($id);
if (!$person || $person['role'] !== 'user') {
    flash('bad', 'ගිණුම හමු නොවුණා.');
    redirect('admin/users.php');
}

$errors = [];
$pwErrors = [];

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    csrf_check();
    $action = (string) ($_POST['action'] ?? '');
    if ($action === 'delete') {
        delete_reading($admin, (int) ($_POST['reading_id'] ?? 0));
        redirect('admin/user.php?id=' . $id);
    }
    if ($action === 'status') {
        $next = (string) ($_POST['status'] ?? '');
        if (in_array($next, ['active', 'disabled'], true)) {
            db()->prepare('UPDATE users SET status = ? WHERE id = ? AND role = ?')->execute([$next, $id, 'user']);
            flash('ok', $next === 'active' ? 'ගිණුම සක්‍රිය කළා.' : 'ගිණුම නවත්වා ඇත. පිවිසිය නොහැක.');
        }
        redirect('admin/user.php?id=' . $id);
    }
    if ($action === 'details') {
        $name = trim((string) ($_POST['name'] ?? ''));
        $phoneRaw = trim((string) ($_POST['phone'] ?? ''));
        $code = trim((string) ($_POST['user_code'] ?? ''));
        $phone = normalize_phone($phoneRaw);
        if (!valid_name($name)) {
            $errors[] = 'නම වලංගු නැත.';
        }
        if ($phone === null) {
            $errors[] = 'දුරකථන අංකය 07xxxxxxxx ආකාරයට දෙන්න.';
        }
        if (!valid_code($code)) {
            $errors[] = 'හැඳුනුම් අංකය වලංගු නැත.';
        } elseif (strcasecmp($code, 'admin') === 0 || code_taken($code, $id)) {
            $errors[] = 'මෙම හැඳුනුම් අංකය භාවිතයේ ඇත.';
        }
        if (!$errors && $phone !== null) {
            db()->prepare('UPDATE users SET name = ?, phone = ?, user_code = ? WHERE id = ?')->execute([$name, $phone, $code, $id]);
            flash('ok', 'ගිණුමේ තොරතුරු සුරකින ලදි.');
            redirect('admin/user.php?id=' . $id);
        }
        $person['name'] = $name;
        $person['phone'] = $phoneRaw;
        $person['user_code'] = $code;
    }
    if ($action === 'password') {
        $next = (string) ($_POST['next'] ?? '');
        $confirm = (string) ($_POST['confirm'] ?? '');
        if (strlen($next) < 4) {
            $pwErrors[] = 'මුරපදය අකුරු 4කට වඩා දිග විය යුතුයි.';
        }
        if ($next !== $confirm) {
            $pwErrors[] = 'මුරපද දෙක නොගැලපේ.';
        }
        if (!$pwErrors) {
            db()->prepare('UPDATE users SET password_hash = ? WHERE id = ?')->execute([password_hash($next, PASSWORD_DEFAULT), $id]);
            flash('ok', 'මුරපදය වෙනස් කළා. පුද්ගලයාට නව මුරපදය කියන්න.');
            redirect('admin/user.php?id=' . $id);
        }
    }
}

if (!$errors && !$pwErrors) {
    $fresh = user_by_id($id);
    if ($fresh) {
        $person = $fresh;
    }
}
$snap = latest_snapshot($id);
$pack = advice_pack($snap);
$stmt = db()->prepare('SELECT * FROM readings WHERE user_id = ? ORDER BY recorded_on DESC, id DESC');
$stmt->execute([$id]);
$readings = $stmt->fetchAll();

page_header($person['name'], 'users');
?>
<p class="back"><a href="<?= e(url('admin/users.php')) ?>">← ගිණුම් වෙත</a></p>
<section class="hello slim">
    <div>
        <p class="eyebrow">පුද්ගලික ඉතිහාසය</p>
        <h1><?= e((string) $person['name']) ?></h1>
        <p class="muted"><?= e((string) $person['user_code']) ?> · <?= e(format_phone((string) $person['phone'])) ?> · <?= $person['status'] === 'active' ? 'සක්‍රිය' : 'නවතා ඇත' ?></p>
    </div>
    <form method="post" <?= $person['status'] === 'active' ? 'data-confirm="මෙම ගිණුම නවත්වනවාද? පිවිසිය නොහැකි වේ."' : '' ?>>
        <?= csrf_field() ?>
        <input type="hidden" name="action" value="status">
        <?php if ($person['status'] === 'active'): ?>
            <input type="hidden" name="status" value="disabled">
            <button class="btn btn-danger" type="submit">ගිණුම නවත්වන්න</button>
        <?php else: ?>
            <input type="hidden" name="status" value="active">
            <button class="btn btn-navy" type="submit">නැවත සක්‍රිය කරන්න</button>
        <?php endif; ?>
    </form>
</section>

<?php advice_panel($pack, false); ?>

<div class="work">
    <section class="card">
        <h2>ගිණුමේ තොරතුරු</h2>
        <?php foreach ($errors as $error): ?><div class="flash bad"><?= e($error) ?></div><?php endforeach; ?>
        <form method="post" class="stack">
            <?= csrf_field() ?>
            <input type="hidden" name="action" value="details">
            <label>නම
                <input name="name" required value="<?= e((string) $person['name']) ?>">
            </label>
            <label>දුරකථන අංකය
                <input name="phone" required value="<?= e((string) $person['phone']) ?>">
            </label>
            <label>හැඳුනුම් අංකය
                <input name="user_code" required value="<?= e((string) $person['user_code']) ?>">
            </label>
            <button class="btn btn-navy" type="submit">සුරකින්න</button>
        </form>
    </section>
    <section class="card">
        <h2>මුරපදය වෙනස් කරන්න</h2>
        <p class="muted">පුද්ගලයාට පිවිසිය නොහැකි නම් මෙතනින් අලුත් මුරපදයක් දෙන්න.</p>
        <?php foreach ($pwErrors as $error): ?><div class="flash bad"><?= e($error) ?></div><?php endforeach; ?>
        <form method="post" class="stack">
            <?= csrf_field() ?>
            <input type="hidden" name="action" value="password">
            <label>නව මුරපදය
                <input type="password" name="next" required minlength="4" autocomplete="new-password">
            </label>
            <label>නැවත
                <input type="password" name="confirm" required minlength="4" autocomplete="new-password">
            </label>
            <button class="btn btn-gold" type="submit">මුරපදය සකසන්න</button>
        </form>
    </section>
</div>

<section class="card">
    <h2>සියලු මැනුම්</h2>
    <?php readings_table($readings, true); ?>
</section>
<?php
page_footer();
