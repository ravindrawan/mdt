<?php
declare(strict_types=1);

require __DIR__ . '/includes/bootstrap.php';
require __DIR__ . '/includes/health.php';
require __DIR__ . '/includes/layout.php';

$tip = daily_tip();
$invite = today_invite();
$viewer = current_user();
$enter = $viewer ? ($viewer['role'] === 'admin' ? url('admin/index.php') : url('dashboard.php')) : url('register.php');

page_header('මුල් පිටුව', 'home');
?>
<section class="hero">
    <div class="hero-copy">
        <p class="eyebrow light">MDTU සෞඛ්‍ය දිනපොත</p>
        <h1>සීනි, පීඩනය, කොලෙස්ටරෝල් — එකම තැනක.</h1>
        <p>දවසකට විනාඩියක්. අද ටිප් එක, ඔබේ අගය, සහ මාසයේ රටාව එකම තැනක. ලියාපදිංචිය නොමිලේ. ඔබේ සටහන් වෙන කෙනෙකුට පේන්නේ නැහැ.</p>
        <div class="hero-actions">
            <a class="btn btn-gold" href="<?= e($enter) ?>"><?= $viewer ? 'ඔබේ දිනපොත' : 'ලියාපදිංචි වන්න' ?></a>
            <?php if (!$viewer): ?>
                <a class="btn btn-ghost light" href="<?= e(url('login.php')) ?>">දැනටමත් ගිණුමක් තියෙනවා</a>
            <?php endif; ?>
        </div>
    </div>
</section>

<section class="intro">
    <div>
        <p class="eyebrow">SPC යනු</p>
        <h2>S සීනි, P පීඩනය, C කොලෙස්ටරෝල්.</h2>
        <p>ඊට BMI එකතු වෙනවා. මේ හතර සමබරද කියා බලලා, හොඳ දේ රකින්නේ කොහොමද, අකරු අගය සකස් කරන්නේ කොහොමද කියලා උපදෙස් එනවා. හැම දවසකම එක මැනුමක් හෝ එක පුරුද්දක් සටහන් කළාම දාමය දිගටම යනවා.</p>
    </div>
    <aside class="sample">
        <p class="eyebrow">උදාහරණ පෙනුම</p>
        <div class="sample-row"><span>සීනි</span><strong>96</strong><em class="pill good">හොඳයි</em></div>
        <div class="sample-row"><span>පීඩනය</span><strong>118/76</strong><em class="pill good">හොඳයි</em></div>
        <div class="sample-row"><span>කොලෙස්ටරෝල්</span><strong>188</strong><em class="pill good">හොඳයි</em></div>
        <div class="sample-row"><span>BMI</span><strong>23.4</strong><em class="pill good">හොඳයි</em></div>
    </aside>
</section>

<section class="cards four">
    <article class="card">
        <span class="mark">S</span>
        <h3>රුධිර සීනි</h3>
        <p>නිරාහාර, අහඹු, හෝ ආහාරයෙන් පසු අගය mg/dL වලින්. හොඳ පරාසයෙන් බැහැර නම් කෑම සහ ඇවිදීම ගැන පැහැදිලි උපදෙසක්.</p>
    </article>
    <article class="card">
        <span class="mark">P</span>
        <h3>රුධිර පීඩනය</h3>
        <p>ඉහළ සහ පහළ අගය mmHg වලින්. ලුණු, විවේකය සහ වෛද්‍යවරයා හමුවිය යුතු මොහොත කියාදෙයි.</p>
    </article>
    <article class="card">
        <span class="mark">C</span>
        <h3>කොලෙස්ටරෝල්</h3>
        <p>මුළු කොලෙස්ටරෝල් සටහන් කරන්න. බැදපු ආහාර අඩු කර, මාළු සහ කොළ එළවළු වැඩි කරන ආකාරය කියයි.</p>
    </article>
    <article class="card">
        <span class="mark">B</span>
        <h3>BMI</h3>
        <p>උස සහ බරින් ශරීර ස්කන්ධ දර්ශකය ගණනය වේ. බර වැඩිද අඩුද බලලා පිඟාන සකස් කරන උපදෙස එයි.</p>
    </article>
</section>

<section class="invite">
    <div>
        <p class="eyebrow light">අද · <?= e(sinhala_weekday((int) date('w'))) ?></p>
        <h2><?= e($invite[0]) ?></h2>
        <p><?= e($invite[1]) ?></p>
    </div>
    <?php if (!$viewer): ?>
        <a class="btn btn-gold" href="<?= e(url('register.php')) ?>">අදම පටන් ගන්න</a>
    <?php else: ?>
        <a class="btn btn-gold" href="<?= e($enter) ?>">අද සටහන</a>
    <?php endif; ?>
</section>

<section class="perks">
    <article class="perk">
        <strong>දවසකට විනාඩියක්</strong>
        <p>හැම අගයක්ම දිනපතා ඕනෑ නැහැ. තියෙන එක සටහනක්, නැතිනම් අද කළ පුරුද්දක්, දාමය රකිනවා.</p>
    </article>
    <article class="perk">
        <strong>අද ටිප් එක අලුත්</strong>
        <p>හැම දවසකම කෑම, ඇවිදීම, නින්ද ගැන වෙනස් උපදෙසක්. ඒ නිසා හෙටත් එන්න දෙයක් තියෙනවා.</p>
    </article>
    <article class="perk">
        <strong>ඔබටම විතරයි</strong>
        <p>නම, දුරකථනය, හැඳුනුම් අංකය. වෙන පරිශීලකයෙකුගේ සටහන් ඔබට පේන්නේ නැහැ.</p>
    </article>
    <article class="perk">
        <strong>වෛද්‍යවරයාට මුද්‍රණය</strong>
        <p>මාසය හෝ සියලු ඉතිහාසය ඕන වෙලාවට මුද්‍රණය කරලා ගෙනියන්න පුළුවන්.</p>
    </article>
</section>

<section class="visit">
    <div>
        <p class="eyebrow">පටන් ගන්න ආකාරය</p>
        <h2>ලියාපදිංචිය විනාඩියක්. ඊළඟ දවසේ ඉඳන් දාමය යනවා.</h2>
        <ol class="steps">
            <li><strong>ලියාපදිංචි වන්න.</strong> නම, දුරකථනය, හැඳුනුම් අංකය සහ මුරපදය.</li>
            <li><strong>අද මැනුම දාන්න.</strong> සීනි, පීඩනය, කොලෙස්ටරෝල්, බර. එකක් විතරක් දාන්නත් ඇත.</li>
            <li><strong>හෙට ආපහු එන්න.</strong> ටිප් එක, දාමය, සහ මාසයේ විශ්ලේෂණය බලන්න.</li>
        </ol>
    </div>
    <article class="card tip-card">
        <p class="eyebrow">අද ටිප් · <?= e($tip['title']) ?></p>
        <p><?= e($tip['text']) ?></p>
        <?php if (!$viewer): ?>
            <a class="btn btn-navy" href="<?= e(url('register.php')) ?>">මගේ දිනපොත පටන් ගන්න</a>
        <?php else: ?>
            <a class="btn btn-navy" href="<?= e($enter) ?>">ඔබේ දිනපොත</a>
        <?php endif; ?>
    </article>
</section>
<?php
page_footer();
