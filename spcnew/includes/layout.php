<?php
declare(strict_types=1);

function page_header(string $title, string $active = ''): void
{
    $user = current_user();
    header('Content-Type: text/html; charset=UTF-8');
    $home = $user ? ($user['role'] === 'admin' ? url('admin/index.php') : url('dashboard.php')) : url('index.php');
    ?>
<!DOCTYPE html>
<html lang="si">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="robots" content="noindex">
    <title><?= e($title) ?> · SPC | MDTU</title>
    <link rel="icon" href="<?= e(url('assets/img/wayamba-logo.jpg')) ?>" type="image/jpeg">
    <link rel="stylesheet" href="<?= e(url('assets/css/style.css')) ?>">
</head>
<body>
<a class="skip" href="#main">අන්තර්ගතයට යන්න</a>
<header class="mast">
    <div class="mast-inner">
        <a class="brand" href="<?= e($home) ?>">
            <span class="emblem notranslate">
                <img src="<?= e(url('assets/img/wayamba-logo.jpg')) ?>" alt="වයඹ පළාත් සභාව">
            </span>
            <span class="brand-text">
                <span class="brand-kicker">වයඹ පළාත් සභාව</span>
                <span class="brand-title">කළමනාකරණ සංවර්ධන හා පුහුණු ඒකකය</span>
                <span class="brand-sub">Management Development &amp; Training Unit</span>
            </span>
        </a>
        <div class="spc-badge">
            <strong>SPC</strong>
            <span>සෞඛ්‍ය දිනපොත</span>
            <em>Sugar · Pressure · Cholesterol</em>
        </div>
    </div>
    <div class="goldline"></div>
    <nav class="nav">
        <input class="nav-toggle" id="nav-toggle" type="checkbox">
        <label class="nav-burger" for="nav-toggle">මෙනු</label>
        <div class="nav-links">
            <?php if (!$user): ?>
                <?php nav_link('index.php', 'මුල් පිටුව', $active === 'home'); ?>
                <?php nav_link('login.php', 'පිවිසෙන්න', $active === 'login'); ?>
                <?php nav_link('register.php', 'ලියාපදිංචිය', $active === 'register'); ?>
            <?php elseif ($user['role'] === 'admin'): ?>
                <?php nav_link('admin/index.php', 'දළ විශ්ලේෂණය', $active === 'admin'); ?>
                <?php nav_link('admin/history.php', 'සියලු ඉතිහාසය', $active === 'ahistory'); ?>
                <?php nav_link('admin/users.php', 'ගිණුම්', $active === 'users'); ?>
            <?php else: ?>
                <?php nav_link('dashboard.php', 'අද', $active === 'dashboard'); ?>
                <?php nav_link('history.php', 'මාසය', $active === 'history'); ?>
                <?php nav_link('chat.php', 'සංවාදය', $active === 'chat'); ?>
                <?php nav_link('profile.php', 'පැතිකඩ', $active === 'profile'); ?>
            <?php endif; ?>
        </div>
        <div class="nav-end">
            <div id="google_translate_element" class="lang-switch"></div>
            <?php if ($user): ?>
                <div class="nav-user">
                    <span><?= e($user['name']) ?></span>
                    <form method="post" action="<?= e(url('logout.php')) ?>">
                        <?= csrf_field() ?>
                        <button type="submit">පිටවීම</button>
                    </form>
                </div>
            <?php endif; ?>
        </div>
    </nav>
</header>
<main id="main" class="wrap">
    <?php $flash = flash(); ?>
    <?php if ($flash): ?>
        <div class="flash <?= e((string) $flash['type']) ?>" role="status"><?= e((string) $flash['message']) ?></div>
    <?php endif; ?>
    <?php
}

function nav_link(string $path, string $label, bool $on): void
{
    $class = $on ? ' class="is-on"' : '';
    echo '<a' . $class . ' href="' . e(url($path)) . '">' . e($label) . '</a>';
}

function page_footer(): void
{
    ?>
</main>
<footer class="site-foot">
    <div class="wrap foot-grid">
        <div>
            <strong>MDTU · SPC සෞඛ්‍ය දිනපොත</strong>
            <p>සීනි, රුධිර පීඩනය, කොලෙස්ටරෝල් සහ BMI එක තැනක සටහන් කර, මාසය විශ්ලේෂණය කර, සෞඛ්‍ය තත්ත්වය රැකගන්නා ආකාරය කියාදෙන පුහුණු ඒකකයේ මෙවලමකි.</p>
        </div>
        <p class="disclaimer">මෙය වෛද්‍ය රෝග විනිශ්චයක් හෝ ප්‍රතිකාරයක් නොවේ. අගයන් අසාමාන්‍ය නම්, හෝ ලෙඩක් දැනේ නම්, වෛද්‍යවරයකු හමුවන්න. ඖෂධ වෙනස් කිරීමට පෙර වෛද්‍ය උපදෙස් ගන්න. දුරකථන අංකය පරිපාලකට පමණක් පෙනේ.</p>
    </div>
    <div class="foot-bar">© <?= e(date('Y')) ?> කළමනාකරණ සංවර්ධන හා පුහුණු ඒකකය</div>
    <p class="dev-credit notranslate">Web developer — Anurasiri Wickramanayake (Development Officer) · <a href="mailto:Anurasiri123@gmail.com">Anurasiri123@gmail.com</a></p>
</footer>
<script src="<?= e(url('assets/js/app.js')) ?>"></script>
<script>
function googleTranslateElementInit() {
    new google.translate.TranslateElement({
        pageLanguage: 'si',
        includedLanguages: 'si,ta,en',
        autoDisplay: false,
        layout: google.translate.TranslateElement.InlineLayout.SIMPLE
    }, 'google_translate_element');
}
</script>
<script src="https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit"></script>
</body>
</html>
    <?php
}

function readings_table(array $rows, bool $allowDelete = false, bool $showUser = false): void
{
    if (!$rows) {
        echo '<div class="empty"><strong>මැනුම් නැත</strong><p>මෙම ලැයිස්තුවේ තවම සටහන් නැත.</p></div>';
        return;
    }
    echo '<div class="table-wrap"><table class="grid"><thead><tr>';
    if ($showUser) {
        echo '<th>පුද්ගලයා</th>';
    }
    echo '<th>දිනය</th><th>වේලාව</th><th>සීනි</th><th>පීඩනය</th><th>කොලෙස්ටරෝල්</th><th>බර</th><th>BMI</th><th>සටහන</th>';
    if ($allowDelete) {
        echo '<th class="no-print"></th>';
    }
    echo '</tr></thead><tbody>';
    foreach ($rows as $row) {
        echo '<tr>';
        if ($showUser) {
            $href = url('admin/user.php?id=' . (int) $row['user_id']);
            echo '<td><a href="' . e($href) . '">' . e($row['user_name'] ?? '') . '</a><div class="muted">' . e($row['user_code'] ?? '') . '</div></td>';
        }
        echo '<td>' . e(nice_date((string) $row['recorded_on'], true)) . '</td>';
        echo '<td>' . e(date('H:i', strtotime((string) $row['created_at']))) . '</td>';
        echo '<td>';
        if (fval($row['sugar_mgdl']) !== null) {
            $status = sugar_status(fval($row['sugar_mgdl']), (string) ($row['sugar_type'] ?? 'fasting'));
            echo e(num($row['sugar_mgdl'])) . ' <span class="muted">' . e(sugar_type_label((string) $row['sugar_type'])) . '</span> ' . pill_html($status);
        } else {
            echo '—';
        }
        echo '</td><td>';
        if ($row['systolic'] !== null && $row['diastolic'] !== null) {
            $status = bp_status((int) $row['systolic'], (int) $row['diastolic']);
            echo e($row['systolic'] . '/' . $row['diastolic']) . ' ' . pill_html($status);
        } else {
            echo '—';
        }
        echo '</td><td>';
        if (fval($row['cholesterol_mgdl']) !== null) {
            echo e(num($row['cholesterol_mgdl'])) . ' ' . pill_html(chol_status(fval($row['cholesterol_mgdl'])));
        } else {
            echo '—';
        }
        echo '</td><td>' . e($row['weight_kg'] !== null ? num($row['weight_kg'], 1) : '—') . '</td><td>';
        if (fval($row['bmi']) !== null) {
            echo e(num($row['bmi'], 1)) . ' ' . pill_html(bmi_status(fval($row['bmi'])));
        } else {
            echo '—';
        }
        echo '</td><td>' . e((string) ($row['note'] ?? '')) . '</td>';
        if ($allowDelete) {
            echo '<td class="no-print"><form method="post" data-confirm="මෙම මැනුම ඉවත් කරනවාද?">' . csrf_field() . '<input type="hidden" name="action" value="delete"><input type="hidden" name="reading_id" value="' . (int) $row['id'] . '"><button class="btn btn-tiny btn-ghost" type="submit">මකන්න</button></form></td>';
        }
        echo '</tr>';
    }
    echo '</tbody></table></div>';
}

function advice_panel(array $pack, bool $showTip = true): void
{
    $tip = daily_tip();
    ?>
    <section class="letter">
        <div class="letter-head">
            <div class="ring tone-<?= e((string) $pack['tone']) ?>" style="--p: <?= (int) ($pack['score'] ?? 0) ?>">
                <svg viewBox="0 0 120 120" aria-hidden="true">
                    <circle class="ring-bg" cx="60" cy="60" r="52"></circle>
                    <circle class="ring-fg" cx="60" cy="60" r="52"></circle>
                </svg>
                <div class="ring-label">
                    <strong><?= $pack['score'] === null ? '—' : e((string) $pack['score']) ?></strong>
                    <span>සමබර</span>
                </div>
            </div>
            <div>
                <p class="eyebrow">ස්වයංක්‍රීය උපදෙස</p>
                <h2><?= e((string) $pack['label']) ?></h2>
                <p><?= e((string) $pack['lead']) ?></p>
            </div>
        </div>
        <?php if (!empty($pack['alert'])): ?>
            <div class="alert"><?= e((string) $pack['alert']) ?></div>
        <?php endif; ?>
        <div class="split">
            <div>
                <h3>හොඳ දේ</h3>
                <?php if (!$pack['good']): ?>
                    <p class="muted">තවම හොඳ පරාසයේ අගයක් නැත. මැනුමක් දැම්මොත් මෙතන පෙනේ.</p>
                <?php endif; ?>
                <?php foreach ($pack['good'] as $item): ?>
                    <article class="note good">
                        <strong><?= e($item['title']) ?></strong>
                        <p><?= e($item['text']) ?></p>
                    </article>
                <?php endforeach; ?>
            </div>
            <div>
                <h3>සකස් කරන්න</h3>
                <?php if (!$pack['fix']): ?>
                    <p class="muted">දැන් වෙනස් කළ යුතු දෙයක් මෙම අගයන්ගෙන් පේන්නේ නැත. පුරුදු රකින්න.</p>
                <?php endif; ?>
                <?php foreach ($pack['fix'] as $item): ?>
                    <article class="note fix">
                        <strong><?= e($item['title']) ?></strong>
                        <p><?= e($item['text']) ?></p>
                    </article>
                <?php endforeach; ?>
            </div>
        </div>
        <?php if (!empty($pack['keep'])): ?>
            <h3>අද කරන කුඩා දේවල්</h3>
            <ul class="keep">
                <?php foreach ($pack['keep'] as $line): ?>
                    <li><?= e($line) ?></li>
                <?php endforeach; ?>
            </ul>
        <?php endif; ?>
        <?php if ($showTip): ?>
            <div class="tip">
                <span>අද ටිප් · <?= e($tip['title']) ?></span>
                <p><?= e($tip['text']) ?></p>
            </div>
        <?php endif; ?>
    </section>
    <?php
}
