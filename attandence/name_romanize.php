<?php
$cons = [
    'ක' => 'k', 'ඛ' => 'kh', 'ග' => 'g', 'ඝ' => 'gh', 'ඞ' => 'ng',
    'ච' => 'ch', 'ඡ' => 'ch', 'ජ' => 'j', 'ඣ' => 'jh', 'ඤ' => 'gn', 'ඥ' => 'gn',
    'ට' => 't', 'ඨ' => 'th', 'ඩ' => 'd', 'ඪ' => 'dh', 'ණ' => 'n',
    'ත' => 't', 'ථ' => 'th', 'ද' => 'd', 'ධ' => 'dh', 'න' => 'n',
    'ප' => 'p', 'ඵ' => 'ph', 'බ' => 'b', 'භ' => 'bh', 'ම' => 'm',
    'ය' => 'y', 'ර' => 'r', 'ල' => 'l', 'ව' => 'w', 'ශ' => 'sh',
    'ෂ' => 'sh', 'ස' => 's', 'හ' => 'h', 'ළ' => 'l', 'ෆ' => 'f',
];
$indep = [
    'අ' => 'a', 'ආ' => 'a', 'ඇ' => 'a', 'ඈ' => 'a', 'ඉ' => 'i', 'ඊ' => 'i',
    'උ' => 'u', 'ඌ' => 'u', 'ඍ' => 'ru', 'ඎ' => 'ru', 'එ' => 'e', 'ඒ' => 'e',
    'ඓ' => 'ai', 'ඔ' => 'o', 'ඕ' => 'o', 'ඖ' => 'au',
];
$vowel = [
    'ා' => 'a', 'ැ' => 'a', 'ෑ' => 'a', 'ි' => 'i', 'ී' => 'ee', 'ු' => 'u', 'ූ' => 'oo',
    'ෘ' => 'ru', 'ෙ' => 'e', 'ේ' => 'e', 'ෛ' => 'ai', 'ො' => 'o', 'ෝ' => 'o', 'ෞ' => 'au',
    'ෲ' => 'ru', 'ෳ' => 'lu',
];
$honor = [
    'වෛද්ය' => 'Dr',
    'මහාචාර්ය' => 'Prof',
    'ආචාර්ය' => 'Dr',
    'මහතා' => 'Mr',
    'මහත්මිය' => 'Mrs',
    'මිය' => 'Ms',
    'මයා' => 'Mr',
];
$letters = [
    'ඒ' => 'A', 'බී' => 'B', 'සී' => 'C', 'ඩී' => 'D', 'ඊ' => 'E', 'එෆ්' => 'F',
    'ජී' => 'G', 'එච්' => 'H', 'අයි' => 'I', 'ජේ' => 'J', 'කේ' => 'K', 'එල්' => 'L',
    'එම්' => 'M', 'එන්' => 'N', 'ඕ' => 'O', 'පී' => 'P', 'කියු' => 'Q', 'ආර්' => 'R',
    'එස්' => 'S', 'ටී' => 'T', 'යූ' => 'U', 'වී' => 'V', 'ඩබ්' => 'W', 'ඞබ්' => 'W', 'ඩබ්ලිව්' => 'W',
    'එක්ස්' => 'X', 'වයි' => 'Y', 'සෙඩ්' => 'Z',
];

function chars($s)
{
    return preg_split('//u', $s, -1, PREG_SPLIT_NO_EMPTY);
}

function transliterate($s)
{
    global $cons, $indep, $vowel;
    $s = str_replace(["\u{200D}", "\u{200C}"], '', $s);
    $ch = chars($s);
    $n = count($ch);
    $out = '';
    for ($i = 0; $i < $n; $i++) {
        $c = $ch[$i];
        if (isset($indep[$c])) {
            $out .= $indep[$c];
            continue;
        }
        if ($c === 'ං') {
            $next = $ch[$i + 1] ?? '';
            if ($next === 'හ') {
                $out .= 'ng';
            } elseif (in_array($next, ['ක', 'ඛ', 'ග', 'ඝ', 'ඞ'], true)) {
                $out .= 'n';
            } elseif (in_array($next, ['ප', 'ඵ', 'බ', 'භ', 'ම'], true)) {
                $out .= 'm';
            } else {
                $out .= 'n';
            }
            continue;
        }
        if ($c === 'ඃ') {
            $out .= 'h';
            continue;
        }
        if (!isset($cons[$c])) {
            continue;
        }
        $stem = $cons[$c];
        $next = $ch[$i + 1] ?? '';
        if ($next === '්') {
            $out .= $stem;
            $i++;
            continue;
        }
        if (isset($vowel[$next])) {
            $out .= $stem . $vowel[$next];
            $i++;
            continue;
        }
        $out .= $stem . 'a';
    }
    $out = preg_replace('/singha$/u', 'singhe', $out);
    $out = preg_replace('/^wikrama/u', 'wickrama', $out);
    return $out;
}

function is_initial($bare)
{
    $bare = str_replace(["\u{200D}", "\u{200C}"], '', $bare);
    if ($bare === '' || !preg_match('/\p{Sinhala}/u', $bare)) {
        return false;
    }
    $len = mb_strlen($bare);
    if ($len > 3) {
        return false;
    }
    $hasVirama = mb_strpos($bare, '්') !== false;
    return $hasVirama || $len <= 2;
}

function initial_letter($bare)
{
    $t = transliterate($bare);
    if (preg_match('/^[aeiou]([a-z])/u', $t, $m)) {
        return strtoupper($m[1]);
    }
    return strtoupper(substr($t, 0, 1) ?: 'A');
}

function romanize_piece($piece, $followedByPeriod)
{
    global $honor, $letters;
    $bare = str_replace(["\u{200D}", "\u{200C}"], '', $piece);
    $bare = preg_replace('/^[^\p{L}\p{M}\p{N}]+|[^\p{L}\p{M}\p{N}]+$/u', '', $bare);
    if (isset($honor[$bare])) {
        return $honor[$bare];
    }
    if (isset($letters[$bare])) {
        return $letters[$bare] . ($followedByPeriod ? '' : '.');
    }
    if (!preg_match('/\p{Sinhala}/u', $piece)) {
        return $piece;
    }
    if ($followedByPeriod && is_initial($bare)) {
        return initial_letter($bare);
    }
    if (!$followedByPeriod && is_initial($bare) && mb_strpos($bare, '්') !== false && mb_strlen(str_replace(["\u{200D}", "\u{200C}"], '', $bare)) <= 2) {
        return initial_letter($bare) . '.';
    }
    $ch = chars($piece);
    $result = '';
    $buf = '';
    $flush = function () use (&$result, &$buf) {
        if ($buf === '') {
            return;
        }
        $t = transliterate($buf);
        $result .= mb_convert_case($t, MB_CASE_TITLE, 'UTF-8');
        $buf = '';
    };
    foreach ($ch as $c) {
        if (preg_match('/\p{Sinhala}/u', $c)) {
            $buf .= $c;
        } else {
            $flush();
            $result .= $c;
        }
    }
    $flush();
    return $result;
}

function romanize_name($name)
{
    $name = trim(preg_replace('/\s+/u', ' ', str_replace(["\u{200D}", "\u{200C}"], '', (string) $name)));
    $words = preg_split('/\s+/u', $name);
    $outWords = [];
    foreach ($words as $word) {
        $bits = preg_split('/(\.)/u', $word, -1, PREG_SPLIT_DELIM_CAPTURE);
        $built = '';
        for ($i = 0; $i < count($bits); $i++) {
            if ($bits[$i] === '.') {
                $built .= '.';
                continue;
            }
            $nextDot = (($bits[$i + 1] ?? '') === '.');
            $built .= romanize_piece($bits[$i], $nextDot);
        }
        $outWords[] = $built;
    }
    $text = trim(preg_replace('/\s+/u', ' ', implode(' ', $outWords)));
    $text = preg_replace('/\s+\./u', '.', $text);
    $text = preg_replace('/\.{2,}/', '.', $text);
    $text = preg_replace('/\.(?=\p{Lu})/u', '. ', $text);
    $text = trim(preg_replace('/\s+/u', ' ', $text));
    $parts = explode(' ', $text);
    $titles = [];
    $rest = [];
    foreach ($parts as $p) {
        if (in_array($p, ['Mr', 'Ms', 'Mrs', 'Dr', 'Prof'], true)) {
            $titles[] = $p;
        } else {
            $rest[] = $p;
        }
    }
    $titles = array_values(array_unique($titles));
    if (array_intersect($titles, ['Dr', 'Prof'])) {
        $titles = array_values(array_filter($titles, function ($t) {
            return !in_array($t, ['Mr', 'Ms', 'Mrs'], true);
        }));
    }
    return trim(implode(' ', array_merge($titles, $rest)));
}

function person_key($name)
{
    $s = mb_strtolower(trim((string) $name));
    $s = str_replace('.', ' ', $s);
    $s = preg_replace('/\b(mr|mrs|ms|miss|dr|prof|rev|sir)\b/u', ' ', $s);
    $s = preg_replace('/[^\p{L}\p{N}]+/u', ' ', $s);
    return preg_replace('/\s+/u', ' ', trim($s));
}

function mdtu_apply_english_names(PDO $pdo)
{
    $rows = $pdo->query('SELECT id, name, field, institution, contact, email FROM resource_persons ORDER BY id')->fetchAll(PDO::FETCH_ASSOC);
    $groups = [];
    foreach ($rows as $row) {
        $original = $row['name'];
        $name = romanize_name($original);
        if ($name === '') {
            $name = $original;
        }
        $name = mb_substr($name, 0, 255);
        $key = person_key($name);
        if ($key === '') {
            continue;
        }
        $latin = !preg_match('/\p{Sinhala}/u', $original);
        if (!isset($groups[$key])) {
            $row['name'] = $latin ? $original : $name;
            $row['latin'] = $latin;
            $row['ids'] = [(int) $row['id']];
            $groups[$key] = $row;
            continue;
        }
        $groups[$key]['ids'][] = (int) $row['id'];
        if ($latin && !$groups[$key]['latin']) {
            $groups[$key]['name'] = $original;
            $groups[$key]['latin'] = true;
        }
        foreach (['field', 'institution', 'contact', 'email'] as $col) {
            if (($groups[$key][$col] ?? '') === '' && ($row[$col] ?? '') !== '') {
                $groups[$key][$col] = $row[$col];
            }
        }
    }
    $pdo->beginTransaction();
    $upd = $pdo->prepare('UPDATE resource_persons SET name = ?, field = ?, institution = ?, contact = ?, email = ? WHERE id = ?');
    $keep = [];
    foreach ($groups as $g) {
        $id = $g['ids'][0];
        $keep[] = $id;
        $upd->execute([$g['name'], $g['field'], $g['institution'], $g['contact'], $g['email'], $id]);
    }
    $drop = [];
    foreach ($groups as $g) {
        foreach (array_slice($g['ids'], 1) as $id) {
            $drop[] = $id;
        }
    }
    if ($drop) {
        $in = implode(',', array_map('intval', $drop));
        $pdo->exec("DELETE FROM resource_persons WHERE id IN ($in)");
    }
    $prog = $pdo->query('SELECT id, resourcePersons FROM programs')->fetchAll(PDO::FETCH_ASSOC);
    $pu = $pdo->prepare('UPDATE programs SET resourcePersons = ? WHERE id = ?');
    foreach ($prog as $p) {
        $list = json_decode((string) $p['resourcePersons'], true);
        if (!is_array($list)) {
            continue;
        }
        $changed = false;
        foreach ($list as &$n) {
            $r = romanize_name($n);
            if ($r !== '' && $r !== $n) {
                $n = $r;
                $changed = true;
            }
        }
        unset($n);
        if ($changed) {
            $pu->execute([json_encode(array_values(array_unique($list)), JSON_UNESCAPED_UNICODE), $p['id']]);
        }
    }
    $pdo->exec("REPLACE INTO settings (k, v) VALUES ('resource_names_english', '1')");
    $pdo->commit();
    return count($groups);
}

/** Turns Sinhala resource-person names into English once. An English directory is left as it is. */
function mdtu_english_resource_names(PDO $pdo)
{
    try {
        $flag = $pdo->query("SELECT v FROM settings WHERE k = 'resource_names_english'")->fetchColumn();
    } catch (PDOException $e) {
        return;
    }
    if ($flag === '1') {
        return;
    }
    try {
        mdtu_apply_english_names($pdo);
    } catch (Throwable $e) {
        if ($pdo->inTransaction()) {
            $pdo->rollBack();
        }
        error_log('MDTU resource names: ' . $e->getMessage());
    }
}
