<?php
declare(strict_types=1);

require __DIR__ . '/includes/bootstrap.php';
require __DIR__ . '/includes/health.php';
require __DIR__ . '/includes/layout.php';

if ($user = current_user()) {
    redirect($user['role'] === 'admin' ? 'admin/index.php' : 'dashboard.php');
}

$error = '';
$code = '';
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    csrf_check();
    $code = trim((string) ($_POST['user_code'] ?? ''));
    $password = (string) ($_POST['password'] ?? '');
    $stmt = db()->prepare('SELECT * FROM users WHERE user_code = ? COLLATE NOCASE');
    $stmt->execute([$code]);
    $found = $stmt->fetch();
    if (!$found || !password_verify($password, (string) $found['password_hash'])) {
        $error = 'හැඳුනුම් අංකය හෝ මුරපදය වැරදියි.';
    } elseif ($found['status'] !== 'active') {
        $error = 'මෙම ගිණුම නවතා ඇත. පරිපාලක අමතන්න.';
    } else {
        session_regenerate_id(true);
        $_SESSION['uid'] = (int) $found['id'];
        redirect($found['role'] === 'admin' ? 'admin/index.php' : 'dashboard.php');
    }
}

page_header('පිවිසීම', 'login');
?>
<section class="auth">
    <p class="eyebrow">MDTU · SPC</p>
    <h1>පිවිසෙන්න</h1>
    <p class="lede">හැඳුනුම් අංකය සහ මුරපදය යොදන්න. අද ටිප් එක සහ දාමය ඇතුළත ඉන්න බලාගෙන.</p>
    <?php if ($error): ?><div class="flash bad"><?= e($error) ?></div><?php endif; ?>
    <form method="post" class="stack">
        <?= csrf_field() ?>
        <label>හැඳුනුම් අංකය
            <input name="user_code" required autocomplete="username" value="<?= e($code) ?>">
        </label>
        <label>මුරපදය
            <input name="password" type="password" required autocomplete="current-password">
        </label>
        <button class="btn btn-navy" type="submit">ඇතුළු වන්න</button>
    </form>
    <p class="muted">ගිණුමක් නැද්ද? <a href="<?= e(url('register.php')) ?>">ලියාපදිංචි වන්න</a></p>
</section>
<?php
page_footer();
