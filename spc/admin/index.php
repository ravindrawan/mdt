<?php
declare(strict_types=1);

require __DIR__ . '/../includes/bootstrap.php';
require __DIR__ . '/../includes/health.php';
require __DIR__ . '/../includes/layout.php';

$admin = require_admin();
$pwErrors = [];

if ($_SERVER['REQUEST_METHOD'] === 'POST' && (($_POST['action'] ?? '') === 'password')) {
    csrf_check();
    $current = (string) ($_POST['current'] ?? '');
    $next = (string) ($_POST['next'] ?? '');
    $confirm = (string) ($_POST['confirm'] ?? '');
    if (!password_verify($current, (string) $admin['password_hash'])) {
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
            (int) $admin['id'],
        ]);
        flash('ok', 'පරිපාලක මුරපදය වෙනස් වුණා.');
        redirect('admin/index.php');
    }
}

$today = date('Y-m-d');
[$start, $end] = month_bounds(date('Y-m'));
$users = (int) db()->query("SELECT COUNT(*) FROM users WHERE role = 'user'")->fetchColumn();
$active = (int) db()->query("SELECT COUNT(*) FROM users WHERE role = 'user' AND status = 'active'")->fetchColumn();
$todayCount = (int) db()->query("SELECT COUNT(*) FROM readings WHERE recorded_on = " . db()->quote($today))->fetchColumn();
$monthCount = (int) db()->query('SELECT COUNT(*) FROM readings WHERE recorded_on >= ' . db()->quote($start) . ' AND recorded_on < ' . db()->quote($end))->fetchColumn();

$people = db()->query("SELECT * FROM users WHERE role = 'user' ORDER BY name")->fetchAll();
$attention = [];
foreach ($people as $person) {
    $snap = latest_snapshot((int) $person['id']);
    if (needs_attention($snap)) {
        $attention[] = ['user' => $person, 'snap' => $snap, 'pack' => advice_pack($snap)];
    }
}

$recent = db()->query(<<<'SQL'
SELECT r.*, u.name AS user_name, u.user_code, u.phone
FROM readings r
JOIN users u ON u.id = r.user_id
ORDER BY r.recorded_on DESC, r.id DESC
LIMIT 12
SQL)->fetchAll();

page_header('පරිපාලක', 'admin');
?>
<section class="hello slim">
    <div>
        <p class="eyebrow">MDTU පරිපාලනය</p>
        <h1>සියලු දෙනාගේ සෞඛ්‍ය සටහන්</h1>
        <p class="muted">ගිණුම් පාලනය, මුරපද වෙනස් කිරීම සහ ඉතිහාසය මෙතනින්.</p>
    </div>
</section>

<section class="stats">
    <article class="stat"><span>ගිණුම්</span><strong><?= (int) $users ?></strong><p>සක්‍රිය <?= (int) $active ?></p></article>
    <article class="stat"><span>අද මැනුම්</span><strong><?= (int) $todayCount ?></strong><p><?= e(nice_date($today)) ?></p></article>
    <article class="stat"><span>මෙම මාසය</span><strong><?= (int) $monthCount ?></strong><p><?= e(month_label(date('Y-m'))) ?></p></article>
    <article class="stat"><span>අවධානය</span><strong><?= count($attention) ?></strong><p>මායිම් හෝ ඉහළ අගයන්</p></article>
</section>

<section class="card">
    <h2>අවධානය ඕනෑ</h2>
    <?php if (!$attention): ?>
        <div class="empty"><strong>දැනට විශේෂ අවධානයක් ඕනෑ කරන අගයන් නැත</strong><p>නව මැනුම් ආවොත් මෙතන පෙනේ.</p></div>
    <?php else: ?>
        <div class="table-wrap"><table class="grid">
            <thead><tr><th>නම</th><th>දුරකථනය</th><th>සමබර</th><th>තත්ත්වය</th><th></th></tr></thead>
            <tbody>
            <?php foreach ($attention as $item): ?>
                <tr>
                    <td><?= e($item['user']['name']) ?><div class="muted"><?= e($item['user']['user_code']) ?></div></td>
                    <td><?= e(format_phone((string) $item['user']['phone'])) ?></td>
                    <td><?= e((string) ($item['pack']['score'] ?? '—')) ?></td>
                    <td><?= e($item['pack']['lead']) ?></td>
                    <td><a class="btn btn-tiny btn-navy" href="<?= e(url('admin/user.php?id=' . (int) $item['user']['id'])) ?>">විවෘත කරන්න</a></td>
                </tr>
            <?php endforeach; ?>
            </tbody>
        </table></div>
    <?php endif; ?>
</section>

<section class="card">
    <h2>මෑත මැනුම්</h2>
    <?php readings_table($recent, false, true); ?>
    <p class="month-link"><a href="<?= e(url('admin/history.php')) ?>">සම්පූර්ණ ඉතිහාසය</a></p>
</section>

<section class="card narrow">
    <h2>පරිපාලක මුරපදය</h2>
    <?php foreach ($pwErrors as $error): ?><div class="flash bad"><?= e($error) ?></div><?php endforeach; ?>
    <form method="post" class="stack">
        <?= csrf_field() ?>
        <input type="hidden" name="action" value="password">
        <label>දැනට තියෙන මුරපදය
            <input type="password" name="current" required autocomplete="current-password">
        </label>
        <div class="pair">
            <label>නව මුරපදය
                <input type="password" name="next" required minlength="4" autocomplete="new-password">
            </label>
            <label>නැවත
                <input type="password" name="confirm" required minlength="4" autocomplete="new-password">
            </label>
        </div>
        <button class="btn btn-gold" type="submit">වෙනස් කරන්න</button>
    </form>
</section>
<?php
page_footer();
