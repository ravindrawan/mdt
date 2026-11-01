<?php

require_once MDTU_ROOT . '/php/assemble.php';

function r_groups(): array
{
    return [
        ['slug' => 'training', 'en' => 'Programmes & progress', 'si' => 'වැඩසටහන් හා ප්‍රගතිය', 'ta' => 'பயிற்சிகளும் முன்னேற்றமும்'],
        ['slug' => 'milestones', 'en' => 'Milestones', 'si' => 'සන්ධිස්ථාන', 'ta' => 'மைல்கற்கள்'],
        ['slug' => 'language', 'en' => 'Language & external courses', 'si' => 'භාෂා හා බාහිර පාඨමාලා', 'ta' => 'மொழி மற்றும் வெளிப்புற பாடநெறிகள்'],
        ['slug' => 'scholarship', 'en' => 'Foreign scholarships', 'si' => 'විදේශ ශිෂ්‍යත්ව', 'ta' => 'வெளிநாட்டு உதவித்தொகை'],
        ['slug' => 'creative', 'en' => 'Creative corner', 'si' => 'නිර්මාණ කොන', 'ta' => 'படைப்பு மூலை'],
        ['slug' => 'plans', 'en' => 'The month ahead', 'si' => 'ඉදිරි මාසය', 'ta' => 'வரும் மாதம்'],
    ];
}

function r_tr(string $lang, string $en, string $si, string $ta): string
{
    if ($lang === 'si') return $si;
    if ($lang === 'ta') return $ta;
    return $en;
}

function r_lang(string $lang): string
{
    return $lang === 'si' || $lang === 'ta' ? $lang : 'en';
}

function r_pick(array $article, string $lang, string $enKey, string $siKey): string
{
    $si = $article[$siKey] ?? '';
    $en = $article[$enKey] ?? '';
    if ($lang === 'si' && $si) return $si;
    return $en ?: ($si ?: '');
}

function load_bundle(string $slug): ?array
{
    $magazine = db_get('SELECT * FROM magazines WHERE slug = ?', [$slug]);
    if (!$magazine) return null;
    $magazine['highlights'] = parse_json($magazine['highlights_json'], []);
    $identity = issue_series(db_all('SELECT id, year, month FROM magazines'));
    $series = $identity[(int) $magazine['id']] ?? ['volume' => 1, 'number' => 1];
    $magazine['volume'] = $series['volume'];
    $magazine['number'] = $series['number'];
    $articles = db_all(
        'SELECT a.*, c.slug AS category_slug, c.name_en AS category_en, c.name_si AS category_si,
                u.full_name_en AS author_en, u.full_name_si AS author_si,
                u.designation_en AS role_en, u.designation_si AS role_si, u.avatar_path,
                p.start_date, p.end_date, p.target_group_en, p.target_group_si,
                p.venue_en, p.venue_si, p.participants, p.outcomes_en, p.outcomes_si, p.metrics_json
         FROM articles a
         JOIN categories c ON c.id = a.category_id
         JOIN users u ON u.id = a.user_id
         LEFT JOIN programs p ON p.article_id = a.id
         WHERE a.magazine_id = ?
         ORDER BY a.page_number, a.sort_order, a.id',
        [$magazine['id']]
    );
    foreach ($articles as &$article) {
        $article['metrics'] = parse_json($article['metrics_json'] ?? '', []);
    }
    unset($article);
    $media = db_all(
        'SELECT * FROM media WHERE magazine_id = ? OR article_id IN (SELECT id FROM articles WHERE magazine_id = ?) ORDER BY id',
        [$magazine['id'], $magazine['id']]
    );
    $mediaByArticle = [];
    foreach ($media as $item) {
        if (!$item['article_id']) continue;
        $mediaByArticle[$item['article_id']][] = $item;
    }
    return ['magazine' => $magazine, 'articles' => $articles, 'media' => $mediaByArticle];
}

function issue_stats(array $articles): array
{
    $training = array_values(array_filter($articles, fn($a) => $a['category_slug'] === 'training'));
    $participants = 0;
    foreach ($training as $article) {
        $participants += (int) ($article['participants'] ?? 0);
    }
    return [
        'workshops' => count($training),
        'participants' => $participants,
        'language' => count(array_filter($articles, fn($a) => $a['category_slug'] === 'language')),
        'scholarships' => count(array_filter($articles, fn($a) => $a['category_slug'] === 'scholarship')),
    ];
}

function on_page(array $articles, $page): array
{
    return array_values(array_filter($articles, fn($article) => (int) $article['page_number'] === (int) $page));
}

function photo_figure($item, string $lang, string $extra = ''): string
{
    if (!$item) {
        return '<figure class="m-photo m-ph ' . $extra . '"></figure>';
    }
    $caption = $lang === 'si' ? ($item['caption_si'] ?: $item['caption_en']) : ($item['caption_en'] ?: $item['caption_si']);
    $fig = $caption ? '<figcaption>' . esc($caption) . '</figcaption>' : '';
    return '<figure class="m-photo ' . $extra . '"><img src="' . esc($item['path']) . '" alt="' . esc($caption) . '">' . $fig . '</figure>';
}

function meta_line(array $article, string $lang): string
{
    $bits = [];
    $range = format_range($article['start_date'] ?? '', $article['end_date'] ?? '', $lang);
    if ($range) $bits[] = $range;
    $venue = r_pick($article, $lang, 'venue_en', 'venue_si');
    if ($venue) $bits[] = $venue;
    if (!empty($article['participants'])) {
        $n = $article['participants'];
        $bits[] = r_tr($lang, "{$n} participants", "සහභාගිවන්නන් {$n}", "{$n} பங்கேற்பாளர்கள்");
    }
    return implode(' · ', $bits);
}

function metric_chips(array $article, string $lang): string
{
    $metrics = $article['metrics'] ?? [];
    $chips = [];
    if (!empty($metrics['sessions'])) $chips[] = '<li><b>' . esc($metrics['sessions']) . '</b><span>' . r_tr($lang, 'sessions', 'සැසි', 'அமர்வுகள்') . '</span></li>';
    if (!empty($metrics['hours'])) $chips[] = '<li><b>' . esc($metrics['hours']) . '</b><span>' . r_tr($lang, 'hours', 'පැය', 'மணி') . '</span></li>';
    if (!empty($metrics['satisfaction'])) $chips[] = '<li><b>' . esc($metrics['satisfaction']) . '%</b><span>' . r_tr($lang, 'satisfaction', 'තෘප්තිය', 'திருப்தி') . '</span></li>';
    if (!$chips) return '';
    return '<ul class="m-metrics">' . implode('', $chips) . '</ul>';
}

function run_head(array $magazine, string $lang, string $section): string
{
    $when = month_name($magazine['month'], $lang) . ' ' . $magazine['year'];
    $mast = r_tr($lang, 'The Trainer', 'පුහුණුකරු', 'பயிற்சியாளர்');
    return '<header class="m-runhead"><span>' . esc($mast) . '</span><span class="m-dot">·</span><span>' . esc($when) . '</span><span class="m-runsec">' . esc($section) . '</span></header>';
}

function run_foot($page, string $lang): string
{
    $unit = r_tr($lang, 'The Trainer', 'පුහුණුකරු', 'பயிற்சியாளர்');
    return '<footer class="m-runfoot"><span>' . $unit . '</span><span>' . str_pad((string) $page, 2, '0', STR_PAD_LEFT) . '</span></footer>';
}

function sheet(string $lang, string $inner, string $extra = ''): string
{
    $face = $lang === 'si' ? 'si' : ($lang === 'ta' ? 'ta' : '');
    return '<section class="sheet ' . $extra . ' ' . $face . '">' . $inner . '</section>';
}

function cover_image(array $magazine, array $articles, array $media): string
{
    $uploaded = !empty($magazine['cover_path']) && !preg_match('#/assets/covers/#', $magazine['cover_path']);
    if ($uploaded) return $magazine['cover_path'];
    $featured = array_values(array_filter($articles, fn($a) => $a['featured'] && $a['category_slug'] !== 'editorial'));
    $pool = $featured ?: array_values(array_filter($articles, fn($a) => $a['category_slug'] !== 'editorial'));
    foreach ($pool as $article) {
        $photo = ($media[$article['id']] ?? [])[0] ?? null;
        if ($photo) return $photo['path'];
    }
    return $magazine['cover_path'] ?: '/assets/covers/2026-10.svg';
}

function cover_source(array $articles): array
{
    $lines = array_slice(array_values(array_filter($articles, fn($a) => $a['featured'])), 0, 3);
    if (!$lines) {
        $lines = array_slice(array_values(array_filter($articles, fn($a) => $a['category_slug'] !== 'editorial')), 0, 3);
    }
    return $lines;
}

function cover_line($article, string $lang): string
{
    if (!$article) return '';
    return r_pick($article, $lang, 'excerpt_en', 'excerpt_si') ?: r_pick($article, $lang, 'title_en', 'title_si');
}

function cover_auto(array $magazine, array $articles): array
{
    $volume = str_pad((string) ($magazine['volume'] ?? 1), 2, '0', STR_PAD_LEFT);
    $number = str_pad((string) ($magazine['number'] ?? 1), 2, '0', STR_PAD_LEFT);
    $lines = cover_source($articles);
    $pack = function (string $lang) use ($lines) {
        $out = [];
        foreach ([0, 1, 2] as $index) {
            $out[] = cover_line($lines[$index] ?? null, $lang);
        }
        return $out;
    };
    return [
        'mast_en' => 'The Trainer',
        'mast_si' => 'පුහුණුකරු',
        'mast_ta' => 'பயிற்சியாளர்',
        'tri' => 'The Trainer · පුහුණුකරු · பயிற்சியாளர்',
        'vol' => "Vol. {$volume}\nNo. {$number}",
        'issue_en' => month_name($magazine['month'], 'en') . " {$magazine['year']} · Vol. {$volume} No. {$number}",
        'issue_si' => month_name($magazine['month'], 'si') . " {$magazine['year']} · Vol. {$volume} No. {$number}",
        'issue_ta' => month_name($magazine['month'], 'ta') . " {$magazine['year']} · Vol. {$volume} No. {$number}",
        'unit_en' => 'Management Development and Training Unit · North Western Provincial Council',
        'unit_si' => 'කළමනාකරණ සංවර්ධන හා පුහුණු ඒකකය · වයඹ පළාත් සභාව',
        'unit_ta' => 'முகாமைத்துவ அபிவிருத்தி மற்றும் பயிற்சி அலகு · வடமேல் மாகாண சபை',
        'title_en' => $magazine['title_en'] ?? '',
        'title_si' => $magazine['title_si'] ?? '',
        'title_ta' => $magazine['title_en'] ?? '',
        'lines_en' => $pack('en'),
        'lines_si' => $pack('si'),
        'lines_ta' => $pack('ta'),
    ];
}

function cover_saved(array $magazine): array
{
    $saved = parse_json($magazine['cover_copy_json'] ?? '', []);
    if (!is_array($saved)) {
        return [];
    }
    $list = $saved === [] || array_keys($saved) === range(0, count($saved) - 1);
    return $list ? [] : $saved;
}

function cover_fields(array $magazine, array $articles): array
{
    return ['auto' => cover_auto($magazine, $articles), 'saved' => cover_saved($magazine)];
}

function cover_value(array $saved, array $auto, string $key): string
{
    $value = trim((string) ($saved[$key] ?? ''));
    return $value !== '' ? $value : (string) ($auto[$key] ?? '');
}

function cover_lines(array $saved, array $auto, string $lang): array
{
    $key = "lines_{$lang}";
    if (isset($saved[$key]) && is_array($saved[$key])) {
        return array_values(array_filter(array_map(fn($line) => trim((string) $line), $saved[$key]), fn($line) => $line !== ''));
    }
    return array_values(array_filter(array_map(fn($line) => trim((string) $line), $auto[$key] ?? []), fn($line) => $line !== ''));
}

function page_cover(array $bundle, string $lang): string
{
    $magazine = $bundle['magazine'];
    $articles = $bundle['articles'];
    $fields = cover_fields($magazine, $articles);
    $face = $lang === 'si' || $lang === 'ta' ? $lang : 'en';
    $items = '';
    foreach (cover_lines($fields['saved'], $fields['auto'], $face) as $line) {
        $items .= '<li>' . esc($line) . '</li>';
    }
    $cover = cover_image($magazine, $articles, $bundle['media']);
    $vol = str_replace("\n", '<br>', esc(cover_value($fields['saved'], $fields['auto'], 'vol')));
    return sheet($lang, '
    <div class="cover-bleed"><img src="' . esc($cover) . '" alt=""></div>
    <div class="cover-shade"></div>
    <div class="cover-frame"></div>
    <header class="cover-banner"><img src="/assets/official-header.jpg" alt=""></header>
    <div class="cover-vol">' . $vol . '</div>
    <h1 class="cover-mast">' . esc(cover_value($fields['saved'], $fields['auto'], "mast_{$face}")) . '</h1>
    <p class="cover-tri">' . esc(cover_value($fields['saved'], $fields['auto'], 'tri')) . '</p>
    <div class="cover-bottom">
      <p class="cover-issue">' . esc(cover_value($fields['saved'], $fields['auto'], "issue_{$face}")) . '</p>
      <p class="cover-unit">' . esc(cover_value($fields['saved'], $fields['auto'], "unit_{$face}")) . '</p>
      <h2 class="cover-title">' . esc(cover_value($fields['saved'], $fields['auto'], "title_{$face}")) . '</h2>
      <ul class="cover-lines">' . $items . '</ul>
    </div>', 'cover front');
}

function page_editorial(array $bundle, string $lang, $sourcePage, $displayPage, array $displayOf): string
{
    $magazine = $bundle['magazine'];
    $articles = $bundle['articles'];
    $desk = on_page($articles, $sourcePage);
    $message = $desk[0] ?? null;
    $director = $desk[1] ?? null;
    $kicker = r_tr($lang, "Deputy Chief Secretary's message", 'නියෝජ්‍ය ප්‍රධාන ලේකම්ගේ අදහස', 'துணை பிரதம செயலாளரின் செய்தி');
    $tocTitle = r_tr($lang, 'In this issue', 'මෙම කලාපයේ', 'இந்த இதழில்');
    $noteKicker = r_tr($lang, "Director's note", 'අධ්‍යක්ෂගේ සටහන', 'இயக்குநர் குறிப்பு');
    $photos = $message ? ($bundle['media'][$message['id']] ?? []) : [];
    $portrait = ($photos[0]['path'] ?? null) ?: ($message['avatar_path'] ?? '') ?: '/assets/portraits/dcs.svg';
    $named = $message && (($message['byline_en'] ?? '') || ($message['byline_si'] ?? ''));
    if ($named) {
        $name = r_pick($message, $lang, 'byline_en', 'byline_si');
        $role = r_tr($lang, 'Deputy Chief Secretary (Training)', 'නියෝජ්‍ය ප්‍රධාන ලේකම් (පුහුණු)', 'துணை பிரதம செயலாளர் (பயிற்சி)');
    } else {
        $name = $message ? r_pick($message, $lang, 'author_en', 'author_si') : ($lang === 'si' ? 'නායකත්ව මේසය' : 'Leadership desk');
        $role = $message ? r_pick($message, $lang, 'role_en', 'role_si') : '';
    }
    $toc = '';
    foreach (r_groups() as $group) {
        $rows = array_values(array_filter($articles, fn($a) => $a['category_slug'] === $group['slug']));
        if (!$rows) continue;
        $page = $displayOf[(int) $rows[0]['page_number']] ?? ($rows[0]['page_number'] ?? '');
        $toc .= '<li><span class="m-toc-title"><span>' . esc(r_tr($lang, $group['en'], $group['si'], $group['ta'])) . '</span></span><span class="m-toc-page">' . esc($page) . '</span></li>';
    }
    $directorHtml = '';
    if ($director) {
        $directorHtml = '<div class="m-note"><p class="m-kicker">' . $noteKicker . '</p><h3>' . esc(r_pick($director, $lang, 'title_en', 'title_si')) . '</h3>'
            . paragraphs(r_pick($director, $lang, 'body_en', 'body_si'), 520)
            . '<p class="m-by">' . esc(r_pick($director, $lang, 'author_en', 'author_si')) . '</p></div>';
    }
    $body = $message
        ? paragraphs(r_pick($message, $lang, 'body_en', 'body_si'), 900)
        : '<p>' . r_tr($lang, 'The leadership message for this issue has not been filed yet.', 'මෙම කලාපය සඳහා නායකත්ව පණිවිඩය තවම ලියා නැත.', 'இந்த இதழுக்கான தலைமைச் செய்தி இன்னும் இல்லை.') . '</p>';
    $title = $message ? r_pick($message, $lang, 'title_en', 'title_si') : r_tr($lang, 'Message', 'පණිවිඩය', 'செய்தி');
    return sheet($lang, '
    <div class="m-frame"></div>
    <div class="m-pad">
      ' . run_head($magazine, $lang, r_tr($lang, 'Leadership', 'පණිවිඩය', 'தலைமை')) . '
      <div class="m-ed">
        <div>
          <p class="m-kicker">' . $kicker . '</p>
          <h2 class="m-h2">' . esc($title) . '</h2>
          <div class="m-portrait"><img src="' . esc($portrait) . '" alt=""><div><strong>' . esc($name) . '</strong><span>' . esc($role) . '</span></div></div>
          <div class="m-copy">' . $body . '</div>
          <p class="m-sign">' . esc($name) . '</p>
        </div>
        <aside>
          <h3 class="m-aside-h">' . $tocTitle . '</h3>
          <ol class="m-toc">' . $toc . '</ol>
          ' . $directorHtml . '
        </aside>
      </div>
      ' . run_foot($displayPage, $lang) . '
    </div>');
}

function story_card(array $article, string $lang, array $media, string $mode, $limit = null): string
{
    $photo = photo_figure($media[0] ?? null, $lang);
    $cap = $limit ?: ($mode === 'lead' ? 680 : 280);
    return '<article class="m-' . $mode . '">' . $photo . '<div><h3>' . esc(r_pick($article, $lang, 'title_en', 'title_si')) . '</h3>'
        . '<p class="m-meta">' . esc(meta_line($article, $lang)) . '</p>'
        . '<div class="m-copy">' . paragraphs(r_pick($article, $lang, 'body_en', 'body_si'), $cap) . '</div>'
        . metric_chips($article, $lang) . '</div></article>';
}

function page_essay(array $bundle, string $lang, $sourcePage, $displayPage): string
{
    $feature = on_page($bundle['articles'], $sourcePage)[0] ?? null;
    $photos = $feature ? ($bundle['media'][$feature['id']] ?? []) : [];
    $cells = '';
    foreach ([0, 1, 2, 3] as $index) {
        $cells .= photo_figure($photos[$index] ?? null, $lang, 'm-cell');
    }
    $title = $feature ? r_pick($feature, $lang, 'title_en', 'title_si') : ($lang === 'si' ? 'රාමු' : 'Frames');
    return sheet($lang, '
    <div class="m-frame"></div>
    <div class="m-pad">
      ' . run_head($bundle['magazine'], $lang, $lang === 'si' ? 'නිර්මාණ' : 'Nirmana') . '
      <p class="m-kicker">' . ($lang === 'si' ? 'ඡායාරූප රචනය' : 'Photo essay') . '</p>
      <h2 class="m-h2">' . esc($title) . '</h2>
      <div class="m-essay">
        <div class="m-copy">' . ($feature ? paragraphs(r_pick($feature, $lang, 'body_en', 'body_si'), 420) : '') . '</div>
        <p class="m-by">' . ($feature ? esc(r_pick($feature, $lang, 'author_en', 'author_si')) : '') . '</p>
        <div class="m-grid">' . $cells . '</div>
      </div>
      ' . run_foot($displayPage, $lang) . '
    </div>');
}

function back_image(array $magazine, array $articles, array $media): string
{
    $uploaded = !empty($magazine['back_path']) && !preg_match('#/assets/covers/#', $magazine['back_path']);
    if ($uploaded) return $magazine['back_path'];
    return cover_image($magazine, $articles, $media);
}

function page_back(array $bundle, string $lang): string
{
    $magazine = $bundle['magazine'];
    $when = month_name($magazine['month'], $lang) . ' ' . $magazine['year'];
    $photo = back_image($magazine, $bundle['articles'], $bundle['media']);
    $volume = str_pad((string) ($magazine['volume'] ?? 1), 2, '0', STR_PAD_LEFT);
    $number = str_pad((string) ($magazine['number'] ?? 1), 2, '0', STR_PAD_LEFT);
    $imprint = r_tr($lang,
        'Management Development and Training Unit · North Western Provincial Council',
        'කළමනාකරණ සංවර්ධන හා පුහුණු ඒකකය · වයඹ පළාත් සභාව',
        'முகாமைத்துவ அபிவிருத்தி மற்றும் பயிற்சி அலகு · வடமேல் மாகாண சபை');
    $authors = [];
    $seen = [];
    foreach ($bundle['articles'] as $article) {
        $name = r_pick($article, $lang, 'author_en', 'author_si');
        if (!$name || isset($seen[$name])) continue;
        $seen[$name] = true;
        $authors[] = $name;
    }
    $shown = array_slice($authors, 0, 5);
    if (count($authors) > count($shown)) {
        $more = count($authors) - count($shown);
        $shown[] = r_tr($lang, "and {$more} more", "තව {$more} දෙනෙක්", "மேலும் {$more}");
    }
    $items = '';
    foreach ($shown as $name) $items .= '<li>' . esc($name) . '</li>';
    $credit = r_tr($lang, 'Contributors to this issue', 'මෙම කලාපයට දායක වූවන්', 'இந்த இதழின் பங்களிப்பாளர்கள்');
    $mast = r_tr($lang, 'The Trainer', 'පුහුණුකරු', 'பயிற்சியாளர்');
    return sheet($lang, '
    <div class="cover-bleed"><img src="' . esc($photo) . '" alt=""></div>
    <div class="cover-shade"></div>
    <div class="cover-frame"></div>
    <header class="cover-banner"><img src="/assets/official-header.jpg" alt=""></header>
    <div class="cover-vol">Vol. ' . $volume . '<br>No. ' . $number . '</div>
    <h1 class="cover-mast">' . esc($mast) . '</h1>
    <p class="cover-tri">The Trainer · පුහුණුකරු · பயிற்சியாளர்</p>
    <div class="cover-bottom">
      <p class="cover-issue">' . esc($when) . ' · Vol. ' . $volume . ' No. ' . $number . '</p>
      <p class="cover-unit">' . esc($imprint) . '</p>
      <h2 class="cover-title">' . esc($credit) . '</h2>
      <ul class="cover-lines">' . $items . '</ul>
    </div>', 'cover');
}

function section_copy(string $slug, string $lang, array $stats, bool $firstTraining): array
{
    if ($slug === 'scholarship') {
        return ['section' => r_tr($lang, 'Overseas', 'විදේශ', 'வெளிநாடு'), 'kicker' => r_tr($lang, 'Foreign scholarships', 'විදේශ ශිෂ්‍යත්ව', 'வெளிநாட்டு உதவித்தொகை'), 'title' => r_tr($lang, 'Engagements abroad', 'ලෝකය සමඟ', 'வெளிநாட்டு ஈடுபாடு'), 'dek' => r_tr($lang, 'Progress from officers away, written so the home team can use it.', 'පිටත සිටින නිලධාරීන්ගේ ප්‍රගතිය, ගෙදර කණ්ඩායමට කියවිය හැකි ලෙස.', 'வெளியே இருக்கும் அதிகாரிகளின் முன்னேற்றம், உள்ளக அணி பயன்படுத்தும் வகையில்.')];
    }
    if ($slug === 'plans') {
        return ['section' => r_tr($lang, 'Ahead', 'ඉදිරිය', 'முன்னோக்கி'), 'kicker' => r_tr($lang, 'The month ahead', 'ඊළඟ මාසය', 'வரும் மாதம்'), 'title' => r_tr($lang, 'What is already dated', 'දින නියමිත දේ', 'தேதியிடப்பட்டவை'), 'dek' => r_tr($lang, 'The next dates already on the book.', 'පොතේ දැනටමත් ඇති ඊළඟ දින.', 'ஏற்கெனவே பதிவான அடுத்த நாட்கள்.')];
    }
    if ($slug === 'editorial') {
        return ['section' => r_tr($lang, 'Leadership', 'පණිවිඩය', 'தலைமை'), 'kicker' => r_tr($lang, 'Continued', 'දිගටම', 'தொடர்ச்சி'), 'title' => r_tr($lang, 'From the desk', 'මේසයෙන්', 'மேசையிலிருந்து'), 'dek' => ''];
    }
    if ($slug === 'language') {
        return ['section' => r_tr($lang, 'Bhasha', 'භාෂා', 'மொழி'), 'kicker' => r_tr($lang, 'Language and external courses', 'භාෂා හා බාහිර පාඨමාලා', 'மொழி மற்றும் வெளிப்புற பாடநெறிகள்'), 'title' => r_tr($lang, 'Language and external courses', 'භාෂාව සහ බාහිර පන්ති', 'மொழி மற்றும் வெளிப்புற வகுப்புகள்'), 'dek' => r_tr($lang, 'Counter language, and the courses taught with an outside faculty.', 'කවුළුවේ භාෂාව, සහ බාහිර ආයතන සමඟ ඉගෙන ගන්නා දේ.', 'சேவை மொழியும், வெளி நிறுவனங்களுடன் கற்கும் பாடநெறிகளும்.')];
    }
    if ($slug === 'milestones') {
        return ['section' => r_tr($lang, 'Milestones', 'සන්ධිස්ථාන', 'மைல்கற்கள்'), 'kicker' => r_tr($lang, 'Milestones', 'සන්ධිස්ථාන', 'மைல்கற்கள்'), 'title' => r_tr($lang, 'What the month kept', 'මාසය රඳවා ගත් දේ', 'இம்மாதம் நிலைத்தவை'), 'dek' => ''];
    }
    if ($slug === 'creative') {
        return ['section' => r_tr($lang, 'Nirmana', 'නිර්මාණ', 'படைப்பு'), 'kicker' => r_tr($lang, 'Staff creative corner', 'කාර්ය මණ්ඩල නිර්මාණ', 'பணியாளர் படைப்பு'), 'title' => r_tr($lang, 'Creative corner', 'නිර්මාණ කොන', 'படைப்பு மூலை'), 'dek' => ''];
    }
    return [
        'section' => r_tr($lang, 'Programmes', 'වැඩසටහන්', 'பயிற்சி'),
        'kicker' => $firstTraining ? r_tr($lang, 'Training', 'පුහුණුව', 'பயிற்சி') : r_tr($lang, 'Continued', 'දිගටම', 'தொடர்ச்சி'),
        'title' => $firstTraining ? r_tr($lang, 'The month in training', 'මාසයේ පුහුණුව', 'பயிற்சி மாதம்') : r_tr($lang, 'In the hall and the lab', 'ශාලාවේ සහ විද්‍යාගාරයේ', 'மண்டபத்திலும் ஆய்வகத்திலும்'),
        'dek' => $firstTraining ? r_tr($lang, "{$stats['workshops']} workshops. {$stats['participants']} participants.", "වැඩමුළු {$stats['workshops']} ක්. සහභාගිවන්නන් {$stats['participants']} දෙනෙක්.", "{$stats['workshops']} பயிலரங்குகள். {$stats['participants']} பங்கேற்பாளர்கள்.") : '',
    ];
}

function page_flow(array $bundle, string $lang, $sourcePage, $displayPage, array $opts): string
{
    $rows = on_page($bundle['articles'], $sourcePage);
    $photoMap = [];
    foreach ($rows as $article) {
        $photoMap[$article['id']] = count($bundle['media'][$article['id']] ?? []);
    }
    $plan = limits_for($rows, $photoMap, !empty($opts['stats']));
    $copy = section_copy($rows[0]['category_slug'] ?? 'training', $lang, $opts['issueStats'], !empty($opts['stats']));
    $statHtml = '';
    if (!empty($opts['stats'])) {
        $stats = $opts['issueStats'];
        $statHtml = '<div class="m-stats">'
            . '<div><b>' . $stats['workshops'] . '</b><span>' . ($lang === 'si' ? 'වැඩමුළු' : 'Workshops') . '</span></div>'
            . '<div><b>' . $stats['participants'] . '</b><span>' . ($lang === 'si' ? 'සහභාගිවන්නන්' : 'Participants') . '</span></div>'
            . '<div><b>' . $stats['language'] . '</b><span>' . ($lang === 'si' ? 'භාෂා පන්ති' : 'Language courses') . '</span></div>'
            . '<div><b>' . $stats['scholarships'] . '</b><span>' . ($lang === 'si' ? 'විදේශ අනුයුක්ති' : 'Overseas attachments') . '</span></div>'
            . '</div>';
    }
    $cards = '';
    foreach ($plan as $index => $item) {
        $label = section_copy($item['article']['category_slug'], $lang, $opts['issueStats'], false);
        $rule = $item['fresh'] && $index > 0 ? '<p class="m-kicker m-break">' . esc($label['kicker']) . '</p>' : '';
        $cards .= $rule . story_card($item['article'], $lang, $bundle['media'][$item['article']['id']] ?? [], $item['role'], $item['limit']);
    }
    $dek = $copy['dek'] ? '<p class="m-dek">' . esc($copy['dek']) . '</p>' : '';
    return sheet($lang, '
    <div class="m-frame"></div>
    <div class="m-pad">
      ' . run_head($bundle['magazine'], $lang, $copy['section']) . '
      <p class="m-kicker">' . esc($copy['kicker']) . '</p>
      <h2 class="m-h2">' . esc($copy['title']) . '</h2>
      ' . $dek . '
      ' . $statHtml . '
      <div class="m-flow">' . $cards . '</div>
      ' . run_foot($displayPage, $lang) . '
    </div>');
}

function render_pages(array $bundle, string $lang): array
{
    $safe = r_lang($lang);
    $numbers = [];
    foreach ($bundle['articles'] as $article) {
        $page = (int) $article['page_number'];
        if ($page >= 2) $numbers[$page] = $page;
    }
    sort($numbers);
    $displayOf = [];
    foreach (array_values($numbers) as $index => $page) {
        $displayOf[$page] = $index + 2;
    }
    $stats = issue_stats($bundle['articles']);
    $pages = [page_cover($bundle, $safe)];
    $editorialSeen = false;
    $trainingSeen = false;
    foreach ($numbers as $page) {
        $rows = on_page($bundle['articles'], $page);
        if (!$rows) continue;
        $display = $displayOf[$page];
        $editorialOnly = true;
        foreach ($rows as $row) {
            if ($row['category_slug'] !== 'editorial') $editorialOnly = false;
        }
        if ($editorialOnly && !$editorialSeen) {
            $editorialSeen = true;
            $pages[] = page_editorial($bundle, $safe, $page, $display, $displayOf);
            continue;
        }
        $photos = $bundle['media'][$rows[0]['id']] ?? [];
        if (count($rows) === 1 && is_essay($rows[0], count($photos))) {
            $pages[] = page_essay($bundle, $safe, $page, $display);
            continue;
        }
        $statsHere = $rows[0]['category_slug'] === 'training' && !$trainingSeen;
        if ($statsHere) $trainingSeen = true;
        $pages[] = page_flow($bundle, $safe, $page, $display, ['stats' => $statsHere, 'issueStats' => $stats]);
    }
    $pages[] = page_back($bundle, $safe);
    return $pages;
}

function render_issue_document(array $bundle, string $lang, array $options = []): string
{
    $safe = r_lang($lang);
    $magazine = $bundle['magazine'];
    $label = month_name($magazine['month'], $safe) . ' ' . $magazine['year'];
    $mast = r_tr($safe, 'The Trainer', 'පුහුණුකරු', 'பயிற்சியாளர்');
    $title = $mast . ' · ' . $label;
    $pages = implode("\n", render_pages($bundle, $safe));
    $autoprint = !empty($options['autoprint'])
        ? '<script>window.addEventListener("load", function () { setTimeout(function () { window.print(); }, 500); });</script>'
        : '';
    $pdf = $magazine['status'] === 'published'
        ? '<a class="m-solid" href="/api/public/magazines/' . esc($magazine['slug']) . '/pdf?lang=' . $safe . '">' . r_tr($safe, 'Download PDF', 'PDF බාගත කරන්න', 'PDF பதிவிறக்கம்') . '</a>'
        : '';
    $face = $safe === 'si' ? 'si' : ($safe === 'ta' ? 'ta' : '');
    return '<!DOCTYPE html>
<html lang="' . $safe . '">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>' . esc($title) . '</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,500;0,9..144,620;1,9..144,520&family=Outfit:wght@340;420;560&family=Noto+Sans+Sinhala:wght@400;600;700&family=Noto+Sans+Tamil:wght@400;600;700&display=swap">
  <link rel="stylesheet" href="/css/magazine.css">
</head>
<body class="print-preview ' . $face . '">
  <div class="m-toolbar noprint">
    <a href="/journal.html">' . esc($mast) . '</a>
    <strong>' . esc($label) . '</strong>
    <a href="?lang=en">English</a>
    <a href="?lang=si">සිංහල</a>
    <a href="?lang=ta">தமிழ்</a>
    <button type="button" onclick="window.print()">' . r_tr($safe, 'Print / Save PDF', 'මුද්‍රණය / PDF ලෙස සුරකින්න', 'அச்சிடு / PDF ஆக சேமி') . '</button>
    <span class="dev-note">web developer M A Wickramanayake · Email. Anurasiri123@gmail.com · call - 0774940944 · developer - M A Wickramanayake (Development Officer)</span>
    ' . $pdf . '
  </div>
  ' . $pages . '
  ' . $autoprint . '
</body>
</html>';
}
