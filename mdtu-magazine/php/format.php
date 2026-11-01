<?php

function month_name($month, string $lang): string
{
    $en = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    $si = ['ජනවාරි', 'පෙබරවාරි', 'මාර්තු', 'අප්‍රේල්', 'මැයි', 'ජූනි', 'ජූලි', 'අගෝස්තු', 'සැප්තැම්බර්', 'ඔක්තෝබර්', 'නොවැම්බර්', 'දෙසැම්බර්'];
    $ta = ['ஜனவரி', 'பெப்ரவரி', 'மார்ச்', 'ஏப்ரல்', 'மே', 'ஜூன்', 'ஜூலை', 'ஆகஸ்ட்', 'செப்டம்பர்', 'அக்டோபர்', 'நவம்பர்', 'டிசம்பர்'];
    $list = $lang === 'si' ? $si : ($lang === 'ta' ? $ta : $en);
    $index = (int) $month - 1;
    return $list[$index] ?? '';
}

function issue_series(array $magazines): array
{
    usort($magazines, function ($a, $b) {
        return ((int) $a['year'] <=> (int) $b['year'])
            ?: ((int) $a['month'] <=> (int) $b['month'])
            ?: ((int) $a['id'] <=> (int) $b['id']);
    });
    $firstYear = $magazines ? (int) $magazines[0]['year'] : 2026;
    $count = [];
    $series = [];
    foreach ($magazines as $magazine) {
        $year = (int) $magazine['year'];
        $number = ($count[$year] ?? 0) + 1;
        $count[$year] = $number;
        $series[(int) $magazine['id']] = [
            'volume' => max(1, $year - $firstYear + 1),
            'number' => $number,
        ];
    }
    return $series;
}

function format_date($iso, string $lang): string
{
    if (!$iso) {
        return '';
    }
    $parts = array_map('intval', explode('-', (string) $iso));
    if (count($parts) < 3 || !$parts[0] || !$parts[1] || !$parts[2]) {
        return (string) $iso;
    }
    [$year, $month, $day] = $parts;
    $name = month_name($month, $lang);
    return $lang === 'si' ? "{$year} {$name} {$day}" : "{$day} {$name} {$year}";
}

function format_range($start, $end, string $lang): string
{
    if (!$start) {
        return '';
    }
    if (!$end || $start === $end) {
        return format_date($start, $lang);
    }
    return format_date($start, $lang) . ' – ' . format_date($end, $lang);
}

function parse_json($value, $fallback)
{
    $parsed = json_decode((string) ($value ?? ''), true);
    if ($parsed === null && trim((string) ($value ?? '')) === '') {
        return $fallback;
    }
    return $parsed ?? $fallback;
}

function esc($value): string
{
    return htmlspecialchars((string) ($value ?? ''), ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');
}

function paragraphs($text, $limit = null): string
{
    $clean = trim((string) ($text ?? ''));
    $length = function_exists('mb_strlen') ? mb_strlen($clean) : strlen($clean);
    if ($limit && $length > $limit) {
        $slice = function_exists('mb_substr') ? mb_substr($clean, 0, $limit) : substr($clean, 0, $limit);
        $slice = preg_replace('/\s+\S*$/u', '', $slice);
        $clean = $slice . '…';
    }
    if ($clean === '') {
        return '';
    }
    $parts = preg_split("/\n{2,}/", $clean);
    $html = '';
    foreach ($parts as $part) {
        $html .= '<p>' . str_replace("\n", '<br>', esc($part)) . '</p>';
    }
    return $html;
}

function now_iso(): string
{
    $time = microtime(true);
    $seconds = (int) $time;
    $millis = (int) round(($time - $seconds) * 1000);
    if ($millis === 1000) {
        $seconds += 1;
        $millis = 0;
    }
    return gmdate('Y-m-d\TH:i:s', $seconds) . sprintf('.%03dZ', $millis);
}
