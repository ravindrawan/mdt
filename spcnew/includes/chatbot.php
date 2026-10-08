<?php
declare(strict_types=1);

function chat_contains(string $hay, array $needles): bool
{
    foreach ($needles as $needle) {
        if (mb_stripos($hay, $needle) !== false) {
            return true;
        }
    }
    return false;
}

function chat_reply(int $userId, string $name, string $text): string
{
    $snap = latest_snapshot($userId);
    $pack = advice_pack($snap);
    $month = date('Y-m');
    [$start, $end] = month_bounds($month);
    [$pStart, $pEnd] = month_bounds(shift_month($month, -1));
    $report = build_month_report(readings_between($userId, $start, $end), readings_between($userId, $pStart, $pEnd));

    $alert = $pack['alert'] ? ' ' . $pack['alert'] : '';

    if (chat_contains($text, ['මාස', 'ඉතිහාස', 'history', 'month', 'විශ්ලේෂ'])) {
        return $name . ', ' . month_label($month) . ' ගැන: ' . implode(' ', $report['paragraphs']);
    }
    if (chat_contains($text, ['සීනි', 'ග්ලූ', 'sugar', 'glucose'])) {
        if ($snap['sugar'] === null) {
            return 'සීනි මැනුමක් තවම නැත. උදේ නිරාහාරව, ආහාරයට පෙර, අගය දාන්න. සාමාන්‍ය නිරාහාර පරාසය 70–99 mg/dL.';
        }
        $status = sugar_status($snap['sugar'], (string) $snap['sugar_type']);
        $line = sugar_type_label((string) $snap['sugar_type']) . ' සීනි ' . num($snap['sugar']) . ' mg/dL, එය ' . status_label((string) $status) . '.';
        $detail = '';
        foreach (array_merge($pack['good'], $pack['fix']) as $item) {
            if (str_contains($item['title'], 'සීනි')) {
                $detail = ' ' . $item['text'];
                break;
            }
        }
        return $line . $detail . $alert;
    }
    if (chat_contains($text, ['පීඩන', 'pressure', 'bp', 'රුධිර'])) {
        if ($snap['systolic'] === null) {
            return 'පීඩන මැනුමක් තවම නැත. ඉහළ සහ පහළ අගයන් දෙකම දාන්න. උදාහරණය 118/76. සාමාන්‍යය 120/80ට අඩු.';
        }
        $status = bp_status($snap['systolic'], $snap['diastolic']);
        $line = 'පීඩනය ' . $snap['systolic'] . '/' . $snap['diastolic'] . ' mmHg, එය ' . status_label((string) $status) . '.';
        $detail = '';
        foreach (array_merge($pack['good'], $pack['fix']) as $item) {
            if (str_contains($item['title'], 'පීඩන')) {
                $detail = ' ' . $item['text'];
                break;
            }
        }
        return $line . $detail . $alert;
    }
    if (chat_contains($text, ['කොලෙස්', 'chol'])) {
        if ($snap['cholesterol'] === null) {
            return 'කොලෙස්ටරෝල් අගයක් තවම නැත. මසකට වරක් මුළු කොලෙස්ටරෝල් mg/dL වලින් දැම්මොත් ඇත. 200ට අඩු නම් හොඳයි.';
        }
        $status = chol_status($snap['cholesterol']);
        $line = 'කොලෙස්ටරෝල් ' . num($snap['cholesterol']) . ' mg/dL, එය ' . status_label((string) $status) . '.';
        $detail = '';
        foreach (array_merge($pack['good'], $pack['fix']) as $item) {
            if (str_contains($item['title'], 'කොලෙස්')) {
                $detail = ' ' . $item['text'];
                break;
            }
        }
        return $line . $detail;
    }
    if (chat_contains($text, ['bmi', 'බර', 'උස', 'තර'])) {
        if ($snap['bmi'] === null) {
            return 'BMI ගණනය වෙන්නේ නැත. බර කිලෝග්‍රෑම් වලින් සහ උස සෙන්ටිමීටර වලින් දෙන්න. සාමාන්‍ය BMI 18.5 සිට 24.9 දක්වා.';
        }
        $status = bmi_status($snap['bmi']);
        $line = 'BMI ' . num($snap['bmi'], 1) . ', එය ' . status_label((string) $status) . '.';
        if ($snap['weight'] !== null) {
            $line .= ' අවසන් බර ' . num($snap['weight'], 1) . ' kg.';
        }
        $detail = '';
        foreach (array_merge($pack['good'], $pack['fix']) as $item) {
            if (str_contains($item['title'], 'BMI') || str_contains($item['title'], 'බර')) {
                $detail = ' ' . $item['text'];
                break;
            }
        }
        return $line . $detail;
    }
    if (chat_contains($text, ['ලුණු', 'salt'])) {
        return 'ලුණු පීඩනය නඟන ප්‍රධාන දේ. කෑමට පසු ලුණු එකතු කරන්න එපා. කරවල, උල් අච්චාරු සහ සෝස් අඩු කරන්න. ' . describe_snapshot($snap);
    }
    if (chat_contains($text, ['නින්ද', 'sleep'])) {
        return 'පැය 7ක් පමණ නිදාගන්න. රෑ 11ට කලින් ඇඳට ගියොත් ඊළඟ දවසේ සීනි සහ පීඩනය සන්සුන් වේ. නිදාගන්නට කලින් තේ සහ බීම වර්ග එපා.';
    }
    if (chat_contains($text, ['ආහාර', 'කෑම', 'කන්න', 'diet', 'food', 'කෑමට'])) {
        return food_advice($snap) . ' ' . describe_snapshot($snap);
    }
    if (chat_contains($text, ['ව්‍යායාම', 'ඇවිද', 'exercise', 'walk'])) {
        return move_advice($snap);
    }

    $extra = $pack['keep'][0] ?? '';
    return describe_snapshot($snap) . ($extra !== '' ? ' අද: ' . $extra : '') . $alert . ' කෑම, ව්‍යායාම, සීනි, පීඩනය, කොලෙස්ටරෝල්, BMI හෝ මේ මාසය ගැන තව අහන්න පුළුවන්.';
}
