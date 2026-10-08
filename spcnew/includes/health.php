<?php
declare(strict_types=1);

function sinhala_month(int $month): string
{
    $names = [
        1 => 'ජනවාරි', 2 => 'පෙබරවාරි', 3 => 'මාර්තු', 4 => 'අප්‍රේල්',
        5 => 'මැයි', 6 => 'ජූනි', 7 => 'ජූලි', 8 => 'අගෝස්තු',
        9 => 'සැප්තැම්බර්', 10 => 'ඔක්තෝබර්', 11 => 'නොවැම්බර්', 12 => 'දෙසැම්බර්',
    ];
    return $names[$month] ?? '';
}

function sinhala_weekday(int $w): string
{
    $names = ['ඉරිදා', 'සඳුදා', 'අඟහරුවාදා', 'බදාදා', 'බ්‍රහස්පතින්දා', 'සිකුරාදා', 'සෙනසුරාදා'];
    return $names[$w] ?? '';
}

function month_label(string $ym): string
{
    $dt = new DateTime($ym . '-01');
    return sinhala_month((int) $dt->format('n')) . ' ' . $dt->format('Y');
}

function nice_date(string $ymd, bool $withYear = false): string
{
    $dt = DateTime::createFromFormat('Y-m-d', $ymd);
    if (!$dt) {
        return $ymd;
    }
    $text = sinhala_month((int) $dt->format('n')) . ' ' . (int) $dt->format('j');
    if ($withYear) {
        $text .= ', ' . $dt->format('Y');
    }
    return $text;
}

function greeting(string $name): string
{
    $hour = (int) date('G');
    if ($hour < 12) {
        $hello = 'සුභ උදෑසනක්';
    } elseif ($hour < 15) {
        $hello = 'සුභ දහවලක්';
    } elseif ($hour < 18) {
        $hello = 'සුභ සැන්දෑවක්';
    } elseif ($hour < 21) {
        $hello = 'සුභ සන්ධ්‍යාවක්';
    } else {
        $hello = 'සුභ රාත්‍රියක්';
    }
    $day = sinhala_weekday((int) date('w'));
    return $hello . ', ' . $name . '. අද ' . $day . '.';
}

function weekday_short(int $w): string
{
    $names = ['ඉරි', 'සඳු', 'අඟ', 'බදා', 'බ්‍රහ', 'සිකු', 'සෙන'];
    return $names[$w] ?? '';
}

function today_invite(): array
{
    $invites = [
        ['ඉරිදා පවුලේ දවස', 'අද බර හෝ පීඩනය විනාඩියකින් සටහන් කරලා, සතිය හෙට සන්සුන්ව පටන් ගන්න.'],
        ['සඳුදා අලුත් සතිය', 'සතියේ පළමු මැනුම අද දාන්න. දාමය මෙතනින් පටන් ගනී.'],
        ['අඟහරුවාදා ඇවිදීම', 'අද විනාඩි 30 ඇවිද්ඩා කියලා සලකුණු කරන්න. මැනුමක් නැතත් දාමය රැකේ.'],
        ['බදාදා මැද සතිය', 'සීනි හෝ පීඩනය අද බලන්න. මැද සතියේ එක සටහනක් මාසයේ රටාව පැහැදිලි කරයි.'],
        ['බ්‍රහස්පතින්දා කෑම', 'අද එළවළු පිඟාන සහ ලුණු අඩු කෑම සටහන් කරන්න.'],
        ['සිකුරාදා සතිය එකතු කරන්න', 'සතියේ සටහන් බලලා හෙට නිවාඩුවට කෑම සැලසුම් කරන්න.'],
        ['සෙනසුරාදා නිදහස් වේලාව', 'බර සතියේ එක් වරක් බලන්න. අද ඒ දවස වෙන්න පුළුවන්.'],
    ];
    return $invites[(int) date('w')];
}

function streak_cheer(int $streak, bool $doneToday): string
{
    if ($streak >= 30) {
        return 'දින 30ක දාමයක්. මෙය දැන් පුරුද්දක්.';
    }
    if ($streak >= 7) {
        return 'සතියක් එක දිගට. හෙටත් එන්න.';
    }
    if ($streak >= 3) {
        return 'දින තුනක් ගියා. තව ටිකක් යන්න.';
    }
    if ($doneToday) {
        return 'අද සටහන් වුණා. හෙටත් එක ලකුණක් දාන්න.';
    }
    return 'අද එක සටහනක් දාන්න. දාමය පටන් ගනී.';
}

function sugar_type_label(?string $type): string
{
    return match ($type) {
        'random' => 'අහඹු',
        'post' => 'ආහාරයෙන් පසු',
        'fasting' => 'නිරාහාර',
        default => '',
    };
}

function sugar_status(?float $value, string $type): ?string
{
    if ($value === null) {
        return null;
    }
    if ($value < 70) {
        return 'low';
    }
    if ($type === 'fasting') {
        if ($value <= 99) {
            return 'normal';
        }
        if ($value <= 125) {
            return 'border';
        }
        return 'high';
    }
    if ($value < 140) {
        return 'normal';
    }
    if ($value < 200) {
        return 'border';
    }
    return 'high';
}

function bp_status(?int $sys, ?int $dia): ?string
{
    if ($sys === null || $dia === null) {
        return null;
    }
    if ($sys >= 180 || $dia >= 120) {
        return 'crisis';
    }
    if ($sys >= 140 || $dia >= 90) {
        return 'high';
    }
    if ($sys >= 130 || $dia >= 80) {
        return 'stage1';
    }
    if ($sys >= 120 && $dia < 80) {
        return 'elevated';
    }
    if ($sys < 90 || $dia < 60) {
        return 'low';
    }
    return 'normal';
}

function chol_status(?float $value): ?string
{
    if ($value === null) {
        return null;
    }
    if ($value < 200) {
        return 'normal';
    }
    if ($value < 240) {
        return 'border';
    }
    return 'high';
}

function bmi_status(?float $bmi): ?string
{
    if ($bmi === null) {
        return null;
    }
    if ($bmi < 18.5) {
        return 'under';
    }
    if ($bmi < 25) {
        return 'normal';
    }
    if ($bmi < 30) {
        return 'over';
    }
    return 'obese';
}

function status_label(string $status): string
{
    return match ($status) {
        'normal' => 'හොඳයි',
        'low' => 'අඩුයි',
        'under' => 'අඩු බර',
        'border' => 'මායිම්',
        'elevated' => 'මඳ ඉහළයි',
        'stage1' => 'අදියර 1',
        'over' => 'වැඩි බර',
        'high' => 'ඉහළයි',
        'obese' => 'බර වැඩියි',
        'crisis' => 'හදිසි',
        default => $status,
    };
}

function status_class(string $status): string
{
    return match ($status) {
        'normal' => 'good',
        'high', 'obese', 'crisis' => 'bad',
        default => 'warn',
    };
}

function pill_html(?string $status): string
{
    if ($status === null || $status === '') {
        return '';
    }
    return '<span class="pill ' . e(status_class($status)) . '">' . e(status_label($status)) . '</span>';
}

function metric_score(?string $status): ?int
{
    if ($status === null) {
        return null;
    }
    return match ($status) {
        'normal' => 100,
        'elevated' => 80,
        'over' => 66,
        'border' => 62,
        'stage1', 'under' => 58,
        'low' => 50,
        'obese' => 34,
        'high' => 30,
        'crisis' => 10,
        default => 50,
    };
}

function score_tone(?int $score): string
{
    if ($score === null) {
        return 'na';
    }
    if ($score >= 85) {
        return 'good';
    }
    if ($score >= 60) {
        return 'warn';
    }
    return 'bad';
}

function score_label(?int $score): string
{
    if ($score === null) {
        return 'තවම ලකුණක් නැත';
    }
    if ($score >= 85) {
        return 'හොඳ සමබරතාව';
    }
    if ($score >= 60) {
        return 'මධ්‍යස්ථයි';
    }
    return 'අවධානය ඕනෑ';
}

function latest_row(int $userId, string $kind): ?array
{
    $where = match ($kind) {
        'sugar' => 'sugar_mgdl IS NOT NULL',
        'bp' => 'systolic IS NOT NULL AND diastolic IS NOT NULL',
        'chol' => 'cholesterol_mgdl IS NOT NULL',
        'bmi' => 'bmi IS NOT NULL',
        default => '0',
    };
    $stmt = db()->prepare("SELECT * FROM readings WHERE user_id = ? AND {$where} ORDER BY recorded_on DESC, id DESC LIMIT 1");
    $stmt->execute([$userId]);
    $row = $stmt->fetch();
    return $row ?: null;
}

function latest_snapshot(int $userId): array
{
    $sugar = latest_row($userId, 'sugar');
    $bp = latest_row($userId, 'bp');
    $chol = latest_row($userId, 'chol');
    $bmi = latest_row($userId, 'bmi');

    return [
        'sugar' => $sugar ? fval($sugar['sugar_mgdl']) : null,
        'sugar_type' => $sugar['sugar_type'] ?? 'fasting',
        'sugar_date' => $sugar['recorded_on'] ?? null,
        'systolic' => $bp ? (int) $bp['systolic'] : null,
        'diastolic' => $bp ? (int) $bp['diastolic'] : null,
        'bp_date' => $bp['recorded_on'] ?? null,
        'cholesterol' => $chol ? fval($chol['cholesterol_mgdl']) : null,
        'chol_date' => $chol['recorded_on'] ?? null,
        'bmi' => $bmi ? fval($bmi['bmi']) : null,
        'weight' => $bmi ? fval($bmi['weight_kg']) : null,
        'bmi_date' => $bmi['recorded_on'] ?? null,
    ];
}

function snapshot_parts(array $snap): array
{
    $parts = [];
    $sugarStatus = sugar_status($snap['sugar'], (string) ($snap['sugar_type'] ?? 'fasting'));
    if ($sugarStatus !== null) {
        $parts[] = ['key' => 'sugar', 'label' => 'සීනි', 'status' => $sugarStatus, 'score' => metric_score($sugarStatus)];
    }
    $bpStatus = bp_status($snap['systolic'], $snap['diastolic']);
    if ($bpStatus !== null) {
        $parts[] = ['key' => 'bp', 'label' => 'පීඩනය', 'status' => $bpStatus, 'score' => metric_score($bpStatus)];
    }
    $cholStatus = chol_status($snap['cholesterol']);
    if ($cholStatus !== null) {
        $parts[] = ['key' => 'chol', 'label' => 'කොලෙස්ටරෝල්', 'status' => $cholStatus, 'score' => metric_score($cholStatus)];
    }
    $bmiStatus = bmi_status($snap['bmi']);
    if ($bmiStatus !== null) {
        $parts[] = ['key' => 'bmi', 'label' => 'BMI', 'status' => $bmiStatus, 'score' => metric_score($bmiStatus)];
    }
    return $parts;
}

function balance_score(array $parts): ?int
{
    if (!$parts) {
        return null;
    }
    $sum = 0;
    foreach ($parts as $part) {
        $sum += (int) $part['score'];
    }
    return (int) round($sum / count($parts));
}

function weakest_key(array $parts): ?string
{
    $worst = null;
    foreach ($parts as $part) {
        if ($worst === null || $part['score'] < $worst['score']) {
            $worst = $part;
        }
    }
    return $worst['key'] ?? null;
}

function balance_lead(array $snap, array $parts): string
{
    if (!$parts) {
        return 'තවම මැනුම් නැත. අද සීනි, පීඩනය, කොලෙස්ටරෝල් හෝ බර ඇතුළත් කළාම, ඒ සමබරතාව බලලා උපදෙස් මෙතනට එයි.';
    }
    $bits = [];
    foreach ($parts as $part) {
        $bits[] = $part['label'] . ' ' . status_label($part['status']);
    }
    $lead = implode(', ', $bits) . '.';
    $missing = [];
    if ($snap['sugar'] === null) {
        $missing[] = 'සීනි';
    }
    if ($snap['systolic'] === null) {
        $missing[] = 'පීඩනය';
    }
    if ($snap['cholesterol'] === null) {
        $missing[] = 'කොලෙස්ටරෝල්';
    }
    if ($snap['bmi'] === null) {
        $missing[] = 'BMI';
    }
    if ($missing) {
        $lead .= ' ' . implode(', ', $missing) . ' තවම සටහන් වී නැත.';
    }
    $weak = weakest_key($parts);
    $allGood = true;
    foreach ($parts as $part) {
        if ($part['status'] !== 'normal') {
            $allGood = false;
            break;
        }
    }
    if ($allGood && !$missing) {
        $lead .= ' හතරම සමබර පරාසයේ. දැන් තියෙන පුරුදු රකින්න.';
    } elseif ($allGood) {
        $lead .= ' දන්නා අගයන් සමබරයි. ඉතිරි ඒවාත් සටහන් කළාම රූපය සම්පූර්ණ වේ.';
    } else {
        $name = match ($weak) {
            'sugar' => 'සීනි',
            'bp' => 'රුධිර පීඩනය',
            'chol' => 'කොලෙස්ටරෝල්',
            'bmi' => 'බර',
            default => 'අගයන්',
        };
        $lead .= ' මේ සතියේ පළමුව ' . $name . ' ගැන වැඩ කරමු.';
    }
    return $lead;
}

function advice_pack(array $snap): array
{
    $parts = snapshot_parts($snap);
    $score = balance_score($parts);
    $good = [];
    $fix = [];
    $alert = null;

    $sugarStatus = sugar_status($snap['sugar'], (string) ($snap['sugar_type'] ?? 'fasting'));
    $typeLabel = sugar_type_label((string) ($snap['sugar_type'] ?? 'fasting'));
    if ($snap['sugar'] !== null) {
        $value = num($snap['sugar']) . ' mg/dL';
        if ($sugarStatus === 'normal') {
            $good[] = ['title' => 'සීනි හොඳ පරාසයේ', 'text' => $typeLabel . ' සීනි ' . $value . '. සීනි තේ, බීම වර්ග සහ රසකැවිලි අඩුවෙන් තියාගෙන, දිනපතා එකම වේලාවට මැනීම දිගටම කරන්න.'];
        } elseif ($sugarStatus === 'low') {
            $fix[] = ['title' => 'සීනි අඩුයි', 'text' => $value . '. ආහාර මඟ හරින්න එපා. දැන්ම පැණි රස ටිකක් ගෙන විනාඩි 15ක් වාඩි වෙන්න. නිතර අඩු වේ නම් වෛද්‍යවරයා හමුවන්න.'];
            $alert = 'සීනි අගය අඩුයි. දැන්ම සීනි සහිත බීමක් හෝ ග්ලූකෝස් ටිකක් ගෙන විනාඩි 15ක් වාඩි වෙන්න. කරකැවිල්ලක් හෝ නොසන්සුන් බවක් තිබේ නම් අසල සිටින අයෙකුට කියන්න.';
        } elseif ($sugarStatus === 'border') {
            $fix[] = ['title' => 'සීනි මායිමේ', 'text' => $typeLabel . ' අගය ' . $value . '. සුදු සහල් ප්‍රමාණය අඩු කර රතු සහල් හෝ කුරක්කන් ටිකක් එකතු කරන්න. සවස් කෑමෙන් පසු විනාඩි 20ක් ඇවිදින්න. සීනි තේ වෙනුවට සීනි නැති කිරි තේ බොන්න.'];
        } else {
            $fix[] = ['title' => 'සීනි ඉහළයි', 'text' => $typeLabel . ' අගය ' . $value . '. රසකැවිලි, බීම වර්ග, පළතුරු යුෂ සහ රෑ පරක්කු බර ආහාර නවත්වන්න. පිඟානෙන් අඩක් එළවළු වෙන්න. මෙය දිගටම තිබේ නම් වෛද්‍ය උපදෙස් ලබාගන්න.'];
            if ($snap['sugar'] >= 200) {
                $alert = 'සීනි අගය ඉතා ඉහළයි. අද හෝ හෙට වෛද්‍ය උපදෙස් ලබාගන්න. වතුර බොන්න, පැණි රස වළකින්න.';
            }
        }
    }

    $bpStatus = bp_status($snap['systolic'], $snap['diastolic']);
    if ($bpStatus !== null) {
        $pair = $snap['systolic'] . '/' . $snap['diastolic'];
        if ($bpStatus === 'normal') {
            $good[] = ['title' => 'පීඩනය සාමාන්‍යයි', 'text' => 'රුධිර පීඩනය ' . $pair . ' mmHg. ලුණු අඩු ආහාර සහ දිනපතා ඇවිදීම නිසා මේ සමබරතාව රැකේ. ඒ පුරුද්ද තියාගන්න.'];
        } elseif ($bpStatus === 'low') {
            $fix[] = ['title' => 'පීඩනය අඩු පැත්තට', 'text' => $pair . ' mmHg. හදිසියේ නැගිටින්න එපා. වතුර ප්‍රමාණවත්ව බොන්න. කරකැවිල්ලක් තිබේ නම් වෛද්‍යවරයාට කියන්න.'];
        } elseif ($bpStatus === 'elevated' || $bpStatus === 'stage1') {
            $fix[] = ['title' => 'පීඩනය මඳ ඉහළයි', 'text' => $pair . ' mmHg. මේසයේ ලුණු බඳුන ඉවත් කරන්න. උල් කෑම, තෙල් සහිත කෑම සහ රෑ ගොඩක් වගේ කෑම අඩු කරන්න. දිනපතා විනාඩි 30ක් සෙමින් ඇවිදින්න.'];
        } elseif ($bpStatus === 'crisis') {
            $fix[] = ['title' => 'පීඩනය ඉතා ඉහළයි', 'text' => $pair . ' mmHg. විවේක ගන්න. පපුවේ කැක්කුම, හුස්ම ගැනීමේ අපහසුව, හෝ දැඩි හිසරදයක් තිබේ නම් අදම හදිසි ප්‍රතිකාර ගන්න.'];
            $alert = 'රුධිර පීඩනය ඉතා ඉහළයි (' . $pair . '). පපුවේ වේදනාව, කතා කිරීමේ අපහසුව, හෝ හුස්ම හිරවීමක් තිබේ නම් දැන්ම හදිසි ප්‍රතිකාර ගන්න.';
        } else {
            $fix[] = ['title' => 'පීඩනය ඉහළයි', 'text' => $pair . ' mmHg. ලුණු දැඩිව අඩු කරන්න. ඇවිදීම දිනපතා කරන්න, හදිසි බර ඉසිලීම එපා. මෙම සතියේ වෛද්‍යවරයකු හමුවී අගය පෙන්වන්න.'];
            if ($snap['systolic'] >= 160 || $snap['diastolic'] >= 100) {
                $alert = 'රුධිර පීඩනය ' . $pair . ' දක්වා ඉහළයි. ඉක්මනින් වෛද්‍ය උපදෙස් ලබාගන්න. අද ලුණු සහ උල් කෑම නවත්වන්න.';
            }
        }
    }

    $cholStatus = chol_status($snap['cholesterol']);
    if ($cholStatus !== null) {
        $value = num($snap['cholesterol']) . ' mg/dL';
        if ($cholStatus === 'normal') {
            $good[] = ['title' => 'කොලෙස්ටරෝල් හොඳයි', 'text' => 'මුළු කොලෙස්ටරෝල් ' . $value . '. බැදපු ආහාර අඩුවෙන්, මාළු සහ එළවළු වැඩිපුර තියාගන්න. මසකට වරක් නැවත මැනීම ප්‍රමාණවත්.'];
        } elseif ($cholStatus === 'border') {
            $fix[] = ['title' => 'කොලෙස්ටරෝල් මායිමේ', 'text' => $value . '. කහ මදය, බැදපු කෑම සහ නුගත් තෙල් අඩු කරන්න. පරිප්පු, මාළු, ගොටුකොළ, මුරුංගා කොළ සහ ඕට්ස් වැඩි කරන්න. සතියට දින 5ක් ඇවිදින්න.'];
        } else {
            $fix[] = ['title' => 'කොලෙස්ටරෝල් ඉහළයි', 'text' => $value . '. තෙල් සහිත කෑම සතියේ දින ගණන සීමා කරන්න. රතු මස් වෙනුවට මාළු හෝ පරිප්පු. මෙම අගය වෛද්‍යවරයාට පෙන්වන්න. ඖෂධ වෙනස් කරන්න එපා, උපදෙස් ගන්න.'];
        }
    }

    $bmiStatus = bmi_status($snap['bmi']);
    if ($bmiStatus !== null) {
        $value = num($snap['bmi'], 1);
        if ($bmiStatus === 'normal') {
            $good[] = ['title' => 'BMI සාමාන්‍යයි', 'text' => 'ශරීර ස්කන්ධ දර්ශකය ' . $value . '. බර මෙම පරාසයේ තියාගන්න. සතියේ එක් වරක් බලාගත්තා ප්‍රමාණයි. දිනපතා තරාදිය ගැන කලකිරෙන්න එපා.'];
        } elseif ($bmiStatus === 'under') {
            $fix[] = ['title' => 'BMI අඩුයි', 'text' => 'දර්ශකය ' . $value . '. පරිප්පු, බිත්තර, කිරි, රටකජු සහ පලතුරු වැඩි කරන්න. හේතුවක් නැතුව බර බසිනවා නම් වෛද්‍යවරයා හමුවන්න.'];
        } elseif ($bmiStatus === 'over') {
            $fix[] = ['title' => 'බර මඳ වැඩියි', 'text' => 'BMI ' . $value . '. පිඟානෙන් අඩක් එළවළු කර, සහල් ප්‍රමාණය අත්ල ප්‍රමාණයකට ආසන්න කරන්න. දිනපතා විනාඩි 30ක් ඇවිදීමෙන් බර සෙමින් සැකසේ.'];
        } else {
            $fix[] = ['title' => 'BMI ඉහළයි', 'text' => 'දර්ශකය ' . $value . '. හදිසි ආහාර වැළකීමෙන් වළකින්න. කෑම වේලාව නියමිත කර, රසකැවිලි අඩු කර, ඇවිදීම අදම පටන් ගන්න. වෛද්‍යවරයා සමඟ බර ගැන කතා කරන්න.'];
        }
    }

    $keep = [];
    $weak = weakest_key($parts);
    if ($weak === 'bp' || $bpStatus === 'high' || $bpStatus === 'crisis' || $bpStatus === 'stage1') {
        $keep[] = 'අද උදේ ආහාරයට ලුණු එකතු කරන්න එපා. කරවල, උල් අච්චාරු සහ ක්ෂණික සුප් දවසේ මඟ හරින්න.';
        $keep[] = 'විනාඩි 30ක් සෙමින් ඇවිදින්න. හුස්ම නොහිරෙන වේගය ප්‍රමාණවත්.';
    } elseif ($weak === 'sugar' || $sugarStatus === 'high' || $sugarStatus === 'border') {
        $keep[] = 'ඊළඟ තේ එක සීනි නැතිව බොන්න. බීම වර්ග අද එපා.';
        $keep[] = 'කෑමෙන් පසු විනාඩි 15–20ක් මළුවේ හෝ පාරේ ඇවිදින්න.';
    } elseif ($weak === 'chol') {
        $keep[] = 'අද බැදපු කෑමක් නැතිව, මාළු හෝ පරිප්පු සමඟ කොළ පැහැති එළවළු තෝරන්න.';
        $keep[] = 'සතියේ දින පහකට ඇවිදීම කොලෙස්ටරෝල් සමබර කිරීමට උදව් වේ.';
    } elseif ($weak === 'bmi') {
        $keep[] = 'අද රෑ කෑම සාමාන්‍යයට වඩා ටිකක් කලින් කන්න. පිඟානෙන් අඩක් එළවළු වෙන්න.';
        $keep[] = 'විනාඩි 10 බැගින් තුන් වතාවක් ඇවිද්ඩත් දවසේ ඉලක්කය සම්පූර්ණයි.';
    } else {
        $keep[] = 'මේ සතියේත් දිනපතා එකම වේලාවට සීනි සහ පීඩනය සටහන් කරන්න. රටාව එතකොට පේනවා.';
        $keep[] = 'පිඟානෙන් අඩක් එළවළු, වතුර වීදුරු 6–8, සහ විනාඩි 30ක ඇවිදීම තියාගන්න.';
    }
    $keep[] = 'වෛද්‍යවරයා දුන් ඖෂධ තිබේ නම් ඒවා නවත්වන්න එපා. මෙහි උපදෙස් ආහාර, ඇවිදීම සහ මැනීම ගැනයි.';

    return [
        'score' => $score,
        'tone' => score_tone($score),
        'label' => score_label($score),
        'lead' => balance_lead($snap, $parts),
        'alert' => $alert,
        'good' => $good,
        'fix' => $fix,
        'keep' => $keep,
        'parts' => $parts,
    ];
}

function needs_attention(array $snap): bool
{
    foreach (snapshot_parts($snap) as $part) {
        if (in_array($part['status'], ['high', 'obese', 'crisis', 'border', 'stage1'], true)) {
            return true;
        }
    }
    return false;
}

function daily_tip(?DateTimeInterface $day = null): array
{
    $tips = [
        ['title' => 'උදේ වතුර', 'text' => 'නැගිට එක වීදුරු වතුරක් බොන්න. ආහාරයට පෙර තව එකක්. සීනි බීම වෙනුවට මෙය පුරුද්ද කරගන්න.'],
        ['title' => 'කෙටි ඇවිදීම්', 'text' => 'විනාඩි 30ක් එක දිගට අමාරු නම්, විනාඩි 10 බැගින් තුන් වතාවක් ඇවිදින්න. එයත් ගණන්.'],
        ['title' => 'සීනි තේ', 'text' => 'සීනි එකපාරටම නවත්වන්න අමාරු නම්, මේ සතියේ තේ එකකට සීනි ඇට භාගයක් අඩු කරන්න.'],
        ['title' => 'ලුණු බඳුන', 'text' => 'කෑම මේසයේ ලුණු බඳුන තියන්න එපා. රස බලන්න කලින් එකතු කරන ලුණු පීඩනය නඟී.'],
        ['title' => 'පිඟානේ සැලැස්ම', 'text' => 'අඩක් එළවළු, කාලක් සහල් හෝ පාන්, කාලක් පරිප්පු හෝ මාළු. මෙය සීනි, පීඩනය සහ බර තුනටම ගැලපේ.'],
        ['title' => 'නින්දේ වේලාව', 'text' => 'රෑ 11ට කලින් නිදාගන්න. අඩු නින්ද ඊළඟ දවසේ සීනි සහ පීඩනය දෙකම අවුල් කරයි.'],
        ['title' => 'පළතුරම කන්න', 'text' => 'පළතුරු යුෂ වීදුරුවක් වෙනුවට පළතුරක් කන්න. කෙඳි එක්ක සීනි සෙමින් නඟී.'],
        ['title' => 'සහල', 'text' => 'සුදු සහල් ප්‍රමාණය ටිකක් අඩු කර, රතු සහල් හෝ කුරක්කන් මිශ්‍ර කළොත් සීනි රටාව සන්සුන් වේ.'],
        ['title' => 'රෑ කෑම', 'text' => 'නිදාගන්නට පැය 2කට කලින් බර කෑම ඉවර කරන්න. රෑ පරක්කු කෑම සීනි උදේට තියාගනී.'],
        ['title' => 'වාඩි වීම', 'text' => 'පැයකට වරක් නැගිට සිටගෙන පියවර කිහිපයක් යන්න. දිගු වේලා වාඩි වීම පීඩනයට හොඳ නැත.'],
        ['title' => 'කොළ එළවළු', 'text' => 'ගොටුකොළ, කංකුන් හෝ මුරුංගා කොළ දිනපතා ටිකක්. ලුණු අඩුවෙන් තම්බාගන්න.'],
        ['title' => 'තෙල්', 'text' => 'බැදපු කෑම සතියේ දින ගණන අඩු කරන්න. කොලෙස්ටරෝල් සහ බර දෙකටම එය වැදගත්.'],
        ['title' => 'එකම වේලාව', 'text' => 'සීනි මනින්නේ උදේ නිරාහාරව නම්, හැමදාම එකම වේලාවට මනින්න. එතකොට මාසයේ රටාව සාධාරණයි.'],
        ['title' => 'ඖෂධ', 'text' => 'ඖෂධ නියමිත වේලාවට ගන්න. අගය හොඳයි කියා ඖෂධ නවත්වන්න එපා. ඒක වෛද්‍යවරයාගේ තීරණයක්.'],
        ['title' => 'හුස්ම', 'text' => 'මිනිත්තු 5ක් හෙමින් හුස්ම ගන්න. ආතතිය අඩු වුණාම පීඩනයටත් රුකුල් දෙයි.'],
        ['title' => 'මිහිර', 'text' => 'ඉතා මිහිරි තේ, කාපි සහ බීම වර්ග අද එකක්වත් නැති දවසක් කරන්න. හෙට ඒ දවස සටහන් කරන්න.'],
        ['title' => 'කෙඳි', 'text' => 'පරිප්පු, එළවළු සහ පළතුරුවල කෙඳි සීනි නඟින වේගය අඩු කරයි. සහල් විතරක් කන්න එපා.'],
        ['title' => 'තරාදිය', 'text' => 'බර සතියේ එක් වරක්, උදේ, එකම තරාදියෙන් බලන්න. දිනපතා උඩ පහළ බලා සිත කලකිරෙන්න එපා.'],
        ['title' => 'ගෙදර කෑම', 'text' => 'ගෙදර හැමෝගේම කෑමේ ලුණු අඩු කළොත් ඔබට වෙනම කෑමක් උයන්න ඕනෑ නැත. පවුලටම හොඳයි.'],
        ['title' => 'උදව් ඉල්ලන්න', 'text' => 'අගයන් සති කිහිපයක් ඉහළ නම් ලැජ්ජා වෙන්න එපා. වෛද්‍යවරයාට මේ දිනපොත පෙන්වන්න. ඒකයි මෙහි ප්‍රයෝජනය.'],
    ];
    $day = $day ? DateTimeImmutable::createFromInterface($day) : new DateTimeImmutable('today');
    $index = ((int) $day->format('z')) % count($tips);
    return $tips[$index];
}

function dominant_sugar_type(array $rows): string
{
    $counts = ['fasting' => 0, 'random' => 0, 'post' => 0];
    foreach ($rows as $row) {
        if (fval($row['sugar_mgdl']) === null) {
            continue;
        }
        $type = (string) ($row['sugar_type'] ?? 'fasting');
        if (isset($counts[$type])) {
            $counts[$type]++;
        }
    }
    $best = 'fasting';
    foreach ($counts as $type => $count) {
        if ($count > $counts[$best]) {
            $best = $type;
        }
    }
    return $best;
}

function average_of(array $rows, string $field): ?float
{
    $sum = 0.0;
    $n = 0;
    foreach ($rows as $row) {
        $value = fval($row[$field] ?? null);
        if ($value === null) {
            continue;
        }
        $sum += $value;
        $n++;
    }
    if ($n === 0) {
        return null;
    }
    return $sum / $n;
}

function change_phrase(?float $now, ?float $then): ?string
{
    if ($now === null || $then === null) {
        return null;
    }
    $diff = $now - $then;
    if (abs($diff) < 0.05) {
        return 'පෙර මාසය වගේමයි';
    }
    $word = $diff < 0 ? 'අඩුයි' : 'වැඩියි';
    return 'පෙර මාසයට වඩා ' . num(abs($diff)) . 'ක් ' . $word;
}

function build_month_report(array $rows, array $prevRows): array
{
    $days = [];
    foreach ($rows as $row) {
        $days[$row['recorded_on']] = true;
    }
    $sugarType = dominant_sugar_type($rows);
    $avg = [
        'sugar' => average_of($rows, 'sugar_mgdl'),
        'systolic' => average_of($rows, 'systolic'),
        'diastolic' => average_of($rows, 'diastolic'),
        'cholesterol' => average_of($rows, 'cholesterol_mgdl'),
        'bmi' => average_of($rows, 'bmi'),
    ];
    $prev = [
        'sugar' => average_of($prevRows, 'sugar_mgdl'),
        'systolic' => average_of($prevRows, 'systolic'),
        'diastolic' => average_of($prevRows, 'diastolic'),
        'cholesterol' => average_of($prevRows, 'cholesterol_mgdl'),
        'bmi' => average_of($prevRows, 'bmi'),
    ];

    $byDay = [];
    foreach ($rows as $row) {
        $byDay[$row['recorded_on']][] = $row;
    }
    ksort($byDay);

    $sugarPoints = [];
    $bpSys = [];
    $bpDia = [];
    $bpLabels = [];
    $bpDates = [];
    $bpSysStatus = [];
    $bpDiaStatus = [];
    $cholPoints = [];
    $bmiPoints = [];
    $highSugarDays = 0;
    $highBpDays = 0;

    foreach ($byDay as $date => $list) {
        $label = (string) (int) substr($date, 8, 2);
        $pretty = nice_date($date);
        $sugarAvg = average_of($list, 'sugar_mgdl');
        if ($sugarAvg !== null) {
            $status = sugar_status($sugarAvg, $sugarType);
            if (in_array($status, ['high', 'border'], true)) {
                $highSugarDays++;
            }
            $sugarPoints[] = ['label' => $label, 'date' => $pretty, 'value' => round($sugarAvg, 1), 'status' => $status];
        }
        $sys = average_of($list, 'systolic');
        $dia = average_of($list, 'diastolic');
        if ($sys !== null && $dia !== null) {
            $status = bp_status((int) round($sys), (int) round($dia));
            if (in_array($status, ['high', 'crisis', 'stage1'], true)) {
                $highBpDays++;
            }
            $bpLabels[] = $label;
            $bpDates[] = $pretty;
            $bpSys[] = round($sys);
            $bpDia[] = round($dia);
            $bpSysStatus[] = $status;
            $bpDiaStatus[] = $status;
        }
        $cholAvg = average_of($list, 'cholesterol_mgdl');
        if ($cholAvg !== null) {
            $cholPoints[] = ['label' => $label, 'date' => $pretty, 'value' => round($cholAvg, 1), 'status' => chol_status($cholAvg)];
        }
        $bmiAvg = average_of($list, 'bmi');
        if ($bmiAvg !== null) {
            $bmiPoints[] = ['label' => $label, 'date' => $pretty, 'value' => round($bmiAvg, 1), 'status' => bmi_status($bmiAvg)];
        }
    }

    $paragraphs = [];
    if (!$rows) {
        $paragraphs[] = 'මෙම මාසයේ තවම මැනුම් නැත. අද එක මැනුමක් දැම්මොත්, මාසය අවසානේ රටාව කියවන්න පුළුවන්.';
    } else {
        $paragraphs[] = 'මෙම මාසයේ මැනුම් ' . count($rows) . 'ක්, දින ' . count($days) . 'කදී සටහන් වී ඇත.';
        $bits = [];
        if ($avg['sugar'] !== null) {
            $status = sugar_status($avg['sugar'], $sugarType);
            $line = 'සීනි සාමාන්‍යය ' . num($avg['sugar']) . ' (' . sugar_type_label($sugarType) . ', ' . status_label((string) $status) . ')';
            $change = change_phrase($avg['sugar'], $prev['sugar']);
            if ($change) {
                $line .= '. ' . $change;
            }
            if ($highSugarDays > 0) {
                $line .= '. සීනි මායිම් හෝ ඉහළ දින ' . $highSugarDays . 'ක් තිබුණා';
            }
            $bits[] = $line . '.';
        } else {
            $bits[] = 'මෙම මාසයේ සීනි මැනුම් නැත.';
        }
        if ($avg['systolic'] !== null && $avg['diastolic'] !== null) {
            $status = bp_status((int) round((float) $avg['systolic']), (int) round((float) $avg['diastolic']));
            $line = 'පීඩන සාමාන්‍යය ' . num($avg['systolic']) . '/' . num($avg['diastolic']) . ' (' . status_label((string) $status) . ')';
            $change = change_phrase($avg['systolic'], $prev['systolic']);
            if ($change) {
                $line .= '. ඉහළ අගය ' . $change;
            }
            if ($highBpDays > 0) {
                $line .= '. පීඩනය අවධානය ඕනෑ දින ' . $highBpDays . 'ක්';
            }
            $bits[] = $line . '.';
        } else {
            $bits[] = 'මෙම මාසයේ පීඩන මැනුම් නැත.';
        }
        if ($avg['cholesterol'] !== null) {
            $status = chol_status($avg['cholesterol']);
            $line = 'කොලෙස්ටරෝල් සාමාන්‍යය ' . num($avg['cholesterol']) . ' (' . status_label((string) $status) . ')';
            $change = change_phrase($avg['cholesterol'], $prev['cholesterol']);
            if ($change) {
                $line .= '. ' . $change;
            }
            $bits[] = $line . '.';
        } else {
            $bits[] = 'මෙම මාසයේ කොලෙස්ටරෝල් සටහන් වී නැත. මසකට වරක්වත් දැම්මොත් ඇත.';
        }
        if ($avg['bmi'] !== null) {
            $status = bmi_status($avg['bmi']);
            $line = 'BMI සාමාන්‍යය ' . num($avg['bmi'], 1) . ' (' . status_label((string) $status) . ')';
            $change = change_phrase($avg['bmi'], $prev['bmi']);
            if ($change) {
                $line .= '. ' . $change;
            }
            $bits[] = $line . '.';
        } else {
            $bits[] = 'BMI සඳහා බර සටහන් වී නැත.';
        }
        $paragraphs[] = implode(' ', $bits);

        $snap = [
            'sugar' => $avg['sugar'],
            'sugar_type' => $sugarType,
            'sugar_date' => null,
            'systolic' => $avg['systolic'] !== null ? (int) round((float) $avg['systolic']) : null,
            'diastolic' => $avg['diastolic'] !== null ? (int) round((float) $avg['diastolic']) : null,
            'bp_date' => null,
            'cholesterol' => $avg['cholesterol'],
            'chol_date' => null,
            'bmi' => $avg['bmi'] !== null ? round((float) $avg['bmi'], 1) : null,
            'weight' => null,
            'bmi_date' => null,
        ];
        $weak = weakest_key(snapshot_parts($snap));
        $paragraphs[] = match ($weak) {
            'sugar' => 'ඊළඟ මාසයේ පළමු ඉලක්කය සීනි. සීනි තේ අඩු කර, කෑමෙන් පසු ඇවිදින්න, උදේ නිරාහාර අගය සතියකට 4 වතාවක්වත් සටහන් කරන්න.',
            'bp' => 'ඊළඟ මාසයේ පළමු ඉලක්කය පීඩනය. ලුණු අඩු කර, දින 5ක් ඇවිදින්න, උදේ සහ සවස එක් වරක් බැගින් පීඩනය ලියන්න.',
            'chol' => 'ඊළඟ මාසයේ පළමු ඉලක්කය කොලෙස්ටරෝල්. බැදපු කෑම අඩු කර මාළු සහ කොළ එළවළු වැඩි කරන්න. මාසය අවසානයේ නැවත මනින්න.',
            'bmi' => 'ඊළඟ මාසයේ පළමු ඉලක්කය බර. පිඟාන අඩු කරන්න එපා, එළවළු වැඩි කරන්න. සතියේ එක් වරක් බර සටහන් කරන්න.',
            default => 'මේ මාසයේ සාමාන්‍යයන් සමබර පරාසයට ආසන්නයි. ඊළඟ මාසයේත් දිනපතා කුඩා සටහනක් තැබුවොත් මේ පුරුද්ද රැකේ.',
        };
    }

    $toLine = static function (array $points, string $name, string $color): array {
        return [
            'name' => $name,
            'color' => $color,
            'values' => array_map(static fn (array $p) => $p['value'], $points),
            'statuses' => array_map(static fn (array $p) => $p['status'], $points),
            'labels' => array_map(static fn (array $p) => $p['label'], $points),
            'dates' => array_map(static fn (array $p) => $p['date'], $points),
        ];
    };

    $chart = [
        'sugar' => [
            'unit' => 'mg/dL',
            'caption' => 'කොළ පටිය නිරාහාර සාමාන්‍ය පරාසයයි (70–99). අහඹු මැනුම් නම් 140ට අඩු අගයත් පිළිගත හැක.',
            'band' => [70, 99],
            'guides' => [],
            'lines' => $sugarPoints ? [$toLine($sugarPoints, 'සීනි', '#c45c26')] : [],
        ],
        'bp' => [
            'unit' => 'mmHg',
            'caption' => 'කැඩුණු ඉරි යොමුවයි: ඉහළ පීඩනය 120, පහළ පීඩනය 80.',
            'band' => null,
            'guides' => [['value' => 120, 'label' => '120'], ['value' => 80, 'label' => '80']],
            'lines' => $bpLabels ? [[
                'name' => 'ඉහළ',
                'color' => '#0b2e5b',
                'values' => $bpSys,
                'statuses' => $bpSysStatus,
                'labels' => $bpLabels,
                'dates' => $bpDates,
            ], [
                'name' => 'පහළ',
                'color' => '#2f7dba',
                'values' => $bpDia,
                'statuses' => $bpDiaStatus,
                'labels' => $bpLabels,
                'dates' => $bpDates,
            ]] : [],
        ],
        'cholesterol' => [
            'unit' => 'mg/dL',
            'caption' => 'කොළ පටිය 200ට අඩු, කැමති පරාසයයි.',
            'band' => [100, 199],
            'guides' => [],
            'lines' => $cholPoints ? [$toLine($cholPoints, 'කොලෙස්ටරෝල්', '#8d153a')] : [],
        ],
        'bmi' => [
            'unit' => 'BMI',
            'caption' => 'කොළ පටිය සාමාන්‍ය BMI පරාසයයි (18.5–24.9).',
            'band' => [18.5, 24.9],
            'guides' => [],
            'lines' => $bmiPoints ? [$toLine($bmiPoints, 'BMI', '#1f7a4d')] : [],
        ],
    ];

    return [
        'count' => count($rows),
        'days' => count($days),
        'avg' => $avg,
        'prev' => $prev,
        'paragraphs' => $paragraphs,
        'chart' => $chart,
        'sugar_type' => $sugarType,
    ];
}

function validate_reading(array $src, ?float $profileHeight): array
{
    $errors = [];
    $date = trim((string) ($src['recorded_on'] ?? ''));
    $dt = DateTime::createFromFormat('Y-m-d', $date);
    if (!$dt || $dt->format('Y-m-d') !== $date) {
        $errors[] = 'දිනය වලංගු නැත.';
    } elseif ($date > date('Y-m-d')) {
        $errors[] = 'අනාගත දිනයක මැනුමක් දාන්න බැහැ.';
    }

    $sugar = parse_num((string) ($src['sugar_mgdl'] ?? ''));
    $sys = parse_num((string) ($src['systolic'] ?? ''));
    $dia = parse_num((string) ($src['diastolic'] ?? ''));
    $chol = parse_num((string) ($src['cholesterol_mgdl'] ?? ''));
    $weight = parse_num((string) ($src['weight_kg'] ?? ''));
    $height = parse_num((string) ($src['height_cm'] ?? ''));
    foreach (['සීනි' => $sugar, 'ඉහළ පීඩනය' => $sys, 'පහළ පීඩනය' => $dia, 'කොලෙස්ටරෝල්' => $chol, 'බර' => $weight, 'උස' => $height] as $label => $parsed) {
        if (!$parsed['ok']) {
            $errors[] = $label . ' සඳහා ඉලක්කම් පමණක් යොදන්න.';
        }
    }

    $type = (string) ($src['sugar_type'] ?? 'fasting');
    if (!in_array($type, ['fasting', 'random', 'post'], true)) {
        $type = 'fasting';
    }

    $sugarV = $sugar['ok'] ? $sugar['value'] : null;
    $sysV = $sys['ok'] ? $sys['value'] : null;
    $diaV = $dia['ok'] ? $dia['value'] : null;
    $cholV = $chol['ok'] ? $chol['value'] : null;
    $weightV = $weight['ok'] ? $weight['value'] : null;
    $heightV = $height['ok'] ? $height['value'] : null;

    if ($sugarV !== null && ($sugarV < 40 || $sugarV > 600)) {
        $errors[] = 'සීනි අගය 40 සහ 600 අතර විය යුතුයි.';
    }
    if (($sysV === null) !== ($diaV === null)) {
        $errors[] = 'රුධිර පීඩනයේ ඉහළ සහ පහළ අගයන් දෙකම දෙන්න.';
    }
    if ($sysV !== null && ($sysV < 60 || $sysV > 250)) {
        $errors[] = 'ඉහළ පීඩනය 60 සහ 250 අතර විය යුතුයි.';
    }
    if ($diaV !== null && ($diaV < 30 || $diaV > 150)) {
        $errors[] = 'පහළ පීඩනය 30 සහ 150 අතර විය යුතුයි.';
    }
    if ($sysV !== null && $diaV !== null && $diaV >= $sysV) {
        $errors[] = 'පහළ පීඩනය, ඉහළ පීඩනයට වඩා අඩු විය යුතුයි.';
    }
    if ($cholV !== null && ($cholV < 50 || $cholV > 500)) {
        $errors[] = 'කොලෙස්ටරෝල් අගය 50 සහ 500 අතර විය යුතුයි.';
    }
    if ($weightV !== null && ($weightV < 20 || $weightV > 300)) {
        $errors[] = 'බර කිලෝග්‍රෑම් 20 සහ 300 අතර විය යුතුයි.';
    }
    if ($heightV !== null && ($heightV < 80 || $heightV > 230)) {
        $errors[] = 'උස සෙන්ටිමීටර 80 සහ 230 අතර විය යුතුයි.';
    }

    $heightUse = $heightV ?? $profileHeight;
    $bmi = null;
    if ($weightV !== null) {
        if ($heightUse === null) {
            $errors[] = 'BMI ගණනයට උස අවශ්‍යයි. උස සෙන්ටිමීටර වලින් දෙන්න.';
        } else {
            $bmi = round($weightV / (($heightUse / 100) ** 2), 1);
        }
    }

    $hasMetric = $sugarV !== null || $sysV !== null || $cholV !== null || $weightV !== null;
    if (!$hasMetric && $heightV === null) {
        $errors[] = 'අඩුම තරමේ එක මැනුමක්වත් ඇතුළත් කරන්න.';
    }

    $note = trim((string) ($src['note'] ?? ''));
    if (mb_strlen($note) > 200) {
        $errors[] = 'සටහන අකුරු 200ට වඩා දිග වැඩියි.';
    }

    return [
        'errors' => $errors,
        'height_only' => $errors === [] && !$hasMetric && $heightV !== null,
        'data' => [
            'recorded_on' => $date,
            'sugar_mgdl' => $sugarV !== null ? round($sugarV, 1) : null,
            'sugar_type' => $sugarV !== null ? $type : null,
            'systolic' => $sysV !== null ? (int) round($sysV) : null,
            'diastolic' => $diaV !== null ? (int) round($diaV) : null,
            'cholesterol_mgdl' => $cholV !== null ? round($cholV, 1) : null,
            'weight_kg' => $weightV !== null ? round($weightV, 1) : null,
            'height_cm' => $heightUse !== null ? round($heightUse, 1) : null,
            'height_input' => $heightV !== null ? round($heightV, 1) : null,
            'bmi' => $bmi,
            'note' => $note === '' ? null : $note,
        ],
    ];
}

function save_reading(int $userId, array $data): void
{
    $stmt = db()->prepare('INSERT INTO readings (user_id, recorded_on, sugar_mgdl, sugar_type, systolic, diastolic, cholesterol_mgdl, weight_kg, height_cm, bmi, note, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)');
    $stmt->execute([
        $userId,
        $data['recorded_on'],
        $data['sugar_mgdl'],
        $data['sugar_type'],
        $data['systolic'],
        $data['diastolic'],
        $data['cholesterol_mgdl'],
        $data['weight_kg'],
        $data['height_cm'],
        $data['bmi'],
        $data['note'],
        date('Y-m-d H:i:s'),
    ]);
    $height = $data['height_input'] ?? $data['height_cm'];
    if ($height !== null) {
        db()->prepare('UPDATE users SET height_cm = ? WHERE id = ?')->execute([$height, $userId]);
    }
}

function food_advice(array $snap): string
{
    $weak = weakest_key(snapshot_parts($snap));
    return match ($weak) {
        'sugar' => 'අද පිඟාන: අඩක් එළවළු, අත්ල තරම් රතු සහල් හෝ කුරක්කන්, පරිප්පු හෝ මාළු. සීනි තේ, බීම වර්ග, කේක් සහ පළතුරු යුෂ එපා. පළතුරක් කන්න ඕනෑ නම් අඹ හෝ කෙසෙල් විශාල කෑල්ලක් නොව, කුඩා එකක්.',
        'bp' => 'අද ලුණු අඩුවෙන්. කරවල, උල් අච්චාරු, සෝස් සහ ක්ෂණික ආහාර එපා. මාළු හෝ පරිප්පු, ගොටුකොළ හෝ කංකුන්, සහ වතුර. කෑමට පසුව ලුණු එකතු කරන්න එපා.',
        'chol' => 'අද බැදපු දෙයක් එපා. මාළු, පරිප්පු, ගොටුකොළ, මුරුංගා සහ ඕට්ස් හොඳයි. කහ මදය සහ නුගත් තෙල් අඩු කරන්න. එළවළු තෙල් ස්වල්පයක් ඇතිව තම්බාගත්තා හොඳයි.',
        'bmi' => 'කෑම මඟ හරින්න එපා. පිඟාන කුඩා කර, අඩක් එළවළු පුරවන්න. රෑ පරක්කුවට දෙවන වටය එපා. බත් වෙනුවට එළවළු වැඩි කළොත් බර සෙමින් සැකසේ.',
        default => 'සමබර පිඟානක් තියාගන්න: අඩක් එළවළු, ටිකක් සහල්, පරිප්පු හෝ මාළු, වතුර. සීනි සහ ලුණු දෙකම අඩුවෙන්. මේ පුරුද්ද හතරම රකිනවා.',
    };
}

function move_advice(array $snap): string
{
    $weak = weakest_key(snapshot_parts($snap));
    if ($weak === 'bp' && in_array(bp_status($snap['systolic'], $snap['diastolic']), ['crisis', 'high'], true)) {
        return 'පීඩනය ඉහළ දවසක දුවන්න හෝ බර ඉසිල්ලන්න එපා. විනාඩි 20–30ක් සෙමින් ඇවිදින්න. පපුවේ කැක්කුමක් ආවොත් නවත්වලා උදව් ගන්න.';
    }
    if ($weak === 'sugar') {
        return 'කෑමෙන් පසු විනාඩි 15–20ක් ඇවිදීම සීනි බස්සන සරලම දේ. දවසට විනාඩි 30ක් සම්පූර්ණ කරන්න. අමාරු නම් විනාඩි 10 බැගින් තුන් වතාවක්.';
    }
    return 'දවසට විනාඩි 30ක් ඇවිදින්න. කතා කරනකොට හුස්ම ටිකක් වැඩි වුණාට, වාක්‍යයක් කියන්න බැරි තරම් නොවිය යුතුයි. සතියට දින 5ක් මෙය කළොත් සීනි, පීඩනය, කොලෙස්ටරෝල් සහ බර සතරටම රුකුල් දෙයි.';
}

function describe_snapshot(array $snap): string
{
    if (!snapshot_parts($snap)) {
        return 'තවම මැනුම් සටහන් වී නැත. අද පිටුවේ සීනි, පීඩනය හෝ බර දැම්මොත් මට ඒවා බලලා කියන්න පුළුවන්.';
    }
    $bits = [];
    if ($snap['sugar'] !== null) {
        $status = sugar_status($snap['sugar'], (string) $snap['sugar_type']);
        $bits[] = sugar_type_label((string) $snap['sugar_type']) . ' සීනි ' . num($snap['sugar']) . ' (' . status_label((string) $status) . ', ' . nice_date((string) $snap['sugar_date']) . ')';
    }
    if ($snap['systolic'] !== null) {
        $status = bp_status($snap['systolic'], $snap['diastolic']);
        $bits[] = 'පීඩනය ' . $snap['systolic'] . '/' . $snap['diastolic'] . ' (' . status_label((string) $status) . ', ' . nice_date((string) $snap['bp_date']) . ')';
    }
    if ($snap['cholesterol'] !== null) {
        $status = chol_status($snap['cholesterol']);
        $bits[] = 'කොලෙස්ටරෝල් ' . num($snap['cholesterol']) . ' (' . status_label((string) $status) . ', ' . nice_date((string) $snap['chol_date']) . ')';
    }
    if ($snap['bmi'] !== null) {
        $status = bmi_status($snap['bmi']);
        $bits[] = 'BMI ' . num($snap['bmi'], 1) . ' (' . status_label((string) $status) . ', ' . nice_date((string) $snap['bmi_date']) . ')';
    }
    $pack = advice_pack($snap);
    return 'අවසන් දන්නා අගයන්: ' . implode('; ', $bits) . '. සමබරතා ලකුණ ' . ($pack['score'] ?? '—') . '. ' . $pack['lead'];
}
