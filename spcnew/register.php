<?php
declare(strict_types=1);

require __DIR__ . '/includes/bootstrap.php';
require __DIR__ . '/includes/health.php';
require __DIR__ . '/includes/layout.php';

if ($user = current_user()) {
    redirect($user['role'] === 'admin' ? 'admin/index.php' : 'dashboard.php');
}

$errors = [];
$form = ['name' => '', 'phone' => '', 'user_code' => ''];
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    csrf_check();
    $form['name'] = trim((string) ($_POST['name'] ?? ''));
    $form['phone'] = trim((string) ($_POST['phone'] ?? ''));
    $form['user_code'] = trim((string) ($_POST['user_code'] ?? ''));
    $password = (string) ($_POST['password'] ?? '');
    $confirm = (string) ($_POST['confirm'] ?? '');
    $phone = normalize_phone($form['phone']);

    if (!valid_name($form['name'])) {
        $errors[] = 'නම සිංහල හෝ ඉංග්‍රීසි අකුරු වලින්, අකුරු 2–80 අතර දෙන්න.';
    }
    if ($phone === null) {
        $errors[] = 'දුරකථන අංකය 07xxxxxxxx ආකාරයට දෙන්න.';
    }
    if (!valid_code($form['user_code'])) {
        $errors[] = 'හැඳුනුම් අංකය අකුරු හෝ ඉලක්කම් 3–30ක් විය යුතුයි.';
    } elseif (strcasecmp($form['user_code'], 'admin') === 0 || code_taken($form['user_code'])) {
        $errors[] = 'මෙම හැඳුනුම් අංකය දැනටමත් භාවිතයේ ඇත.';
    }
    if (strlen($password) < 4) {
        $errors[] = 'මුරපදය අකුරු 4කට වඩා දිග විය යුතුයි.';
    }
    if ($password !== $confirm) {
        $errors[] = 'මුරපද දෙක නොගැලපේ.';
    }

    if (!$errors && $phone !== null) {
        $stmt = db()->prepare('INSERT INTO users (user_code, name, phone, password_hash, role, status, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)');
        $stmt->execute([
            $form['user_code'],
            $form['name'],
            $phone,
            password_hash($password, PASSWORD_DEFAULT),
            'user',
            'active',
            date('Y-m-d H:i:s'),
        ]);
        session_regenerate_id(true);
        $_SESSION['uid'] = (int) db()->lastInsertId();
        flash('ok', 'ලියාපදිංචිය සාර්ථකයි. අද පළමු මැනුම දාමු.');
        redirect('dashboard.php');
    }
}

page_header('ලියාපදිංචිය', 'register');
?>
<section class="auth wide">
    <p class="eyebrow">MDTU · SPC</p>
    <h1>ලියාපදිංචි වන්න</h1>
    <p class="lede">විනාඩියකින් ගිණුම හදාගන්න. අද ටිප් එක, දාමය, සහ ඔබේ ඉතිහාසය මුද්‍රණය කිරීම ඊට පස්සේ ඔබටම.</p>
    <ul class="join-points">
        <li>නොමිලේ. ඔබේ සටහන් වෙන අයට පේන්නේ නැහැ.</li>
        <li>දවසකට එක මැනුමක් හෝ එක පුරුද්දක් ඇත.</li>
        <li>මාසයේ විශ්ලේෂණය වෛද්‍යවරයාට මුද්‍රණය කර දෙන්න පුළුවන්.</li>
    </ul>
    <?php foreach ($errors as $error): ?><div class="flash bad"><?= e($error) ?></div><?php endforeach; ?>
    <form method="post" class="stack">
        <?= csrf_field() ?>
        <label>සම්පූර්ණ නම
            <input name="name" required maxlength="80" autocomplete="name" value="<?= e($form['name']) ?>">
        </label>
        <label>දුරකථන අංකය
            <input name="phone" required inputmode="tel" autocomplete="tel" placeholder="07xxxxxxxx" value="<?= e($form['phone']) ?>">
        </label>
        <label>හැඳුනුම් අංකය
            <input name="user_code" required maxlength="30" autocomplete="username" value="<?= e($form['user_code']) ?>">
            <span class="help">පිවිසීමේදී මෙය යොදයි. පසුව මතක තියාගන්න.</span>
        </label>
        <div class="pair">
            <label>මුරපදය
                <input name="password" type="password" required minlength="4" autocomplete="new-password">
            </label>
            <label>මුරපදය නැවත
                <input name="confirm" type="password" required minlength="4" autocomplete="new-password">
            </label>
        </div>
        <button class="btn btn-navy" type="submit">ගිණුම සාදන්න</button>
    </form>
    <p class="muted">දැනටමත් ගිණුමක් තියෙනවද? <a href="<?= e(url('login.php')) ?>">පිවිසෙන්න</a></p>
</section>
<?php
page_footer();
