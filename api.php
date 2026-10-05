<?php
/**
 * MDTU API. One endpoint for the public site, sign-in, records, and reports.
 */

declare(strict_types=1);

require __DIR__ . '/config.php';
app_bootstrap();

$action = $_GET['action'] ?? $_POST['action'] ?? '';
if (!is_string($action) || $action === '') {
    json_out(['ok' => false, 'error' => 'Missing action.'], 400);
}

try {
    match ($action) {
        'me' => action_me(),
        'login' => action_login(),
        'logout' => action_logout(),
        'pulse' => action_pulse(),
        'home' => action_home(),
        'public-list' => action_public_list(),
        'comment' => action_comment(),
        'catalog' => action_catalog(),
        'schema' => action_schema(),
        'list' => action_list(),
        'save' => action_save(),
        'delete' => action_delete(),
        'upload' => action_upload(),
        'dashboard' => action_dashboard(),
        'options' => action_options(),
        'apply' => action_apply(),
        'select-applicant' => action_select_applicant(),
        'attendance-save' => action_attendance_save(),
        'confirm-attendance' => action_confirm_attendance(),
        'walkin-many' => action_walkin_many(),
        'attendance-upload' => action_attendance_upload(),
        'finish' => action_finish(),
        'report' => action_report(),
        'export' => action_export(),
        'import' => action_import(),
        'next-plan' => action_next_plan(),
        'resource-options' => action_resource_options(),
        'resource-lookup' => action_resource_lookup(),
        'resource-save' => action_resource_save(),
        'programme' => action_programme(),
        'calendar' => action_calendar(),
        'birthdays' => action_birthdays(),
        'phones' => action_phones(),
        'profile' => action_profile(),
        'officer-history' => action_officer_history(),
        'officer-letter' => action_officer_letter(),
        'call-letters' => action_call_letters(),
        'letter' => action_letter(),
        'signatory' => action_signatory(),
        'signatory-save' => action_signatory_save(),
        'modules' => action_modules(),
        'module' => action_module(),
        'module-save' => action_module_save(),
        'module-excel' => action_module_excel(),
        'eval-get' => action_eval_get(),
        'eval-save' => action_eval_save(),
        'eval-live' => action_eval_live(),
        'eval-report' => action_eval_report(),
        'eval-open' => action_eval_open(),
        'eval-who' => action_eval_who(),
        'eval-state' => action_eval_state(),
        'eval-answer' => action_eval_answer(),
        'messages' => action_messages(),
        'total' => action_total(),
        'total-save' => action_total_save(),
        'total-calc' => action_total_calc(),
        'split' => action_split(),
        'person' => action_person(),
        'attended' => action_attended(),
        'pace' => action_pace(),
        'pace-save' => action_pace_save(),
        'pace-calc' => action_pace_calc(),
        'pace-slides' => action_pace_slides(),
        'pace-slides-save' => action_pace_slides_save(),
        'ahead-tamil' => action_ahead_tamil(),
        'ahead-tamil-save' => action_ahead_tamil_save(),
        'ahead-drug' => action_ahead_drug(),
        'ahead-drug-save' => action_ahead_drug_save(),
        'ahead-external' => action_ahead_external(),
        'ahead-external-save' => action_ahead_external_save(),
        'ahead-foreign' => action_ahead_foreign(),
        'ahead-foreign-save' => action_ahead_foreign_save(),
        'ahead-office' => action_ahead_office(),
        'ahead-office-save' => action_ahead_office_save(),
        'ahead-general' => action_ahead_general(),
        'ahead-general-save' => action_ahead_general_save(),
        'ahead-special' => action_ahead_special(),
        'ahead-special-save' => action_ahead_special_save(),
        'ahead-department' => action_ahead_department(),
        'ahead-department-save' => action_ahead_department_save(),
        'ahead-compare' => action_ahead_compare(),
        'messages-save' => action_messages_save(),
        'messages-gmail' => action_messages_gmail(),
        'messages-send' => action_messages_send(),
        'blacklist' => action_blacklist(),
        'blacklist-add' => action_blacklist_add(),
        'estimate' => action_estimate(),
        'save-estimate' => action_save_estimate(),
        'saved-estimates' => action_saved_estimates(),
        'finish2' => action_finish2(),
        'offweb-save' => action_offweb_save(),
        'offweb-list' => action_offweb_list(),
        'provision' => action_provision(),
        'provision-save' => action_provision_save(),
        'provision-moves' => action_provision_moves(),
        'provision-move-save' => action_provision_move_save(),
        'provision-move-delete' => action_provision_move_delete(),
        'provision-sends' => action_provision_sends(),
        'provision-send-save' => action_provision_send_save(),
        'provision-send-delete' => action_provision_send_delete(),
        'advance' => action_advance(),
        'advance-save' => action_advance_save(),
        'advances' => action_advances(),
        'foodbill' => action_foodbill(),
        'foodbill-save' => action_foodbill_save(),
        'allowance' => action_allowance(),
        'allowance-save' => action_allowance_save(),
        'settle' => action_settle(),
        'signsheet' => action_signsheet(),
        'panelsign' => action_panelsign(),
        'private-apply' => action_private_apply(),
        'applicants' => action_applicants(),
        'selected-programmes' => action_selected_programmes(),
        'walkin' => action_walkin(),
        'drop-participant' => action_drop_participant(),
        'delete-applicant' => action_delete_applicant(),
        'chat' => action_chat(),
        'admin-chat' => action_admin_chat(),
        'admin-chat-send' => action_admin_chat_send(),
        default => json_out(['ok' => false, 'error' => 'Unknown action.'], 404),
    };
} catch (Throwable $e) {
    json_out(['ok' => false, 'error' => 'The request could not be completed.'], 500);
}

function body(): array
{
    $raw = file_get_contents('php://input') ?: '';
    if ($raw === '') {
        return $_POST;
    }
    $data = json_decode($raw, true);
    return is_array($data) ? $data : $_POST;
}

function action_me(): void
{
    session_idle();
    json_out(['ok' => true, 'user' => current_user(), 'csrf' => csrf_token()]);
}

function action_pulse(): void
{
    require_user();
    json_out(['ok' => true]);
}

function action_login(): void
{
    csrf_check();
    $data = body();
    $username = trim((string) ($data['username'] ?? ''));
    $password = (string) ($data['password'] ?? '');
    if ($username === '' || $password === '') {
        json_out(['ok' => false, 'error' => 'Enter the username and password.'], 422);
    }
    $stmt = db()->prepare('SELECT lg_id, lg_office, lg_uname, lg_type FROM cp_login WHERE lg_uname = ? AND lg_pwd = ? LIMIT 1');
    $stmt->bind_param('ss', $username, $password);
    $stmt->execute();
    $row = $stmt->get_result()->fetch_assoc();
    if (!$row) {
        json_out(['ok' => false, 'error' => 'Those details do not match an account.'], 401);
    }
    session_regenerate_id(true);
    $_SESSION['seen'] = time();
    $_SESSION['logid'] = (int) $row['lg_id'];
    $_SESSION['offid'] = (string) $row['lg_office'];
    $_SESSION['un'] = (string) $row['lg_uname'];
    $_SESSION['logtype'] = (string) $row['lg_type'];
    unset($_SESSION['pwd']);
    json_out(['ok' => true, 'user' => current_user()]);
}

function action_logout(): void
{
    csrf_check();
    $_SESSION = [];
    if (ini_get('session.use_cookies')) {
        $params = session_get_cookie_params();
        setcookie(session_name(), '', time() - 42000, $params['path'], $params['domain'] ?? '', (bool) $params['secure'], true);
    }
    session_destroy();
    json_out(['ok' => true]);
}

function rows(string $sql, string $types = '', array $params = []): array
{
    $stmt = db()->prepare($sql);
    if (!$stmt) {
        return [];
    }
    if ($types !== '') {
        $stmt->bind_param($types, ...$params);
    }
    $stmt->execute();
    $result = $stmt->get_result();
    $out = [];
    if ($result) {
        while ($row = $result->fetch_assoc()) {
            $out[] = $row;
        }
    }
    return $out;
}

function date_still_shown(string $value, string $today): bool
{
    $value = substr($value, 0, 10);
    if ($value === '' || str_starts_with($value, '0000') || str_starts_with($value, '1111')) {
        return true;
    }
    return $value >= $today;
}

function plan_end_date(array $row): string
{
    $days = programme_days($row, 'atp_day');
    if (!$days) {
        return '9999-99-99';
    }
    sort($days);
    return $days[count($days) - 1];
}

function closing_sort_key(string $value): string
{
    $value = substr($value, 0, 10);
    if ($value === '' || str_starts_with($value, '0000') || str_starts_with($value, '1111')) {
        return '9999-99-99';
    }
    return $value;
}

function sort_by_closing(array $rows, string $dateKey, string $idKey): array
{
    usort($rows, static function (array $a, array $b) use ($dateKey, $idKey): int {
        $left = closing_sort_key((string) $a[$dateKey]);
        $right = closing_sort_key((string) $b[$dateKey]);
        if ($left === $right) {
            return (int) $b[$idKey] <=> (int) $a[$idKey];
        }
        return $left <=> $right;
    });
    return $rows;
}

function action_home(): void
{
    $today = date('Y-m-d');
    $open = rows(
        "SELECT atp_id, atp_trname, atp_location, atp_day1, atp_day2, atp_day3, atp_day4, atp_day5,
                atp_stime, atp_etime, atp_lastdateapply, atp_trtype, atp_targetgroup, atp_noofdays
         FROM cp_atp
         WHERE atp_lastdateapply >= ? AND atp_addhome = ? AND TRIM(atp_trname) <> ''
           AND atp_offweb NOT IN (?, ?, ?)
         ORDER BY atp_day1 ASC LIMIT 40",
        'sssss',
        [$today, YES_SI, YES_SI, 'Yes', 'yes']
    );
    $dayKeep = [];
    $dayTypes = '';
    $dayParams = [];
    for ($day = 1; $day <= 10; $day++) {
        $dayKeep[] = "(atp_day{$day} >= ? AND atp_day{$day} NOT LIKE '0000%' AND atp_day{$day} NOT LIKE '1111%')";
        $dayTypes .= 's';
        $dayParams[] = $today;
    }
    $upcoming = rows(
        "SELECT atp_id, atp_trname, atp_location, atp_day1, atp_day2, atp_day3, atp_day4, atp_day5,
                atp_day6, atp_day7, atp_day8, atp_day9, atp_day10, atp_moredays, atp_stime, atp_etime, atp_trtype, atp_lastdateapply
         FROM cp_atp
         WHERE TRIM(atp_trname) <> '' AND atp_offweb NOT IN (?, ?, ?) AND (" . implode(' OR ', $dayKeep) . ")
         ORDER BY atp_id DESC LIMIT 80",
        'sss' . $dayTypes,
        array_merge([YES_SI, 'Yes', 'yes'], $dayParams)
    );
    usort($upcoming, static function (array $a, array $b): int {
        $endA = plan_end_date($a);
        $endB = plan_end_date($b);
        if ($endA === $endB) {
            return (int) $b['atp_id'] <=> (int) $a['atp_id'];
        }
        return $endA <=> $endB;
    });
    $upcoming = array_slice($upcoming, 0, 8);
    $notices = rows(
        "SELECT msg_id, msg_date, msg_message FROM cp_messeges WHERE msg_status = ? ORDER BY msg_date DESC, msg_id DESC LIMIT 12",
        's',
        [YES_SI]
    );
    $slides = rows(
        "SELECT slp_id, slp_photo FROM cp_slideshowimgs WHERE slp_status = ? ORDER BY slp_id DESC",
        's',
        [YES_SI]
    );
    foreach ($slides as &$slide) {
        $slide['url'] = public_file('slideshow', (string) $slide['slp_photo']);
    }
    unset($slide);
    $scholarships = array_slice(sort_by_closing(array_values(array_filter(
        rows("SELECT fs_id, fs_name, fs_country, fs_closingdate, fs_comment, fs_file FROM cp_foreignschols ORDER BY fs_id DESC LIMIT 40"),
        static fn(array $item): bool => date_still_shown((string) $item['fs_closingdate'], $today)
    )), 'fs_closingdate', 'fs_id'), 0, 8);
    foreach ($scholarships as &$item) {
        $item['url'] = $item['fs_file'] !== '' ? public_file('foriegnschols', (string) $item['fs_file']) : '';
    }
    unset($item);
    $external = array_slice(sort_by_closing(array_values(array_filter(
        rows("SELECT ot_id, ot_training, ot_institute, ot_closingdate, ot_fees, ot_file FROM cp_outsidetrcource ORDER BY ot_id DESC LIMIT 40"),
        static fn(array $item): bool => date_still_shown((string) $item['ot_closingdate'], $today)
    )), 'ot_closingdate', 'ot_id'), 0, 8);
    foreach ($external as &$item) {
        $item['url'] = $item['ot_file'] !== '' ? public_file('outsidetrainings', (string) $item['ot_file']) : '';
    }
    unset($item);
    $birthdays = rows(
        "SELECT stf_Name, stf_desig, stf_office, stf_Photo
         FROM cp_staff
         WHERE MONTH(stf_dob) = ? AND DAY(stf_dob) = ?
           AND stf_dob NOT LIKE '0000%'
         ORDER BY stf_Name ASC LIMIT 20",
        'ii',
        [(int) date('n'), (int) date('j')]
    );
    foreach ($birthdays as &$person) {
        $person['photo'] = $person['stf_Photo'] !== '' ? public_file('staff', (string) $person['stf_Photo']) : '';
    }
    unset($person);
    $downloads = rows(
        "SELECT dwn_id, dwn_date, dwn_name, dwn_type, dwn_file, dwn_des
         FROM cp_downloads ORDER BY dwn_date DESC LIMIT 16"
    );
    foreach ($downloads as &$file) {
        $file['url'] = $file['dwn_file'] !== '' ? public_file('uploads', (string) $file['dwn_file']) : '';
        $file['category'] = DOWNLOAD_TYPES[$file['dwn_type']] ?? $file['dwn_type'];
    }
    unset($file);

    json_out([
        'ok' => true,
        'today' => $today,
        'open' => $open,
        'upcoming' => $upcoming,
        'notices' => $notices,
        'slides' => $slides,
        'scholarships' => $scholarships,
        'external' => $external,
        'birthdays' => $birthdays,
        'downloads' => $downloads,
        'leader' => signatory_public(),
        'contact' => [
            'name' => MDTU_NAME,
            'org' => MDTU_ORG,
            'phone' => MDTU_PHONE,
            'fax' => MDTU_FAX,
            'place' => MDTU_PLACE,
        ],
    ]);
}

function action_public_list(): void
{
    $kind = (string) ($_GET['kind'] ?? '');
    $q = trim((string) ($_GET['q'] ?? ''));
    $like = '%' . $q . '%';
    $page = max(1, (int) ($_GET['page'] ?? 1));
        $limit = $kind === 'downloads' ? 100 : 24;
    $offset = ($page - 1) * $limit;

    if ($kind === 'programmes') {
        $type = (string) ($_GET['type'] ?? '');
        $typeValue = $type === 'productivity' ? TYPE_PRODUCTIVITY : ($type === 'mdtu' ? TYPE_MDTU : '');
        if ($typeValue === '') {
            $items = rows(
                "SELECT atp_id, atp_trname, atp_location, atp_day1, atp_stime, atp_etime, atp_trtype,
                        atp_targetgroup, atp_noofdays, atp_lastdateapply, atp_purpose, atp_fundsource
                 FROM cp_atp WHERE TRIM(atp_trname) <> '' AND atp_offweb NOT IN (?, ?, ?) AND atp_trname LIKE ? ORDER BY atp_day1 DESC LIMIT $limit OFFSET $offset",
                'ssss',
                [YES_SI, 'Yes', 'yes', $like]
            );
        } else {
            $items = rows(
                "SELECT atp_id, atp_trname, atp_location, atp_day1, atp_stime, atp_etime, atp_trtype,
                        atp_targetgroup, atp_noofdays, atp_lastdateapply, atp_purpose, atp_fundsource
                 FROM cp_atp WHERE TRIM(atp_trname) <> '' AND atp_offweb NOT IN (?, ?, ?) AND atp_trtype = ? AND atp_trname LIKE ? ORDER BY atp_day1 DESC LIMIT $limit OFFSET $offset",
                'sssss',
                [YES_SI, 'Yes', 'yes', $typeValue, $like]
            );
        }
    } elseif ($kind === 'downloads') {
        $type = (string) ($_GET['type'] ?? '');
        if ($type !== '' && !isset(DOWNLOAD_TYPES[$type])) {
            json_out(['ok' => false, 'error' => 'Unknown download category.'], 422);
        }
        if ($type === '') {
            $items = rows(
                "SELECT * FROM cp_downloads WHERE dwn_name LIKE ? OR dwn_des LIKE ? ORDER BY dwn_date DESC LIMIT $limit OFFSET $offset",
                'ss',
                [$like, $like]
            );
        } else {
            $items = rows(
                "SELECT * FROM cp_downloads WHERE dwn_type = ? AND (dwn_name LIKE ? OR dwn_des LIKE ?) ORDER BY dwn_date DESC LIMIT $limit OFFSET $offset",
                'sss',
                [$type, $like, $like]
            );
        }
        foreach ($items as &$item) {
            foreach (['dwn_file', 'dwn_file2', 'dwn_file3', 'dwn_file4'] as $column) {
                $item[$column . '_url'] = $item[$column] !== '' ? public_file('uploads', (string) $item[$column]) : '';
            }
            $item['category'] = DOWNLOAD_TYPES[$item['dwn_type']] ?? $item['dwn_type'];
        }
        unset($item);
    } elseif ($kind === 'directory') {
        $items = rows(
            "SELECT stf_ID, stf_Name, stf_desig, stf_office, stf_mobile, stf_ofstele, stf_email, stf_Photo, stf_service
             FROM cp_staff
             WHERE stf_Name LIKE ? OR stf_desig LIKE ? OR stf_office LIKE ?
             ORDER BY stf_Name ASC LIMIT $limit OFFSET $offset",
            'sss',
            [$like, $like, $like]
        );
        foreach ($items as &$item) {
            $item['photo'] = $item['stf_Photo'] !== '' ? public_file('staff', (string) $item['stf_Photo']) : '';
        }
        unset($item);
    } elseif ($kind === 'scholarships') {
        $items = rows(
            "SELECT * FROM cp_foreignschols WHERE fs_name LIKE ? OR fs_country LIKE ? ORDER BY fs_closingdate DESC LIMIT $limit OFFSET $offset",
            'ss',
            [$like, $like]
        );
        foreach ($items as &$item) {
            $item['url'] = $item['fs_file'] !== '' ? public_file('foriegnschols', (string) $item['fs_file']) : '';
        }
        unset($item);
    } elseif ($kind === 'external') {
        $items = rows(
            "SELECT * FROM cp_outsidetrcource WHERE ot_training LIKE ? OR ot_institute LIKE ? ORDER BY ot_closingdate DESC LIMIT $limit OFFSET $offset",
            'ss',
            [$like, $like]
        );
        foreach ($items as &$item) {
            $item['url'] = $item['ot_file'] !== '' ? public_file('outsidetrainings', (string) $item['ot_file']) : '';
        }
        unset($item);
    } else {
        json_out(['ok' => false, 'error' => 'Unknown public list.'], 404);
    }

    json_out([
        'ok' => true,
        'items' => $items,
        'page' => $page,
        'categories' => DOWNLOAD_TYPES,
    ]);
}

function action_comment(): void
{
    csrf_check();
    $data = body();
    $name = trim((string) ($data['name'] ?? ''));
    $office = trim((string) ($data['office'] ?? ''));
    $phone = trim((string) ($data['phone'] ?? ''));
    $email = trim((string) ($data['email'] ?? ''));
    $comment = trim((string) ($data['comment'] ?? ''));
    if ($name === '' || $comment === '') {
        json_out(['ok' => false, 'error' => 'Name and suggestion are required.'], 422);
    }
    if ($email !== '' && !filter_var($email, FILTER_VALIDATE_EMAIL)) {
        json_out(['ok' => false, 'error' => 'Enter a valid email address.'], 422);
    }
    $date = date('Y-m-d');
    $time = date('H:i:s');
    $stmt = db()->prepare('INSERT INTO cp_usercomments (uc_name, uc_office, uc_tele, uc_email, uc_comment, uc_date, uc_time) VALUES (?, ?, ?, ?, ?, ?, ?)');
    $stmt->bind_param('sssssss', $name, $office, $phone, $email, $comment, $date, $time);
    if (!$stmt->execute()) {
        json_out(['ok' => false, 'error' => 'The suggestion could not be saved.'], 500);
    }
    json_out(['ok' => true]);
}

function action_catalog(): void
{
    $user = require_user();
    $items = [
        ['id' => 'dashboard', 'label' => 'Dashboard', 'group' => 'Overview', 'kind' => 'dashboard'],
        ['id' => 'birthdays', 'label' => 'Birthdays today', 'group' => 'People', 'kind' => 'birthdays'],
        ['id' => 'attended', 'label' => 'Register of officers who attended training', 'group' => 'Reports', 'kind' => 'attended'],
    ];
    if (is_super($user)) {
        $items[] = ['id' => 'plan', 'label' => 'Build training plan', 'group' => 'Plan', 'kind' => 'plan'];
        $items[] = ['id' => 'applications', 'label' => 'Applications', 'group' => 'Delivery', 'kind' => 'applications'];
        $items[] = ['id' => 'attendance', 'label' => 'Selected officers', 'group' => 'Delivery', 'kind' => 'attendance'];
        $items[] = ['id' => 'scheduled', 'label' => 'Programmes due to be held', 'group' => 'Delivery', 'kind' => 'scheduled'];
        $items[] = ['id' => 'finish', 'label' => 'Finish a programme step 1', 'group' => 'Delivery', 'kind' => 'finish'];
        $items[] = ['id' => 'finish2', 'label' => 'Finish a programme step 2', 'group' => 'Delivery', 'kind' => 'finish2'];
        $items[] = ['id' => 'advance', 'label' => 'Advance details', 'group' => 'Delivery', 'kind' => 'advance'];
        $items[] = ['id' => 'provision', 'label' => 'Allocations', 'group' => 'Plan', 'kind' => 'provision'];
    }
    if ($user['role'] === 'User' || is_super($user)) {
        $items[] = ['id' => 'apply', 'label' => 'Apply for a programme', 'group' => 'Delivery', 'kind' => 'apply'];
    }
    if ($user['role'] === 'User' || is_admin($user)) {
        $items[] = ['id' => 'needs', 'label' => 'Submit a training need', 'group' => 'Plan', 'kind' => 'needs'];
        $items[] = ['id' => 'private', 'label' => 'Private course application', 'group' => 'Delivery', 'kind' => 'private'];
    }
    if (is_super($user) || $user['role'] === 'User') {
        $items[] = ['id' => 'letter', 'label' => 'Call letter', 'group' => 'Documents', 'kind' => 'letter'];
        if (is_admin($user)) {
            $items[] = ['id' => 'signatory', 'label' => 'Deputy Chief Secretary', 'group' => 'Documents', 'kind' => 'signatory'];
        }
        $items[] = ['id' => 'signsheet', 'label' => 'Sign sheet', 'group' => 'Documents', 'kind' => 'signsheet'];
        if (is_super($user)) {
            $items[] = ['id' => 'panelsign', 'label' => 'Staff and resource-person sign sheet', 'group' => 'Documents', 'kind' => 'panelsign'];
        }
    }
    if (is_super($user)) {
        $items[] = ['id' => 'estimate', 'label' => 'Cost estimate', 'group' => 'Documents', 'kind' => 'estimate'];
        $items[] = ['id' => 'revise', 'label' => 'Revised estimate', 'group' => 'Documents', 'kind' => 'revise'];
        $items[] = ['id' => 'offweb', 'label' => 'Training outside the website', 'group' => 'Delivery', 'kind' => 'offweb'];
        $items[] = ['id' => 'modular', 'label' => 'Modular setup', 'group' => 'Delivery', 'kind' => 'modular'];
        $items[] = ['id' => 'evaluation', 'label' => 'Pre and post evaluation', 'group' => 'Delivery', 'kind' => 'evaluation'];
        $items[] = ['id' => 'messages', 'label' => 'Messages', 'group' => 'Delivery', 'kind' => 'messages'];
        if (is_admin($user)) {
            $items[] = ['id' => 'total', 'label' => 'Total', 'group' => 'Delivery', 'kind' => 'total'];
        }
        $items[] = ['id' => 'pace', 'label' => 'Monthly and annual progress', 'group' => 'Reports', 'kind' => 'pace'];
        $items[] = ['id' => 'person', 'label' => 'One-person report', 'group' => 'Reports', 'kind' => 'person'];
        $items[] = ['id' => 'settle', 'label' => 'Estimate, food bill and allowances', 'group' => 'Reports', 'kind' => 'settle'];
        $items[] = ['id' => 'ahead', 'label' => 'Progress tabs', 'group' => 'Reports', 'kind' => 'ahead'];
    }
    if (is_admin($user) || is_super($user)) {
        $items[] = ['id' => 'reports', 'label' => 'Reports', 'group' => 'Reports', 'kind' => 'reports'];
    } elseif ($user['role'] === 'User') {
        $items[] = ['id' => 'reports', 'label' => 'Office reports', 'group' => 'Reports', 'kind' => 'reports'];
    }
    foreach (table_registry() as $table => $meta) {
        if (!in_array($user['role'], $meta['roles'], true)) {
            continue;
        }
        $items[] = [
            'id' => $table,
            'label' => $meta['label'],
            'group' => $meta['group'],
            'kind' => 'table',
            'table' => $table,
        ];
    }
    json_out(['ok' => true, 'items' => $items]);
}

function action_schema(): void
{
    $user = require_user();
    $table = (string) ($_GET['table'] ?? '');
    if (!can_access($user, $table, 'read')) {
        json_out(['ok' => false, 'error' => 'You cannot open this record type.'], 403);
    }
    $meta = table_meta($table);
    $desc = describe_table($table);
    $fields = [];
    foreach ($desc['columns'] as $column) {
        $name = $column['Field'];
        $fields[] = [
            'name' => $name,
            'label' => field_label($name),
            'type' => $column['Type'],
            'key' => $column['Key'],
            'nullable' => $column['Null'] === 'YES',
            'hidden' => in_array($name, $meta['hidden'] ?? [], true),
            'auto' => str_contains((string) $column['Extra'], 'auto_increment'),
            'file' => $meta['files'][$name] ?? null,
        ];
    }
    json_out([
        'ok' => true,
        'table' => $table,
        'label' => $meta['label'],
        'primary' => $desc['primary'],
        'writable' => can_change($user, $table),
        'fields' => $fields,
    ]);
}

function action_list(): void
{
    $user = require_user();
    $table = (string) ($_GET['table'] ?? '');
    if (!can_access($user, $table, 'read')) {
        json_out(['ok' => false, 'error' => 'You cannot open this record type.'], 403);
    }
    $meta = table_meta($table);
    $desc = describe_table($table);
    $q = trim((string) ($_GET['q'] ?? ''));
    $page = max(1, (int) ($_GET['page'] ?? 1));
    $wide = ['cp_desigs', 'offices', 'cp_login', 'cp_trainings', 'cp_trfields', 'cp_services', 'cp_trcenters', 'cp_funds', 'cp_food', 'cp_slideshowimgs', 'cp_messeges', 'cp_downloads', 'cp_usercomments', 'cp_foreignschols', 'cp_outsidetrcource', 'cp_appliedforiegnscholars', 'cp_foriegnscholars', 'cp_treqperiod', 'cp_trrequirements', 'cp_resourcepersons', 'cp_atp', 'trdate', 'cp_privatetrainings', 'cp_othertrainings', 'cp_trainingapplications', 'cp_trainingofficers', 'cp_completedtrainings'];
    $cap = $table === 'cp_staff' ? 50000 : (in_array($table, $wide, true) ? 1000 : 100);
    $limit = min($cap, max(10, (int) ($_GET['limit'] ?? 25)));
    $offset = ($page - 1) * $limit;
    $safe = '`' . str_replace('`', '', $table) . '`';

    $where = ' WHERE 1=1 ';
    $types = '';
    $params = [];
    [$officeSql, $officeType, $officeValue] = office_clause($user, $meta);
    $where .= $officeSql;
    if ($officeType !== '') {
        $types .= $officeType;
        $params[] = $officeValue;
    }
    if ($q !== '') {
        $parts = [];
        foreach ($desc['columns'] as $column) {
            $type = strtolower($column['Type']);
            if (str_contains($type, 'text') || str_contains($type, 'char') || str_contains($type, 'date')) {
                $parts[] = '`' . $column['Field'] . '` LIKE ?';
                $types .= 's';
                $params[] = '%' . $q . '%';
            }
        }
        if ($parts) {
            $where .= ' AND (' . implode(' OR ', $parts) . ')';
        }
    }

    $countSql = "SELECT COUNT(*) AS n FROM $safe $where";
    $countStmt = db()->prepare($countSql);
    if ($types !== '') {
        $countStmt->bind_param($types, ...$params);
    }
    $countStmt->execute();
    $total = (int) ($countStmt->get_result()->fetch_assoc()['n'] ?? 0);

    $nameOrder = ['cp_desigs' => 'des_name', 'offices' => 'of_name', 'cp_login' => 'lg_office'];
    $order = isset($nameOrder[$table]) ? '`' . $nameOrder[$table] . '` ASC' : ('`' . $desc['primary'] . '` DESC');
    $sql = "SELECT * FROM $safe $where ORDER BY $order LIMIT $limit OFFSET $offset";
    $stmt = db()->prepare($sql);
    if ($types !== '') {
        $stmt->bind_param($types, ...$params);
    }
    $stmt->execute();
    $result = $stmt->get_result();
    $items = [];
    $hidden = $meta['hidden'] ?? [];
    while ($row = $result->fetch_assoc()) {
        foreach ($hidden as $column) {
            if (array_key_exists($column, $row)) {
                $row[$column] = '';
            }
        }
        foreach ($meta['files'] ?? [] as $column => $folder) {
            if (!empty($row[$column])) {
                $row[$column . '_url'] = public_file($folder, (string) $row[$column]);
            }
        }
        $items[] = $row;
    }
    if ($table === 'cp_staff') {
        $blocked = [];
        foreach (rows('SELECT bl_nid FROM cp_blacklist WHERE bl_until >= ?', 's', [date('Y-m-d')]) as $mark) {
            $blocked[(string) $mark['bl_nid']] = true;
        }
        foreach ($items as &$item) {
            $item['on_blacklist'] = isset($blocked[(string) ($item['stf_Nid'] ?? '')]) ? 'Yes' : '';
        }
        unset($item);
    }
    json_out(['ok' => true, 'items' => $items, 'total' => $total, 'page' => $page, 'limit' => $limit]);
}

function bind_and_run(mysqli_stmt $stmt, string $types, array $params): bool
{
    if ($types !== '') {
        $refs = [];
        foreach ($params as $key => $value) {
            $refs[$key] = $value;
        }
        $bind = [$types];
        foreach ($refs as $key => &$value) {
            $bind[] = &$value;
        }
        unset($value);
        call_user_func_array([$stmt, 'bind_param'], $bind);
    }
    return $stmt->execute();
}

function action_save(): void
{
    csrf_check();
    $user = require_user();
    $data = body();
    $table = (string) ($data['table'] ?? '');
    $record = $data['data'] ?? null;
    if (!is_array($record) || !can_access($user, $table, 'write')) {
        json_out(['ok' => false, 'error' => 'You cannot save this record.'], 403);
    }
    $meta = table_meta($table);
    $desc = describe_table($table);
    $primary = $desc['primary'];
    $allowed = [];
    foreach ($desc['columns'] as $column) {
        $allowed[$column['Field']] = $column;
    }
    $id = trim((string) ($record[$primary] ?? ''));
    $isInsert = $id === '' || $id === '0';
    if (!$isInsert && !can_change($user, $table)) {
        json_out(['ok' => false, 'error' => 'මෙය වෙනස් කරන්න පුළුවන් පරිපාලකට පමණයි.'], 403);
    }

    if ($user['role'] === 'User' && !empty($meta['office'])) {
        $record[$meta['office']] = $user['office'];
    }
    if ($table === 'cp_trrequirements' && $isInsert && $user['role'] === 'User') {
        $today = date('Y-m-d');
        $cutoff = rows('SELECT trd_date FROM trdate WHERE trd_id = 1 LIMIT 1');
        if ($cutoff && !blank_date((string) $cutoff[0]['trd_date']) && $today > $cutoff[0]['trd_date']) {
            json_out(['ok' => false, 'error' => 'The training-needs deadline has passed.'], 422);
        }
        $period = rows('SELECT trq_sdate, trq_edate FROM cp_treqperiod ORDER BY trq_id DESC LIMIT 1');
        if ($period && ($today < $period[0]['trq_sdate'] || $today > $period[0]['trq_edate'])) {
            json_out(['ok' => false, 'error' => 'Training needs can be submitted only during the open collection period.'], 422);
        }
        $record['req_adddate'] = $today;
        if (trim((string) ($record['req_isadd'] ?? '')) === '') {
            $record['req_isadd'] = NO_SI;
        }
    }
    if ($table === 'cp_trrequirements' && $isInsert) {
        if (trim((string) ($record['req_adddate'] ?? '')) === '') {
            $record['req_adddate'] = date('Y-m-d');
        }
        if (trim((string) ($record['req_isadd'] ?? '')) === '') {
            $record['req_isadd'] = NO_SI;
        }
    }
    if ($table === 'cp_login' && $isInsert === false && trim((string) ($record['lg_pwd'] ?? '')) === '') {
        unset($record['lg_pwd']);
    }
    if ($table === 'cp_trainingapplications' && $isInsert && officer_is_blacklisted(trim((string) ($record['tapp_officerNid'] ?? '')))) {
        json_out(['ok' => false, 'error' => blacklist_apply_error(trim((string) ($record['tapp_officerNid'] ?? '')))], 422);
    }
    if ($table === 'cp_trainingofficers' && $isInsert) {
        $nid = trim((string) ($record['tro_nid'] ?? ''));
        if ($nid === '') {
            json_out(['ok' => false, 'error' => 'ජාතික හැඳුනුම්පත් අංකය දෙන්න.'], 422);
        }
        $exists = rows('SELECT tro_id FROM cp_trainingofficers WHERE tro_nid = ? LIMIT 1', 's', [$nid]);
        if ($exists) {
            json_out(['ok' => false, 'error' => 'මෙම නිලධාරියා දැනටමත් පුහුණු නිලධාරියෙකි.'], 422);
        }
        $staff = rows('SELECT stf_Name, stf_desig, stf_office, stf_mobile, stf_email FROM cp_staff WHERE stf_Nid = ? LIMIT 1', 's', [$nid]);
        if (!$staff) {
            json_out(['ok' => false, 'error' => 'මෙම හැඳුනුම්පත් අංකය කාර්යමණ්ඩල ලේඛනයේ නැත.'], 422);
        }
        $record['tro_nid'] = $nid;
        $record['tro_name'] = (string) $staff[0]['stf_Name'];
        $record['tro_desig'] = (string) $staff[0]['stf_desig'];
        $record['tro_mobile'] = (string) $staff[0]['stf_mobile'];
        $record['tro_email'] = (string) $staff[0]['stf_email'];
        if ($user['role'] !== 'User') {
            $record['tro_office'] = (string) $staff[0]['stf_office'];
        }
    }
    if ($table === 'cp_resourcepersons') {
        if ($isInsert && trim((string) ($record['rp_code'] ?? '')) === '') {
            $record['rp_code'] = (string) random_int(100000, 999999);
        }
        if (!$isInsert) {
            foreach (['rp_cv', 'rp_certificate', 'rp_code'] as $keep) {
                if (trim((string) ($record[$keep] ?? '')) === '') {
                    unset($record[$keep]);
                }
            }
        }
    }

    $fields = [];
    $types = '';
    $params = [];
    foreach ($record as $name => $value) {
        if (!isset($allowed[$name]) || $name === $primary) {
            continue;
        }
        if (in_array($name, $meta['hidden'] ?? [], true) && trim((string) $value) === '' && !$isInsert) {
            continue;
        }
        $fields[] = $name;
        $types .= str_contains(strtolower($allowed[$name]['Type']), 'int') || str_contains(strtolower($allowed[$name]['Type']), 'double')
            ? (str_contains(strtolower($allowed[$name]['Type']), 'double') || str_contains(strtolower($allowed[$name]['Type']), 'decimal') ? 'd' : 'i')
            : 's';
        if ($types[-1] === 'i') {
            $params[] = (int) $value;
        } elseif ($types[-1] === 'd') {
            $params[] = (float) $value;
        } else {
            $params[] = (string) $value;
        }
    }
    if (!$fields) {
        json_out(['ok' => false, 'error' => 'Nothing to save.'], 422);
    }

    $safe = '`' . str_replace('`', '', $table) . '`';
    if ($isInsert) {
        $cols = implode(',', array_map(static fn($f) => '`' . $f . '`', $fields));
        $marks = implode(',', array_fill(0, count($fields), '?'));
        $stmt = db()->prepare("INSERT INTO $safe ($cols) VALUES ($marks)");
        if (!bind_and_run($stmt, $types, $params)) {
            json_out(['ok' => false, 'error' => 'The record could not be saved.'], 500);
        }
        $newId = (int) db()->insert_id;
        if ($table === 'cp_atp') {
            announce_programme($newId);
        }
        json_out(['ok' => true, 'id' => $newId]);
    }

    $sets = implode(',', array_map(static fn($f) => '`' . $f . '` = ?', $fields));
    $sql = "UPDATE $safe SET $sets WHERE `$primary` = ?";
    $types .= str_contains(strtolower($allowed[$primary]['Type']), 'int') ? 'i' : 's';
    $params[] = str_contains(strtolower($allowed[$primary]['Type']), 'int') ? (int) $id : $id;
    [$officeSql, $officeType, $officeValue] = office_clause($user, $meta);
    if ($officeType !== '') {
        $sql .= ' AND `' . $meta['office'] . '` = ?';
        $types .= $officeType;
        $params[] = $officeValue;
    }
    $beforePlan = null;
    if ($table === 'cp_atp') {
        $foundPlan = rows('SELECT * FROM cp_atp WHERE atp_id = ? LIMIT 1', 'i', [(int) $id]);
        $beforePlan = $foundPlan[0] ?? null;
    }
    $stmt = db()->prepare($sql);
    if (!bind_and_run($stmt, $types, $params) || $stmt->affected_rows < 0) {
        json_out(['ok' => false, 'error' => 'The record could not be updated.'], 500);
    }
    if ($beforePlan) {
        follow_programme_dates((int) $id, $beforePlan, $record);
    }
    if ($table === 'cp_atp') {
        announce_programme((int) $id);
    }
    json_out(['ok' => true, 'id' => $id]);
}

function plain_date(string $value): string
{
    $value = substr($value, 0, 10);
    if (blank_date($value)) {
        return '';
    }
    $parsed = DateTime::createFromFormat('Y-m-d', $value);
    return $parsed ? $parsed->format('Y-m-d') : '';
}

function shift_date(string $date, int $days): string
{
    $parsed = DateTime::createFromFormat('Y-m-d', $date);
    if (!$parsed || $days === 0) {
        return $date;
    }
    $parsed->modify(($days > 0 ? '+' : '') . $days . ' day');
    return $parsed->format('Y-m-d');
}

function follow_programme_dates(int $id, array $before, array $submitted): void
{
    $oldStart = plain_date((string) ($before['atp_day1'] ?? ''));
    $sentStart = array_key_exists('atp_day1', $submitted) ? plain_date((string) $submitted['atp_day1']) : $oldStart;
    $delta = 0;
    if ($oldStart !== '' && $sentStart !== '' && $oldStart !== $sentStart) {
        $from = DateTime::createFromFormat('Y-m-d', $oldStart);
        $to = DateTime::createFromFormat('Y-m-d', $sentStart);
        if ($from && $to) {
            $delta = (int) $from->diff($to)->format('%r%a');
        }
    }
    $moved = [];
    if ($delta !== 0) {
        for ($day = 2; $day <= 10; $day++) {
            $key = 'atp_day' . $day;
            $old = plain_date((string) ($before[$key] ?? ''));
            $sent = array_key_exists($key, $submitted) ? plain_date((string) $submitted[$key]) : $old;
            if ($old !== '' && $sent === $old) {
                $moved[$key] = shift_date($old, $delta);
            }
        }
        $oldClose = plain_date((string) ($before['atp_lastdateapply'] ?? ''));
        $sentClose = array_key_exists('atp_lastdateapply', $submitted) ? plain_date((string) $submitted['atp_lastdateapply']) : $oldClose;
        if ($oldClose !== '' && $sentClose === $oldClose) {
            $moved['atp_lastdateapply'] = shift_date($oldClose, $delta);
        }
    }
    if ($moved) {
        $sets = [];
        $params = [];
        foreach ($moved as $column => $value) {
            $sets[] = '`' . $column . '` = ?';
            $params[] = $value;
        }
        $params[] = $id;
        $stmt = db()->prepare('UPDATE cp_atp SET ' . implode(',', $sets) . ' WHERE atp_id = ?');
        bind_and_run($stmt, str_repeat('s', count($params) - 1) . 'i', $params);
    }
    $saved = rows('SELECT atp_trname, atp_fileno, atp_day1 FROM cp_atp WHERE atp_id = ? LIMIT 1', 'i', [$id]);
    if (!$saved) {
        return;
    }
    $name = (string) $saved[0]['atp_trname'];
    $start = plain_date((string) $saved[0]['atp_day1']);
    $file = (string) $saved[0]['atp_fileno'];
    $key = (string) $id;
    if ($name !== '') {
        $stmt = db()->prepare('UPDATE cp_trainingapplications SET tapp_trname = ? WHERE tapp_atpid = ?');
        $stmt->bind_param('ss', $name, $key);
        $stmt->execute();
        $stmt = db()->prepare('UPDATE cp_trainingattendance SET tratt_atpname = ?, tratt_atpfileno = ? WHERE tratt_atpid = ?');
        $stmt->bind_param('sss', $name, $file, $key);
        $stmt->execute();
    }
    if ($start !== '') {
        $stmt = db()->prepare('UPDATE cp_trainingapplications SET tapp_trstartdate = ? WHERE tapp_atpid = ?');
        $stmt->bind_param('ss', $start, $key);
        $stmt->execute();
        $stmt = db()->prepare('UPDATE cp_trainingattendance SET tratt_startdate = ? WHERE tratt_atpid = ?');
        $stmt->bind_param('ss', $start, $key);
        $stmt->execute();
    }
}

function announce_programme(int $id): void
{
    $found = rows('SELECT atp_trname, atp_lastdateapply FROM cp_atp WHERE atp_id = ? LIMIT 1', 'i', [$id]);
    if (!$found) {
        return;
    }
    $name = trim((string) $found[0]['atp_trname']);
    $close = plain_date((string) $found[0]['atp_lastdateapply']);
    if ($name === '' || $close === '') {
        return;
    }
    $message = 'අයදුම් කළ හැකි පුහුණු වැඩසටහන: ' . $name . '. අයදුම් අවසන් දිනය ' . $close . '.';
    $existing = rows('SELECT msg_id FROM cp_messeges WHERE msg_message = ? LIMIT 1', 's', [$message]);
    if ($existing) {
        return;
    }
    $today = date('Y-m-d');
    $status = YES_SI;
    $stmt = db()->prepare('INSERT INTO cp_messeges (msg_date, msg_message, msg_status) VALUES (?, ?, ?)');
    if ($stmt) {
        $stmt->bind_param('sss', $today, $message, $status);
        $stmt->execute();
    }
}

function action_delete(): void
{
    csrf_check();
    $user = require_user();
    $data = body();
    $table = (string) ($data['table'] ?? '');
    $id = (string) ($data['id'] ?? '');
    if ($id === '' || !can_access($user, $table, 'write')) {
        json_out(['ok' => false, 'error' => 'You cannot delete this record.'], 403);
    }
    if (!can_change($user, $table)) {
        json_out(['ok' => false, 'error' => 'මෙය මකන්න පුළුවන් පරිපාලකට පමණයි.'], 403);
    }
    if ($table === 'cp_atp') {
        $plan = rows('SELECT atp_trname FROM cp_atp WHERE atp_id = ? LIMIT 1', 'i', [(int) $id]);
        if ($plan && trim((string) $plan[0]['atp_trname']) !== '') {
            json_out(['ok' => false, 'error' => 'නමක් ඇති පුහුණු වැඩසටහනක් මකන්න බැහැ. ඒක සියලුම පරිශීලකයන්ට පෙනෙන්න ඕන. හිස් නමක් ඇති ඒවා පමණක් ඉවත් කළ හැක.'], 422);
        }
    }
    $meta = table_meta($table);
    $desc = describe_table($table);
    $primary = $desc['primary'];
    $safe = '`' . str_replace('`', '', $table) . '`';
    $sql = "DELETE FROM $safe WHERE `$primary` = ?";
    $types = 's';
    $params = [$id];
    [$officeSql, $officeType, $officeValue] = office_clause($user, $meta);
    if ($officeType !== '') {
        $sql .= ' AND `' . $meta['office'] . '` = ?';
        $types .= $officeType;
        $params[] = $officeValue;
    }
    $stmt = db()->prepare($sql);
    if (!bind_and_run($stmt, $types, $params)) {
        json_out(['ok' => false, 'error' => 'The record could not be deleted.'], 500);
    }
    json_out(['ok' => true]);
}

function upload_ext(array $file, array $extensions, int $maxBytes): string
{
    $tmp = (string) ($file['tmp_name'] ?? '');
    if ($tmp === '' || !is_uploaded_file($tmp)) {
        json_out(['ok' => false, 'error' => 'Choose a file to upload.'], 422);
    }
    $original = (string) ($file['name'] ?? '');
    if ($original === '' || str_contains($original, "\0") || str_contains($original, '..') || str_contains($original, '/') || str_contains($original, '\\')) {
        json_out(['ok' => false, 'error' => 'That file is not allowed.'], 422);
    }
    if (preg_match('/\.(php\d?|phtml|phar|exe|dll|js|mjs|html?|svg|htaccess|asp|aspx|cgi|sh|bat|cmd)(\.|$)/i', $original)) {
        json_out(['ok' => false, 'error' => 'That file is not allowed.'], 422);
    }
    $ext = strtolower((string) pathinfo($original, PATHINFO_EXTENSION));
    if (!in_array($ext, $extensions, true)) {
        json_out(['ok' => false, 'error' => 'That file type is not allowed.'], 422);
    }
    $size = (int) ($file['size'] ?? 0);
    if ($size <= 0 || $size > $maxBytes) {
        json_out(['ok' => false, 'error' => 'The file is empty or too large.'], 422);
    }
    $mime = '';
    if (function_exists('finfo_open')) {
        $info = finfo_open(FILEINFO_MIME_TYPE);
        if ($info) {
            $mime = (string) finfo_file($info, $tmp);
            finfo_close($info);
        }
    }
    $known = [
        'jpg' => ['image/jpeg'],
        'jpeg' => ['image/jpeg'],
        'png' => ['image/png'],
        'gif' => ['image/gif'],
        'webp' => ['image/webp'],
        'pdf' => ['application/pdf'],
        'doc' => ['application/msword', 'application/octet-stream'],
        'docx' => ['application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/zip', 'application/octet-stream'],
        'xls' => ['application/vnd.ms-excel', 'application/octet-stream'],
        'xlsx' => ['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'application/zip', 'application/octet-stream'],
    ];
    if ($mime !== '' && isset($known[$ext]) && !in_array($mime, $known[$ext], true)) {
        json_out(['ok' => false, 'error' => 'That file type is not allowed.'], 422);
    }
    return $ext;
}

function action_upload(): void
{
    csrf_check();
    $user = require_user();
    $folder = (string) ($_POST['folder'] ?? '');
    $allowed = [
        'slideshow' => ['jpg', 'jpeg', 'png', 'gif', 'webp'],
        'staff' => ['jpg', 'jpeg', 'png', 'gif', 'webp'],
        'sign' => ['jpg', 'jpeg', 'png', 'gif', 'webp'],
        'uploads' => ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'jpg', 'jpeg', 'png', 'gif', 'webp'],
        'modules' => ['pdf', 'doc', 'docx'],
        'foriegnschols' => ['pdf', 'doc', 'docx', 'jpg', 'jpeg', 'png'],
        'outsidetrainings' => ['pdf', 'doc', 'docx', 'jpg', 'jpeg', 'png'],
        'resource' => ['pdf', 'jpg', 'jpeg', 'png', 'gif', 'webp'],
    ];
    $roleFolders = [
        'Administrator' => array_keys($allowed),
        'Super User' => ['outsidetrainings', 'uploads', 'resource', 'sign', 'modules', 'staff', 'foriegnschols'],
        'User' => ['staff'],
    ];
    if (!isset($allowed[$folder]) || !in_array($folder, $roleFolders[$user['role']] ?? [], true)) {
        json_out(['ok' => false, 'error' => 'You cannot upload to that folder.'], 403);
    }
    $ext = upload_ext($_FILES['file'] ?? [], $allowed[$folder], 12 * 1024 * 1024);
    $dir = __DIR__ . '/' . $folder;
    if (!is_dir($dir) && !mkdir($dir, 0755, true) && !is_dir($dir)) {
        json_out(['ok' => false, 'error' => 'The upload folder is not available.'], 500);
    }
    $stored = time() . '_' . bin2hex(random_bytes(4)) . '.' . $ext;
    if (!move_uploaded_file($_FILES['file']['tmp_name'], $dir . '/' . $stored)) {
        json_out(['ok' => false, 'error' => 'The file could not be stored.'], 500);
    }
    json_out(['ok' => true, 'name' => $stored, 'url' => $folder . '/' . $stored]);
}

function action_dashboard(): void
{
    $user = require_user();
    $officeSql = '';
    $types = '';
    $params = [];
    if ($user['role'] === 'User') {
        $officeSql = ' WHERE stf_office = ?';
        $types = 's';
        $params = [$user['office']];
    }
    $staff = rows('SELECT COUNT(*) AS n FROM cp_staff' . $officeSql, $types, $params);
    $open = rows(
        "SELECT COUNT(*) AS n FROM cp_atp WHERE atp_lastdateapply >= CURDATE() AND atp_addhome = ?",
        's',
        [YES_SI]
    );
    $needsSql = 'SELECT COUNT(*) AS n FROM cp_trrequirements';
    $needTypes = '';
    $needParams = [];
    if ($user['role'] === 'User') {
        $needsSql .= ' WHERE req_addoffice = ?';
        $needTypes = 's';
        $needParams = [$user['office']];
    }
    $appsSql = 'SELECT COUNT(*) AS n FROM cp_trainingapplications';
    $appTypes = '';
    $appParams = [];
    if ($user['role'] === 'User') {
        $appsSql .= ' WHERE tapp_office = ?';
        $appTypes = 's';
        $appParams = [$user['office']];
    }
    json_out([
        'ok' => true,
        'staff' => (int) ($staff[0]['n'] ?? 0),
        'open' => (int) ($open[0]['n'] ?? 0),
        'needs' => (int) (rows($needsSql, $needTypes, $needParams)[0]['n'] ?? 0),
        'applications' => (int) (rows($appsSql, $appTypes, $appParams)[0]['n'] ?? 0),
        'completed' => (int) (rows('SELECT COUNT(*) AS n FROM cp_completedtrainings')[0]['n'] ?? 0),
        'birthdays' => rows(
            "SELECT stf_Name, stf_desig, stf_office FROM cp_staff
             WHERE MONTH(stf_dob) = ? AND DAY(stf_dob) = ?
               AND stf_dob NOT LIKE '0000%'
             ORDER BY stf_Name LIMIT 12",
            'ii',
            [(int) date('n'), (int) date('j')]
        ),
    ]);
}

function action_options(): void
{
    require_user();
    json_out([
        'ok' => true,
        'offices' => array_values(array_filter(
            rows('SELECT of_id, of_name FROM offices ORDER BY of_name ASC'),
            static fn(array $row): bool => trim((string) $row['of_name']) !== ''
        )),
        'designations' => rows('SELECT des_id, des_name FROM cp_desigs ORDER BY des_name ASC'),
        'programmes' => rows('SELECT tr_id, tr_name FROM cp_trainings ORDER BY tr_name ASC'),
        'fields' => rows('SELECT tf_id, tf_name FROM cp_trfields ORDER BY tf_name ASC'),
        'centres' => rows('SELECT trc_id, trc_name FROM cp_trcenters ORDER BY trc_name ASC'),
        'funds' => rows('SELECT fnd_id, fnd_name FROM cp_funds ORDER BY fnd_name ASC'),
        'services' => rows('SELECT ser_id, ser_name FROM cp_services ORDER BY ser_name ASC'),
        'yesno' => [['value' => YES_SI, 'label' => 'Yes'], ['value' => NO_SI, 'label' => 'No']],
        'roles' => ['Administrator', 'Super User', 'User'],
        'types' => [
            ['value' => TYPE_MDTU, 'label' => 'MDTU programme'],
            ['value' => TYPE_PRODUCTIVITY, 'label' => 'Productivity programme'],
            ['value' => 'විශේෂ පුහුණු', 'label' => 'Special training'],
            ['value' => 'දෙපාර්තමේන්තු පුහුණු', 'label' => 'Departmental training'],
            ['value' => 'භාෂා පුහුණු', 'label' => 'Language training'],
            ['value' => 'OBT', 'label' => 'OBT'],
            ['value' => 'උපදේශණය හා මත්ද්‍රවය නිවාරණ', 'label' => 'Counselling and drug prevention'],
            ['value' => 'රැස්වීම්', 'label' => 'Meetings'],
            ['value' => 'උපදේශන කමිටුව', 'label' => 'Advisory committee'],
            ['value' => 'ප්‍රගති සමාලෝචන', 'label' => 'Progress review'],
            ['value' => 'වෙනත්', 'label' => 'Other'],
        ],
        'downloadTypes' => DOWNLOAD_TYPES,
        'blacklist' => [['value' => '', 'label' => 'No'], ['value' => 'Yes', 'label' => 'Yes']],
    ]);
}

function action_apply(): void
{
    csrf_check();
    $user = require_user();
    if ($user['role'] !== 'User' && !is_super($user)) {
        json_out(['ok' => false, 'error' => 'Your role cannot submit applications.'], 403);
    }
    $data = body();
    $nid = trim((string) ($data['nid'] ?? ''));
    $atpId = (int) ($data['atp_id'] ?? 0);
    if ($nid === '' || $atpId <= 0) {
        json_out(['ok' => false, 'error' => 'Choose an officer and a programme.'], 422);
    }
    $staff = rows('SELECT stf_Nid, stf_office, stf_blacklisted FROM cp_staff WHERE stf_Nid = ? LIMIT 1', 's', [$nid]);
    if (!$staff) {
        json_out(['ok' => false, 'error' => 'That national ID is not in the staff register.'], 422);
    }
    if ($user['role'] === 'User' && $staff[0]['stf_office'] !== $user['office']) {
        json_out(['ok' => false, 'error' => 'You can apply only for officers in your office.'], 403);
    }
    if (officer_is_blacklisted($nid)) {
        json_out(['ok' => false, 'error' => blacklist_apply_error($nid)], 422);
    }
    $plan = rows('SELECT * FROM cp_atp WHERE atp_id = ? LIMIT 1', 'i', [$atpId]);
    if (!$plan) {
        json_out(['ok' => false, 'error' => 'That programme was not found.'], 404);
    }
    $end = '';
    foreach (programme_days($plan[0], 'atp_day') as $day) {
        if ($end === '' || $day > $end) {
            $end = $day;
        }
    }
    if ($end !== '' && $end < date('Y-m-d')) {
        json_out(['ok' => false, 'error' => 'That programme has ended.'], 422);
    }
    if (in_array((string) ($plan[0]['atp_offweb'] ?? ''), [YES_SI, 'Yes', 'yes'], true)) {
        json_out(['ok' => false, 'error' => 'මෙම වැඩසටහනට අයදුම් කරන්න බැහැ.'], 422);
    }
    $deadline = substr((string) $plan[0]['atp_lastdateapply'], 0, 10);
    if (blank_date($deadline) || $deadline < date('Y-m-d')) {
        json_out(['ok' => false, 'error' => 'The application deadline has passed.'], 422);
    }
    $existing = rows('SELECT tapp_id FROM cp_trainingapplications WHERE tapp_officerNid = ? AND tapp_atpid = ? LIMIT 1', 'ss', [$nid, (string) $atpId]);
    if ($existing) {
        json_out(['ok' => false, 'error' => 'This officer is already nominated for that programme.'], 422);
    }
    $office = (string) $staff[0]['stf_office'];
    $name = (string) $plan[0]['atp_trname'];
    $start = (string) $plan[0]['atp_day1'];
    $applied = date('Y-m-d');
    $relevant = (string) ($data['relevant'] ?? YES_SI);
    $priority = (int) ($data['priority'] ?? 1);
    if ($priority < 1 || $priority > 50) {
        json_out(['ok' => false, 'error' => 'Choose a priority from 1 to 50.'], 422);
    }
    $stay = (string) ($data['accommodation'] ?? NO_SI);
    $diet = (string) ($data['diet'] ?? '');
    $selected = NO_SI;
    $atpKey = (string) $atpId;
    $stmt = db()->prepare('INSERT INTO cp_trainingapplications (tapp_officerNid, tapp_office, tapp_atpid, tapp_trname, tapp_applieddate, tapp_trstartdate, tapp_isrelevent, tapp_priority, tapp_accomodation, tapp_diet, tapp_isselected) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)');
    $stmt->bind_param('sssssssisss', $nid, $office, $atpKey, $name, $applied, $start, $relevant, $priority, $stay, $diet, $selected);
    if (!$stmt->execute()) {
        json_out(['ok' => false, 'error' => 'The application could not be saved.'], 500);
    }
    json_out(['ok' => true, 'id' => db()->insert_id]);
}

function action_select_applicant(): void
{
    csrf_check();
    $user = require_user();
    if (!is_super($user)) {
        json_out(['ok' => false, 'error' => 'Only training staff can select officers.'], 403);
    }
    $data = body();
    $id = (int) ($data['id'] ?? 0);
    $selected = (string) ($data['selected'] ?? YES_SI);
    if ($selected !== YES_SI && $selected !== NO_SI) {
        json_out(['ok' => false, 'error' => 'Choose selected or not selected.'], 422);
    }
    $ids = [];
    if (!empty($data['ids']) && is_array($data['ids'])) {
        foreach ($data['ids'] as $one) {
            $one = (int) $one;
            if ($one > 0) {
                $ids[$one] = $one;
            }
        }
    }
    if ($id > 0) {
        $ids[$id] = $id;
    }
    $ids = array_values($ids);
    if (!$ids) {
        json_out(['ok' => false, 'error' => 'Choose an applicant.'], 422);
    }
    $stmt = db()->prepare('UPDATE cp_trainingapplications SET tapp_isselected = ? WHERE tapp_id = ?');
    foreach ($ids as $one) {
        $stmt->bind_param('si', $selected, $one);
        $stmt->execute();
        if ($selected === YES_SI) {
            stamp_selected_date($one);
        }
    }
    json_out(['ok' => true, 'count' => count($ids)]);
}

function stamp_selected_date(int $tappId): void
{
    if ($tappId <= 0) {
        return;
    }
    $today = date('Y-m-d');
    $stmt = db()->prepare("UPDATE cp_trainingapplications SET tapp_selecteddate = ? WHERE tapp_id = ? AND (tapp_selecteddate IS NULL OR tapp_selecteddate = '0000-00-00')");
    if ($stmt) {
        $stmt->bind_param('si', $today, $tappId);
        $stmt->execute();
    }
}

function action_attendance_save(): void
{
    csrf_check();
    $user = require_user();
    if (!is_super($user)) {
        json_out(['ok' => false, 'error' => 'Only training staff can mark attendance.'], 403);
    }
    $data = body();
    $atpId = (string) ($data['atp_id'] ?? '');
    $nid = trim((string) ($data['nid'] ?? ''));
    $present = (string) ($data['present'] ?? YES_SI);
    $note = trim((string) ($data['note'] ?? ''));
    $plan = rows('SELECT atp_id, atp_fileno, atp_trname, atp_day1 FROM cp_atp WHERE atp_id = ? LIMIT 1', 's', [$atpId]);
    if (!$plan || $nid === '') {
        json_out(['ok' => false, 'error' => 'Choose a programme and an officer.'], 422);
    }
    $file = (string) $plan[0]['atp_fileno'];
    $name = (string) $plan[0]['atp_trname'];
    $start = (string) $plan[0]['atp_day1'];
    $existing = rows('SELECT tratt_id FROM cp_trainingattendance WHERE tratt_atpid = ? AND tratt_empnid = ? LIMIT 1', 'ss', [$atpId, $nid]);
    if ($existing) {
        $id = (int) $existing[0]['tratt_id'];
        $stmt = db()->prepare('UPDATE cp_trainingattendance SET tratt_isparti = ?, tratt_comnt = ? WHERE tratt_id = ?');
        $stmt->bind_param('ssi', $present, $note, $id);
        $stmt->execute();
        json_out(['ok' => true, 'id' => $id]);
    }
    $stmt = db()->prepare('INSERT INTO cp_trainingattendance (tratt_atpid, tratt_atpfileno, tratt_atpname, tratt_startdate, tratt_empnid, tratt_isparti, tratt_comnt) VALUES (?, ?, ?, ?, ?, ?, ?)');
    $stmt->bind_param('sssssss', $atpId, $file, $name, $start, $nid, $present, $note);
    $stmt->execute();
    json_out(['ok' => true, 'id' => db()->insert_id]);
}

function programme_steps_done(int $id): bool
{
    $advance = rows('SELECT ad_id FROM cp_advances WHERE ad_atpid = ? LIMIT 1', 'i', [$id]);
    if (!$advance) {
        return false;
    }
    $attendance = rows("SELECT tratt_id FROM cp_trainingattendance WHERE tratt_atpid = ? AND tratt_isparti IS NOT NULL AND TRIM(tratt_isparti) <> '' LIMIT 1", 'i', [$id]);
    if (!$attendance) {
        return false;
    }
    $food = rows('SELECT fb_id FROM cp_foodbills WHERE fb_atpid = ? LIMIT 1', 'i', [$id]);
    if (!$food) {
        return false;
    }
    $pay = rows('SELECT al_id FROM cp_allowances WHERE al_atpid = ? LIMIT 1', 'i', [$id]);
    return (bool) $pay;
}

function save_completed_copy(array $row, string $actual, string $estimate, string $spent, string $comments): int
{
    $atpId = (string) $row['atp_id'];
    $people = [];
    for ($i = 1; $i <= 10; $i++) {
        $name = trim((string) ($row['atp_resourcep' . $i] ?? ''));
        if ($name !== '') {
            $people[] = $name;
        }
    }
    $resource = implode(', ', $people);
    $existing = rows('SELECT ct_id FROM cp_completedtrainings WHERE ct_atpid = ? LIMIT 1', 's', [$atpId]);
    $values = [
        $atpId, $row['atp_trname'], $row['atp_fileno'], $row['atp_subjctno'], $row['atp_purpose'], $row['atp_content'],
        $row['atp_targetgroup'], $row['atp_noofdays'], $row['atp_noofparticipants'], $row['atp_location'],
        $row['atp_day1'], $row['atp_day2'], $row['atp_day3'], $row['atp_day4'], $row['atp_day5'],
        $row['atp_day6'], $row['atp_day7'], $row['atp_day8'], $row['atp_day9'], $row['atp_day10'],
        $row['atp_fundsource'], $resource, $row['atp_cashofficername'], $row['atp_cashofficerdesig'], $row['atp_cashofficerotherdetails'],
        $row['atp_supportstaff1'], $row['atp_supportstaff2'], $row['atp_supportstaff3'], $row['atp_supportstaff4'], $row['atp_supportstaff5'], $row['atp_supportstaff6'],
        $row['atp_trtype'], $actual, $estimate, $spent, $comments,
    ];
    $types = str_repeat('s', count($values));
    if ($existing) {
        $sql = 'UPDATE cp_completedtrainings SET ct_trname=?, ct_fileno=?, ct_subjno=?, ct_trpurpose=?, ct_trcontent=?, ct_trtargetgroup=?, ct_noofdays=?, ct_noofparticipant=?, ct_location=?, ct_day1=?, ct_day2=?, ct_day3=?, ct_day4=?, ct_day5=?, ct_day6=?, ct_day7=?, ct_day8=?, ct_day9=?, ct_day10=?, ct_fundsource=?, ct_resourcepersons=?, ct_cashofficername=?, ct_cashofficerdesig=?, ct_cashofficerdetails=?, ct_suportstaffnid1=?, ct_suportstaffnid2=?, ct_suportstaffnid3=?, ct_suportstaffnid4=?, ct_suportstaffnid5=?, ct_suportstaffnid6=?, ct_trtype=?, ct_noofactualparticipant=?, ct_estimate=?, ct_actualexpenditure=?, ct_comments=? WHERE ct_atpid=?';
        $update = array_slice($values, 1);
        $update[] = $atpId;
        $stmt = db()->prepare($sql);
        bind_and_run($stmt, str_repeat('s', count($update)), $update);
        return (int) $existing[0]['ct_id'];
    }
    $sql = 'INSERT INTO cp_completedtrainings (ct_atpid, ct_trname, ct_fileno, ct_subjno, ct_trpurpose, ct_trcontent, ct_trtargetgroup, ct_noofdays, ct_noofparticipant, ct_location, ct_day1, ct_day2, ct_day3, ct_day4, ct_day5, ct_day6, ct_day7, ct_day8, ct_day9, ct_day10, ct_fundsource, ct_resourcepersons, ct_cashofficername, ct_cashofficerdesig, ct_cashofficerdetails, ct_suportstaffnid1, ct_suportstaffnid2, ct_suportstaffnid3, ct_suportstaffnid4, ct_suportstaffnid5, ct_suportstaffnid6, ct_trtype, ct_noofactualparticipant, ct_estimate, ct_actualexpenditure, ct_comments) VALUES (' . implode(',', array_fill(0, count($values), '?')) . ')';
    $stmt = db()->prepare($sql);
    bind_and_run($stmt, $types, $values);
    return (int) db()->insert_id;
}

function finish_programme_if_ready(int $id): bool
{
    if (!programme_steps_done($id)) {
        return false;
    }
    $plan = rows('SELECT * FROM cp_atp WHERE atp_id = ? LIMIT 1', 'i', [$id]);
    if (!$plan) {
        return false;
    }
    $counts = advance_attended_map();
    $actual = (string) ($counts[$id] ?? 0);
    $saved = rows('SELECT se_total FROM cp_savedestimates WHERE se_atpid = ? LIMIT 1', 'i', [$id]);
    $estimate = trim((string) ($saved[0]['se_total'] ?? ''));
    if ($estimate === '') {
        $estimate = trim((string) ($plan[0]['atp_bdjet'] ?? ''));
    }
    $money = rows('SELECT d.ad_spent, f.fb_food FROM cp_atp a LEFT JOIN cp_advances d ON d.ad_atpid = a.atp_id LEFT JOIN cp_foodbills f ON f.fb_atpid = a.atp_id WHERE a.atp_id = ? LIMIT 1', 'i', [$id]);
    $spent = advance_money(advance_number((string) ($money[0]['ad_spent'] ?? '0')) + advance_number((string) ($money[0]['fb_food'] ?? '0')));
    $existing = rows('SELECT ct_comments FROM cp_completedtrainings WHERE ct_atpid = ? LIMIT 1', 's', [(string) $id]);
    $comments = $existing ? (string) ($existing[0]['ct_comments'] ?? '') : '';
    save_completed_copy($plan[0], $actual, $estimate, $spent, $comments);
    return true;
}

function action_finish(): void
{
    csrf_check();
    $user = require_user();
    if (!is_super($user)) {
        json_out(['ok' => false, 'error' => 'Only training staff can close a programme.'], 403);
    }
    $data = body();
    $atpId = (string) ($data['atp_id'] ?? '');
    $plan = rows('SELECT * FROM cp_atp WHERE atp_id = ? LIMIT 1', 's', [$atpId]);
    if (!$plan) {
        json_out(['ok' => false, 'error' => 'That programme was not found.'], 404);
    }
    $row = $plan[0];
    $actual = trim((string) ($data['actual'] ?? ''));
    $estimate = trim((string) ($data['estimate'] ?? $row['atp_bdjet']));
    $spent = trim((string) ($data['expenditure'] ?? ''));
    $comments = trim((string) ($data['comments'] ?? ''));
    $id = save_completed_copy($row, $actual, $estimate, $spent, $comments);
    json_out(['ok' => true, 'id' => $id]);
}

function atp_year_clause(): array
{
    $parts = [];
    for ($i = 1; $i <= 10; $i++) {
        $parts[] = 'atp_day' . $i . ' BETWEEN ? AND ?';
    }
    $parts[] = 'atp_requestDate BETWEEN ? AND ?';
    return ['(' . implode(' OR ', $parts) . ')', str_repeat('ss', 11)];
}

function atp_year_params(string $start, string $end): array
{
    $params = [];
    for ($i = 0; $i < 11; $i++) {
        $params[] = $start;
        $params[] = $end;
    }
    return $params;
}

function action_report(): void
{
    $user = require_user();
    $name = (string) ($_GET['name'] ?? 'summary');
    $year = (int) ($_GET['year'] ?? date('Y'));
    if ($year < 1990 || $year > 2100) {
        $year = (int) date('Y');
    }
    $start = $year . '-01-01';
    $end = $year . '-12-31';
    $office = $user['role'] === 'User' ? $user['office'] : trim((string) ($_GET['office'] ?? ''));

    [$yearSql, $yearTypes] = atp_year_clause();
    $yearParams = atp_year_params($start, $end);
    if ($name === 'summary') {
        $plan = rows("SELECT COUNT(*) AS programmes, COALESCE(SUM(atp_bdjet),0) AS budget FROM cp_atp WHERE $yearSql", $yearTypes, $yearParams);
        $done = rows("SELECT COUNT(*) AS programmes, COALESCE(SUM(ct_actualexpenditure),0) AS spent, COALESCE(SUM(ct_noofactualparticipant),0) AS people FROM cp_completedtrainings WHERE ct_day1 BETWEEN ? AND ?", 'ss', [$start, $end]);
        $byType = rows("SELECT atp_trtype AS label, COUNT(*) AS total FROM cp_atp WHERE $yearSql GROUP BY atp_trtype", $yearTypes, $yearParams);
        json_out(['ok' => true, 'title' => 'Training summary ' . $year, 'plan' => $plan[0] ?? [], 'completed' => $done[0] ?? [], 'byType' => $byType]);
    }
    if ($name === 'annual') {
        $items = rows(
            "SELECT atp_id, atp_fileno, atp_trname, atp_targetgroup, atp_noofdays, atp_noofparticipants, atp_location, atp_day1, atp_fundsource, atp_bdjet, atp_trtype
             FROM cp_atp WHERE $yearSql ORDER BY atp_day1 ASC",
            $yearTypes,
            $yearParams
        );
        json_out(['ok' => true, 'title' => 'Annual training plan ' . $year, 'columns' => ['atp_fileno', 'atp_trname', 'atp_targetgroup', 'atp_noofdays', 'atp_noofparticipants', 'atp_location', 'atp_day1', 'atp_fundsource', 'atp_bdjet', 'atp_trtype'], 'items' => $items]);
    }
    if ($name === 'budget') {
        $items = rows(
            "SELECT atp_trname, atp_fundsource, atp_bdjet, atp_noofparticipants, atp_noofdays, atp_day1, atp_location
             FROM cp_atp WHERE $yearSql ORDER BY atp_fundsource, atp_day1",
            $yearTypes,
            $yearParams
        );
        json_out(['ok' => true, 'title' => 'Budget estimate ' . $year, 'columns' => ['atp_trname', 'atp_day1', 'atp_location', 'atp_noofdays', 'atp_noofparticipants', 'atp_fundsource', 'atp_bdjet'], 'items' => $items]);
    }
    if ($name === 'completed') {
        $items = rows(
            "SELECT ct_trname, ct_fileno, ct_day1, ct_location, ct_noofparticipant, ct_noofactualparticipant, ct_estimate, ct_actualexpenditure, ct_trtype
             FROM cp_completedtrainings WHERE ct_day1 BETWEEN ? AND ? ORDER BY ct_day1",
            'ss',
            [$start, $end]
        );
        json_out(['ok' => true, 'title' => 'Completed programmes ' . $year, 'columns' => ['ct_fileno', 'ct_trname', 'ct_day1', 'ct_location', 'ct_noofparticipant', 'ct_noofactualparticipant', 'ct_estimate', 'ct_actualexpenditure', 'ct_trtype'], 'items' => $items]);
    }
    if ($name === 'private') {
        $items = rows(
            "SELECT pvtt_nid, pvtt_cname, pvtt_cinstitute, pvtt_applydate, pvtt_fees, pvtt_approved, pvtt_amount, pvtt_chequeno
             FROM cp_privatetrainings WHERE pvtt_applydate BETWEEN ? AND ? ORDER BY pvtt_applydate DESC",
            'ss',
            [$start, $end]
        );
        json_out(['ok' => true, 'title' => 'Private course funding ' . $year, 'columns' => ['pvtt_nid', 'pvtt_cname', 'pvtt_cinstitute', 'pvtt_applydate', 'pvtt_fees', 'pvtt_approved', 'pvtt_amount', 'pvtt_chequeno'], 'items' => $items]);
    }
    if ($name === 'needs') {
        $sql = "SELECT req_adddate, req_addoffice, req_post, req_training, req_noofemps, req_comments FROM cp_trrequirements WHERE req_adddate BETWEEN ? AND ?";
        $types = 'ss';
        $params = [$start, $end];
        if ($office !== '') {
            $sql .= ' AND req_addoffice = ?';
            $types .= 's';
            $params[] = $office;
        }
        $sql .= ' ORDER BY req_addoffice, req_adddate';
        json_out(['ok' => true, 'title' => 'Training needs ' . $year, 'columns' => ['req_adddate', 'req_addoffice', 'req_post', 'req_training', 'req_noofemps', 'req_comments'], 'items' => rows($sql, $types, $params)]);
    }
    if ($name === 'applications') {
        $sql = "SELECT tapp_applieddate, tapp_office, tapp_officerNid, tapp_trname, tapp_trstartdate, tapp_priority, tapp_isselected FROM cp_trainingapplications WHERE (tapp_applieddate BETWEEN ? AND ? OR tapp_trstartdate BETWEEN ? AND ?)";
        $types = 'ssss';
        $params = [$start, $end, $start, $end];
        if ($office !== '') {
            $sql .= ' AND tapp_office = ?';
            $types .= 's';
            $params[] = $office;
        }
        $sql .= ' ORDER BY tapp_trname, tapp_office';
        json_out(['ok' => true, 'title' => 'Training applications ' . $year, 'columns' => ['tapp_applieddate', 'tapp_office', 'tapp_officerNid', 'tapp_trname', 'tapp_trstartdate', 'tapp_priority', 'tapp_isselected'], 'items' => rows($sql, $types, $params)]);
    }
    if ($name === 'participants') {
        $sql = "SELECT a.tratt_startdate, a.tratt_atpname, a.tratt_empnid, s.stf_Name, s.stf_office, a.tratt_isparti
                FROM cp_trainingattendance a
                LEFT JOIN cp_staff s ON s.stf_Nid = a.tratt_empnid
                WHERE a.tratt_startdate BETWEEN ? AND ?";
        $types = 'ss';
        $params = [$start, $end];
        if ($office !== '') {
            $sql .= ' AND s.stf_office = ?';
            $types .= 's';
            $params[] = $office;
        }
        $sql .= ' ORDER BY a.tratt_startdate DESC';
        $items = rows($sql, $types, $params);
        json_out(['ok' => true, 'title' => 'Participants ' . $year, 'columns' => ['tratt_startdate', 'tratt_atpname', 'tratt_empnid', 'stf_Name', 'stf_office', 'tratt_isparti'], 'items' => $items]);
    }
    if ($name === 'offices') {
        $items = rows(
            "SELECT tapp_office AS office, COUNT(*) AS applications,
                    SUM(CASE WHEN tapp_isselected = ? THEN 1 ELSE 0 END) AS selected
             FROM cp_trainingapplications
             WHERE tapp_applieddate BETWEEN ? AND ?
             GROUP BY tapp_office
             ORDER BY applications DESC",
            'sss',
            [YES_SI, $start, $end]
        );
        json_out(['ok' => true, 'title' => 'Offices by applications ' . $year, 'columns' => ['office', 'applications', 'selected'], 'items' => $items]);
    }
    json_out(['ok' => false, 'error' => 'Unknown report.'], 404);
}

function action_export(): void
{
    $user = require_user();
    $_GET['page'] = '1';
    $_GET['limit'] = '5000';
    $table = (string) ($_GET['table'] ?? '');
    if ($table === '') {
        json_out(['ok' => false, 'error' => 'Choose a record type to export.'], 422);
    }
    if (!can_access($user, $table, 'read')) {
        json_out(['ok' => false, 'error' => 'You cannot export this record type.'], 403);
    }
    $desc = describe_table($table);
    $meta = table_meta($table);
    $safe = '`' . str_replace('`', '', $table) . '`';
    $where = ' WHERE 1=1 ';
    $types = '';
    $params = [];
    [$officeSql, $officeType, $officeValue] = office_clause($user, $meta);
    $where .= $officeSql;
    if ($officeType !== '') {
        $types .= $officeType;
        $params[] = $officeValue;
    }
    $stmt = db()->prepare("SELECT * FROM $safe $where ORDER BY `{$desc['primary']}` DESC LIMIT 5000");
    if ($types !== '') {
        $stmt->bind_param($types, ...$params);
    }
    $stmt->execute();
    $result = $stmt->get_result();
    $headers = array_map(static fn($c) => field_label($c['Field']), $desc['columns']);
    $grid = [];
    while ($row = $result->fetch_assoc()) {
        if (isset($row['lg_pwd'])) {
            $row['lg_pwd'] = '';
        }
        $line = [];
        foreach ($desc['columns'] as $column) {
            $line[] = (string) repair_value((string) ($row[$column['Field']] ?? ''));
        }
        $grid[] = $line;
    }
    send_excel($table, $headers, $grid);
}

function send_excel(string $name, array $headers, array $grid): void
{
    $xml = '<?xml version="1.0" encoding="UTF-8"?>'
        . '<?mso-application progid="Excel.Sheet"?>'
        . '<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet" xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">'
        . '<Worksheet ss:Name="Sheet1"><Table>';
    $write = static function (array $cells) use (&$xml): void {
        $xml .= '<Row>';
        foreach ($cells as $cell) {
            $text = htmlspecialchars((string) $cell, ENT_XML1 | ENT_QUOTES, 'UTF-8');
            $xml .= '<Cell><Data ss:Type="String">' . $text . '</Data></Cell>';
        }
        $xml .= '</Row>';
    };
    $write($headers);
    foreach ($grid as $line) {
        $write($line);
    }
    $xml .= '</Table></Worksheet></Workbook>';
    header('Content-Type: application/vnd.ms-excel; charset=utf-8');
    header('Content-Disposition: attachment; filename="' . $name . '.xls"');
    echo $xml;
    exit;
}

function action_import(): void
{
    csrf_check();
    $user = require_user();
    $table = (string) ($_POST['table'] ?? '');
    $allowed = ['cp_resourcepersons', 'cp_trrequirements', 'cp_atp'];
    if (!in_array($table, $allowed, true) || !can_access($user, $table, 'write')) {
        json_out(['ok' => false, 'error' => 'You cannot import this sheet.'], 403);
    }
    if (!isset($_FILES['file']) || !is_uploaded_file($_FILES['file']['tmp_name'])) {
        json_out(['ok' => false, 'error' => 'Choose an Excel or CSV file.'], 422);
    }
    $rows = read_sheet($_FILES['file']['tmp_name'], (string) $_FILES['file']['name']);
    if (count($rows) < 2) {
        json_out(['ok' => false, 'error' => 'The sheet has no data rows.'], 422);
    }
    $desc = describe_table($table);
    $byLabel = [];
    $byName = [];
    foreach ($desc['columns'] as $column) {
        $byName[strtolower($column['Field'])] = $column['Field'];
        $byLabel[strtolower(field_label($column['Field']))] = $column['Field'];
    }
    $map = [];
    foreach ($rows[0] as $index => $header) {
        $key = strtolower(trim((string) $header));
        if (isset($byName[$key])) {
            $map[$index] = $byName[$key];
        } elseif (isset($byLabel[$key])) {
            $map[$index] = $byLabel[$key];
        }
    }
    if (!$map) {
        json_out(['ok' => false, 'error' => 'The first row must be the column headings from a downloaded sheet.'], 422);
    }
    $primary = $desc['primary'];
    $saved = 0;
    foreach (array_slice($rows, 1, 2000) as $line) {
        $record = [];
        foreach ($map as $index => $column) {
            $record[$column] = trim((string) ($line[$index] ?? ''));
        }
        $filled = array_filter($record, static fn($value) => $value !== '');
        if (!$filled) {
            continue;
        }
        if ($table === 'cp_trrequirements' && trim((string) ($record['req_adddate'] ?? '')) === '') {
            $record['req_adddate'] = date('Y-m-d');
        }
        if ($table === 'cp_trrequirements' && trim((string) ($record['req_isadd'] ?? '')) === '') {
            $record['req_isadd'] = NO_SI;
        }
        if ($user['role'] === 'User' && $table === 'cp_trrequirements') {
            $record['req_addoffice'] = $user['office'];
        }
        $id = trim((string) ($record[$primary] ?? ''));
        unset($record['lg_pwd']);
        save_mapped($table, $record, $id, $desc);
        $saved++;
    }
    json_out(['ok' => true, 'saved' => $saved]);
}

function action_next_plan(): void
{
    csrf_check();
    $user = require_user();
    if (!is_super($user)) {
        json_out(['ok' => false, 'error' => 'මේ ලැයිස්තුව දාන්න පුළුවන් පුහුණු කාර්ය මණ්ඩලයට පමණයි.'], 403);
    }
    $year = (int) ($_POST['year'] ?? 0);
    if ($year < 1990 || $year > 2100) {
        json_out(['ok' => false, 'error' => 'වර්ෂය තෝරන්න.'], 422);
    }
    if (!isset($_FILES['file']) || !is_uploaded_file($_FILES['file']['tmp_name'])) {
        json_out(['ok' => false, 'error' => 'ආකෘතිය පුරවාගත් ගොනුව තෝරන්න.'], 422);
    }
    $rows = read_sheet($_FILES['file']['tmp_name'], (string) $_FILES['file']['name']);
    if (count($rows) < 2) {
        json_out(['ok' => false, 'error' => 'ගොනුවේ පුහුණු නම් නැත.'], 422);
    }
    $aliases = [
        'පුහුණු වැඩසටහන' => 'name',
        'atp_trname' => 'name',
        'programme' => 'name',
        'දින ගණන' => 'days',
        'atp_noofdays' => 'days',
        'සේවක සංඛ්‍යාව' => 'people',
        'atp_noofparticipants' => 'people',
        'ස්ථානය' => 'place',
        'atp_location' => 'place',
        'ඉලක්කගත කණ්ඩායම' => 'target',
        'atp_targetgroup' => 'target',
        'ප්‍රතිපාදන' => 'money',
        'atp_bdjet' => 'money',
    ];
    $map = [];
    foreach ($rows[0] as $index => $header) {
        $key = trim((string) $header);
        $low = mb_strtolower($key);
        if (isset($aliases[$key])) {
            $map[$index] = $aliases[$key];
        } elseif (isset($aliases[$low])) {
            $map[$index] = $aliases[$low];
        }
    }
    if (!in_array('name', $map, true)) {
        $map[0] = 'name';
    }
    $stamp = $year . '-01-01';
    $saved = 0;
    foreach (array_slice($rows, 1, 2000) as $line) {
        $picked = ['name' => '', 'days' => '', 'people' => '', 'place' => '', 'target' => '', 'money' => ''];
        foreach ($map as $index => $column) {
            $picked[$column] = trim((string) ($line[$index] ?? ''));
        }
        $name = $picked['name'];
        if ($name === '' || str_starts_with($name, 'උදා')) {
            continue;
        }
        $row = [];
        foreach (describe_table('cp_atp')['columns'] as $column) {
            if ($column['Field'] === 'atp_id') {
                continue;
            }
            $row[$column['Field']] = '';
        }
        $row['atp_trname'] = mb_substr($name, 0, 500);
        $row['atp_noofdays'] = mb_substr($picked['days'], 0, 20);
        $row['atp_noofparticipants'] = mb_substr($picked['people'], 0, 20);
        $row['atp_location'] = mb_substr($picked['place'], 0, 500);
        $row['atp_targetgroup'] = mb_substr($picked['target'], 0, 500);
        $row['atp_bdjet'] = mb_substr($picked['money'], 0, 40);
        $row['atp_trtype'] = TYPE_MDTU;
        $row['atp_offweb'] = NO_SI;
        $row['atp_addhome'] = NO_SI;
        $row['atp_isinatp'] = NO_SI;
        $row['atp_isaddatp'] = NO_SI;
        $row['atp_day1'] = $stamp;
        $row['atp_requestDate'] = $stamp;
        $row['atp_lastdateapply'] = '0000-00-00';
        $row['atp_stime'] = '9.00 am';
        $row['atp_etime'] = '4.15 pm';
        for ($i = 2; $i <= 10; $i++) {
            $row['atp_day' . $i] = '0000-00-00';
        }
        $fields = array_keys($row);
        $marks = implode(',', array_fill(0, count($fields), '?'));
        $cols = implode(',', array_map(static fn ($field) => '`' . $field . '`', $fields));
        $stmt = db()->prepare('INSERT INTO cp_atp (' . $cols . ') VALUES (' . $marks . ')');
        if (!$stmt || !bind_and_run($stmt, str_repeat('s', count($fields)), array_values($row))) {
            json_out(['ok' => false, 'error' => 'පුහුණු වැඩසටහන ඇතුළත් කළ නොහැකි විය.'], 500);
        }
        $saved++;
    }
    if ($saved < 1) {
        json_out(['ok' => false, 'error' => 'පුහුණු වැඩසටහනේ නම තියෙන පේළියක් නැත.'], 422);
    }
    json_out(['ok' => true, 'saved' => $saved, 'year' => (string) $year]);
}

function save_mapped(string $table, array $record, string $id, array $desc): void
{
    $allowed = [];
    foreach ($desc['columns'] as $column) {
        $allowed[$column['Field']] = true;
    }
    $primary = $desc['primary'];
    $isInsert = $id === '' || $id === '0';
    if ($table === 'cp_resourcepersons' && $isInsert && trim((string) ($record['rp_code'] ?? '')) === '') {
        $record['rp_code'] = (string) random_int(100000, 999999);
    }
    $fields = [];
    $params = [];
    foreach ($record as $name => $value) {
        if (!isset($allowed[$name]) || $name === $primary) {
            continue;
        }
        $fields[] = $name;
        $params[] = (string) $value;
    }
    if (!$fields) {
        return;
    }
    $safe = '`' . str_replace('`', '', $table) . '`';
    if ($isInsert) {
        $cols = implode(',', array_map(static fn($f) => '`' . $f . '`', $fields));
        $marks = implode(',', array_fill(0, count($fields), '?'));
        $stmt = db()->prepare("INSERT INTO $safe ($cols) VALUES ($marks)");
        bind_and_run($stmt, str_repeat('s', count($params)), $params);
        return;
    }
    $sets = implode(',', array_map(static fn($f) => '`' . $f . '` = ?', $fields));
    $params[] = $id;
    $stmt = db()->prepare("UPDATE $safe SET $sets WHERE `$primary` = ?");
    bind_and_run($stmt, str_repeat('s', count($params)), $params);
}

function read_sheet(string $path, string $filename): array
{
    $ext = strtolower(pathinfo($filename, PATHINFO_EXTENSION));
    $raw = file_get_contents($path);
    if ($raw === false) {
        return [];
    }
    if ($ext === 'xlsx') {
        return xlsx_rows($raw);
    }
    if ($ext === 'xls' && str_contains(substr($raw, 0, 200), '<Workbook')) {
        return xml_sheet_rows($raw);
    }
    $text = $raw;
    if (str_starts_with($text, "\xEF\xBB\xBF")) {
        $text = substr($text, 3);
    }
    $handle = fopen('php://temp', 'r+');
    fwrite($handle, $text);
    rewind($handle);
    $rows = [];
    while (($line = fgetcsv($handle)) !== false) {
        $rows[] = $line;
    }
    fclose($handle);
    return $rows;
}

function xlsx_rows(string $raw): array
{
    $files = zip_files($raw);
    if (!isset($files['xl/worksheets/sheet1.xml'])) {
        json_out(['ok' => false, 'error' => 'That Excel file could not be read. Save it as CSV and upload the CSV.'], 422);
    }
    $shared = [];
    if (isset($files['xl/sharedStrings.xml'])) {
        $xml = @simplexml_load_string($files['xl/sharedStrings.xml']);
        if ($xml) {
            foreach ($xml->si as $item) {
                $parts = $item->xpath('.//t');
                $text = '';
                foreach ($parts ?: [] as $part) {
                    $text .= (string) $part;
                }
                $shared[] = $text;
            }
        }
    }
    $xml = @simplexml_load_string($files['xl/worksheets/sheet1.xml']);
    if (!$xml) {
        return [];
    }
    $rows = [];
    foreach ($xml->sheetData->row as $row) {
        $line = [];
        foreach ($row->c as $cell) {
            $ref = preg_replace('/\d+/', '', (string) $cell['r']);
            $index = 0;
            $letters = strtoupper((string) $ref);
            for ($i = 0, $n = strlen($letters); $i < $n; $i++) {
                $index = $index * 26 + (ord($letters[$i]) - 64);
            }
            $value = (string) $cell->v;
            if ((string) $cell['t'] === 's') {
                $value = $shared[(int) $value] ?? '';
            } elseif ((string) $cell['t'] === 'inlineStr') {
                $value = (string) $cell->is->t;
            }
            $line[$index - 1] = $value;
        }
        if ($line) {
            $filled = [];
            $max = max(array_keys($line));
            for ($i = 0; $i <= $max; $i++) {
                $filled[] = $line[$i] ?? '';
            }
            $rows[] = $filled;
        }
    }
    return $rows;
}

function xml_sheet_rows(string $raw): array
{
    $xml = @simplexml_load_string($raw);
    if (!$xml) {
        return [];
    }
    $xml->registerXPathNamespace('ss', 'urn:schemas-microsoft-com:office:spreadsheet');
    $rows = [];
    foreach ($xml->xpath('//ss:Row') ?: [] as $row) {
        $line = [];
        foreach ($row->children('urn:schemas-microsoft-com:office:spreadsheet') as $cell) {
            $data = $cell->children('urn:schemas-microsoft-com:office:spreadsheet')->Data;
            $line[] = (string) $data;
        }
        $rows[] = $line;
    }
    return $rows;
}

function zip_files(string $raw): array
{
    $end = strrpos($raw, "PK\x05\x06");
    if ($end === false) {
        return [];
    }
    $offset = unpack('V', substr($raw, $end + 16, 4))[1];
    $files = [];
    $pos = $offset;
    $length = strlen($raw);
    while ($pos + 46 < $length && substr($raw, $pos, 4) === "PK\x01\x02") {
        $method = unpack('v', substr($raw, $pos + 10, 2))[1];
        $comp = unpack('V', substr($raw, $pos + 20, 4))[1];
        $nameLen = unpack('v', substr($raw, $pos + 28, 2))[1];
        $extraLen = unpack('v', substr($raw, $pos + 30, 2))[1];
        $commentLen = unpack('v', substr($raw, $pos + 32, 2))[1];
        $local = unpack('V', substr($raw, $pos + 42, 4))[1];
        $name = substr($raw, $pos + 46, $nameLen);
        $pos += 46 + $nameLen + $extraLen + $commentLen;
        if ($local + 30 > $length) {
            continue;
        }
        $localName = unpack('v', substr($raw, $local + 26, 2))[1];
        $localExtra = unpack('v', substr($raw, $local + 28, 2))[1];
        $start = $local + 30 + $localName + $localExtra;
        $data = substr($raw, $start, $comp);
        if ($method === 8) {
            $data = gzinflate($data);
            if ($data === false) {
                continue;
            }
        } elseif ($method !== 0) {
            continue;
        }
        $files[$name] = $data;
    }
    return $files;
}

function action_resource_options(): void
{
    json_out([
        'ok' => true,
        'fields' => rows('SELECT tf_name FROM cp_trfields ORDER BY tf_name ASC'),
        'designations' => rows('SELECT des_name FROM cp_desigs ORDER BY des_name ASC'),
    ]);
}

function action_resource_lookup(): void
{
    csrf_check();
    $data = body();
    $nid = trim((string) ($data['nid'] ?? ''));
    $code = trim((string) ($data['code'] ?? ''));
    if ($nid === '' || $code === '') {
        json_out(['ok' => false, 'error' => 'Enter the national ID and the update code.'], 422);
    }
    $found = rows('SELECT * FROM cp_resourcepersons WHERE rp_nid = ? AND rp_code = ? LIMIT 1', 'ss', [$nid, $code]);
    if (!$found) {
        json_out(['ok' => false, 'error' => 'That national ID and update code do not match.'], 404);
    }
    $row = $found[0];
    unset($row['rp_code']);
    $row['rp_cv_url'] = $row['rp_cv'] !== '' ? public_file('resource', (string) $row['rp_cv']) : '';
    $row['rp_certificate_url'] = $row['rp_certificate'] !== '' ? public_file('resource', (string) $row['rp_certificate']) : '';
    $row['rp_photo_url'] = !empty($row['rp_photo']) ? public_file('resource', (string) $row['rp_photo']) : '';
    json_out(['ok' => true, 'person' => $row]);
}

function resource_subjects(array $data): array
{
    $subjects = [];
    for ($i = 1; $i <= 5; $i++) {
        $typed = trim((string) ($data['rp_fld' . $i . '_new'] ?? ''));
        $picked = trim((string) ($data['rp_fld' . $i] ?? ''));
        $subjects[] = $typed !== '' ? $typed : $picked;
    }
    $extras = $data['rp_extra'] ?? [];
    $extraNew = $data['rp_extra_new'] ?? [];
    if (!is_array($extras)) {
        $extras = [$extras];
    }
    if (!is_array($extraNew)) {
        $extraNew = [$extraNew];
    }
    $count = max(count($extras), count($extraNew));
    for ($i = 0; $i < $count; $i++) {
        $typed = trim((string) ($extraNew[$i] ?? ''));
        $picked = trim((string) ($extras[$i] ?? ''));
        $value = $typed !== '' ? $typed : $picked;
        if ($value !== '') {
            $subjects[] = $value;
        }
    }
    $packed = [];
    foreach ($subjects as $subject) {
        if ($subject !== '' && !in_array($subject, $packed, true)) {
            $packed[] = $subject;
        }
    }
    return $packed;
}

function remember_subjects(array $subjects): void
{
    foreach ($subjects as $subject) {
        $have = rows('SELECT tf_id FROM cp_trfields WHERE tf_name = ? LIMIT 1', 's', [$subject]);
        if ($have) {
            continue;
        }
        $stmt = db()->prepare('INSERT INTO cp_trfields (tf_name) VALUES (?)');
        $stmt->bind_param('s', $subject);
        $stmt->execute();
    }
}

function action_resource_save(): void
{
    csrf_check();
    $data = body();
    $nid = trim((string) ($data['rp_nid'] ?? ''));
    $name = trim((string) ($data['rp_name'] ?? ''));
    $code = trim((string) ($data['rp_code'] ?? ''));
    if ($nid === '' || $name === '') {
        json_out(['ok' => false, 'error' => 'Enter the national ID and the full name.'], 422);
    }
    $existing = rows('SELECT rp_id, rp_code, rp_cv, rp_certificate, rp_photo FROM cp_resourcepersons WHERE rp_nid = ? LIMIT 1', 's', [$nid]);
    $subjects = resource_subjects($data);
    remember_subjects($subjects);
    for ($i = 1; $i <= 5; $i++) {
        $data['rp_fld' . $i] = $subjects[$i - 1] ?? '';
    }
    $data['rp_morefields'] = implode("\n", array_slice($subjects, 5));
    $columns = ['rp_name', 'rp_dob', 'rp_gender', 'rp_desig', 'rp_office', 'rp_mobile', 'rp_offtele', 'rp_hometele', 'rp_whatsapp', 'rp_email', 'rp_phd', 'rp_msc', 'rp_degree', 'rp_al', 'rp_profq', 'rpexp', 'rp_fld1', 'rp_fld2', 'rp_fld3', 'rp_fld4', 'rp_fld5', 'rp_morefields'];
    $cv = store_pdf('rp_cv');
    $certificate = store_pdf('rp_certificate');
    $photo = store_image('rp_photo');
    if ($existing) {
        $stored = (string) $existing[0]['rp_code'];
        if ($code === '' || $stored === '' || !hash_equals($stored, $code)) {
            json_out(['ok' => false, 'error' => 'This national ID is already registered. Enter the update code to change it.'], 422);
        }
        $sets = ['rp_nid = ?'];
        $params = [$nid];
        foreach ($columns as $column) {
            $sets[] = '`' . $column . '` = ?';
            $params[] = trim((string) ($data[$column] ?? ''));
        }
        if ($cv !== '') {
            $sets[] = 'rp_cv = ?';
            $params[] = $cv;
        }
        if ($certificate !== '') {
            $sets[] = 'rp_certificate = ?';
            $params[] = $certificate;
        }
        if ($photo !== '') {
            $sets[] = 'rp_photo = ?';
            $params[] = $photo;
        }
        $params[] = (int) $existing[0]['rp_id'];
        $stmt = db()->prepare('UPDATE cp_resourcepersons SET ' . implode(',', $sets) . ' WHERE rp_id = ?');
        bind_and_run($stmt, str_repeat('s', count($params) - 1) . 'i', $params);
        json_out(['ok' => true, 'updated' => true, 'code' => $code]);
    }
    $fresh = (string) random_int(100000, 999999);
    $names = array_merge(['rp_nid', 'rp_code'], $columns, ['rp_cv', 'rp_certificate', 'rp_photo']);
    $values = [$nid, $fresh];
    foreach ($columns as $column) {
        $values[] = trim((string) ($data[$column] ?? ''));
    }
    $values[] = $cv;
    $values[] = $certificate;
    $values[] = $photo;
    $marks = implode(',', array_fill(0, count($names), '?'));
    $cols = implode(',', array_map(static fn($f) => '`' . $f . '`', $names));
    $stmt = db()->prepare("INSERT INTO cp_resourcepersons ($cols) VALUES ($marks)");
    if (!bind_and_run($stmt, str_repeat('s', count($values)), $values)) {
        json_out(['ok' => false, 'error' => 'The registration could not be saved.'], 500);
    }
    json_out(['ok' => true, 'updated' => false, 'code' => $fresh]);
}

function store_pdf(string $field): string
{
    if (!isset($_FILES[$field]) || !is_uploaded_file($_FILES[$field]['tmp_name'] ?? '')) {
        return '';
    }
    upload_ext($_FILES[$field], ['pdf'], 12 * 1024 * 1024);
    $dir = __DIR__ . '/resource';
    if (!is_dir($dir) && !mkdir($dir, 0755, true) && !is_dir($dir)) {
        json_out(['ok' => false, 'error' => 'The upload folder is not available.'], 500);
    }
    $stored = time() . '_' . bin2hex(random_bytes(4)) . '.pdf';
    if (!move_uploaded_file($_FILES[$field]['tmp_name'], $dir . '/' . $stored)) {
        json_out(['ok' => false, 'error' => 'The PDF could not be stored.'], 500);
    }
    return $stored;
}

function store_image(string $field): string
{
    if (!isset($_FILES[$field]) || !is_uploaded_file($_FILES[$field]['tmp_name'] ?? '')) {
        return '';
    }
    $ext = upload_ext($_FILES[$field], ['jpg', 'jpeg', 'png', 'gif', 'webp'], 6 * 1024 * 1024);
    $dir = __DIR__ . '/resource';
    if (!is_dir($dir) && !mkdir($dir, 0755, true) && !is_dir($dir)) {
        json_out(['ok' => false, 'error' => 'The upload folder is not available.'], 500);
    }
    $stored = time() . '_' . bin2hex(random_bytes(4)) . '.' . $ext;
    if (!move_uploaded_file($_FILES[$field]['tmp_name'], $dir . '/' . $stored)) {
        json_out(['ok' => false, 'error' => 'ඡායාරූපය සුරැකිය නොහැක.'], 500);
    }
    return $stored;
}

function programme_days(array $row, string $prefix): array
{
    $days = [];
    for ($i = 1; $i <= 10; $i++) {
        $value = (string) ($row[$prefix . $i] ?? '');
        if (!blank_date($value)) {
            $days[] = substr($value, 0, 10);
        }
    }
    if ($prefix === 'atp_day') {
        foreach (preg_split('/\R/', (string) ($row['atp_moredays'] ?? '')) as $extra) {
            $extra = trim($extra);
            if (!blank_date($extra)) {
                $days[] = substr($extra, 0, 10);
            }
        }
    }
    return $days;
}

function action_programme(): void
{
    $id = (int) ($_GET['id'] ?? 0);
    $found = rows('SELECT * FROM cp_atp WHERE atp_id = ? LIMIT 1', 'i', [$id]);
    if (!$found) {
        json_out(['ok' => false, 'error' => 'That programme was not found.'], 404);
    }
    $plan = $found[0];
    $plan['days'] = programme_days($plan, 'atp_day');
    json_out(['ok' => true, 'programme' => $plan]);
}

function action_calendar(): void
{
    $month = (string) ($_GET['month'] ?? date('Y-m'));
    if (!preg_match('/^\d{4}-\d{2}$/', $month)) {
        $month = date('Y-m');
    }
    $start = $month . '-01';
    $end = date('Y-m-t', strtotime($start));
    $where = [];
    $types = '';
    $params = [];
    for ($i = 1; $i <= 10; $i++) {
        $where[] = "atp_day{$i} BETWEEN ? AND ?";
        $types .= 'ss';
        $params[] = $start;
        $params[] = $end;
    }
    $columns = 'atp_id, atp_trname, atp_location, atp_trtype, atp_stime, atp_etime';
    for ($i = 1; $i <= 10; $i++) {
        $columns .= ", atp_day{$i}";
    }
    $plans = rows('SELECT ' . $columns . ' FROM cp_atp WHERE ' . implode(' OR ', $where) . ' LIMIT 400', $types, $params);
    $events = [];
    foreach ($plans as $plan) {
        foreach (programme_days($plan, 'atp_day') as $day) {
            if ($day >= $start && $day <= $end) {
                $events[] = [
                    'date' => $day,
                    'id' => $plan['atp_id'],
                    'name' => $plan['atp_trname'],
                    'location' => $plan['atp_location'],
                    'type' => $plan['atp_trtype'],
                    'time' => trim($plan['atp_stime'] . ' ' . $plan['atp_etime']),
                ];
            }
        }
    }
    json_out(['ok' => true, 'month' => $month, 'events' => $events]);
}

function action_birthdays(): void
{
    if (($_GET['today'] ?? '') === '1') {
        $people = rows(
            "SELECT stf_Name, stf_desig, stf_office, stf_mobile, stf_email, stf_Photo, stf_dob
             FROM cp_staff
             WHERE MONTH(stf_dob) = ? AND DAY(stf_dob) = ?
               AND stf_dob NOT LIKE '0000%'
             ORDER BY stf_Name ASC",
            'ii',
            [(int) date('n'), (int) date('j')]
        );
        foreach ($people as &$person) {
            $person['photo'] = $person['stf_Photo'] !== '' ? public_file('staff', (string) $person['stf_Photo']) : '';
        }
        unset($person);
        json_out(['ok' => true, 'today' => date('Y-m-d'), 'people' => $people]);
    }
    $month = (int) ($_GET['month'] ?? date('n'));
    if ($month < 1 || $month > 12) {
        $month = (int) date('n');
    }
    $count = rows(
        "SELECT COUNT(*) AS n FROM cp_staff WHERE MONTH(stf_dob) = ? AND stf_dob NOT LIKE '0000%'",
        'i',
        [$month]
    );
    $people = rows(
        "SELECT stf_Name, stf_desig, stf_office, stf_dob, stf_Photo
         FROM cp_staff
         WHERE MONTH(stf_dob) = ? AND stf_dob NOT LIKE '0000%'
         ORDER BY DAY(stf_dob), stf_Name
         LIMIT 80",
        'i',
        [$month]
    );
    foreach ($people as &$person) {
        $person['photo'] = $person['stf_Photo'] !== '' ? public_file('staff', (string) $person['stf_Photo']) : '';
        $person['day'] = (int) substr((string) $person['stf_dob'], 8, 2);
    }
    unset($person);
    json_out(['ok' => true, 'month' => $month, 'total' => (int) ($count[0]['n'] ?? 0), 'people' => $people]);
}

function action_phones(): void
{
    $q = trim((string) ($_GET['q'] ?? ''));
    $like = '%' . $q . '%';
    $offices = rows(
        "SELECT of_name, of_headdesig, of_tele, of_tele2, of_fax, of_email, of_addr
         FROM offices
         WHERE of_name LIKE ? OR of_tele LIKE ? OR of_addr LIKE ?
         ORDER BY of_name LIMIT 40",
        'sss',
        [$like, $like, $like]
    );
    $staff = rows(
        "SELECT stf_Name, stf_desig, stf_office, stf_mobile, stf_ofstele, stf_email
         FROM cp_staff
         WHERE stf_Name LIKE ? OR stf_office LIKE ? OR stf_mobile LIKE ?
         ORDER BY stf_Name LIMIT 40",
        'sss',
        [$like, $like, $like]
    );
    json_out(['ok' => true, 'offices' => $offices, 'staff' => $staff]);
}

function action_profile(): void
{
    $nid = trim((string) ($_GET['nid'] ?? ''));
    if ($nid === '') {
        json_out(['ok' => false, 'error' => 'Enter a national ID.'], 422);
    }
    $found = rows('SELECT * FROM cp_staff WHERE stf_Nid = ? LIMIT 1', 's', [$nid]);
    if (!$found) {
        json_out(['ok' => false, 'error' => 'No officer was found for that ID.'], 404);
    }
    $person = $found[0];
    $user = current_user();
    $full = $user && (is_admin($user) || $user['office'] === $person['stf_office'] || $user['role'] === 'Super User');
    $public = [
        'name' => $person['stf_Name'],
        'designation' => $person['stf_desig'],
        'office' => $person['stf_office'],
        'service' => $person['stf_service'],
        'mobile' => $person['stf_mobile'],
        'telephone' => $person['stf_ofstele'],
        'email' => $person['stf_email'],
        'photo' => $person['stf_Photo'] !== '' ? public_file('staff', (string) $person['stf_Photo']) : '',
        'blacklisted' => officer_is_blacklisted($nid) ? 'Yes' : 'No',
        'blacklistUntil' => blacklist_until($nid),
    ];
    if ($full) {
        $public['nid'] = $person['stf_Nid'];
        $public['birth'] = $person['stf_dob'];
        $public['gender'] = $person['stf_sex'];
        $public['class'] = $person['stf_class'];
        $public['subOffice'] = $person['stf_suboff'];
        $public['firstAppointment'] = $person['stf_firstappdate'];
        $public['presentDesignation'] = $person['stf_cdesigdate'];
        $public['blacklisted'] = officer_is_blacklisted($nid) ? 'Yes' : 'No';
        $attended = rows(
            'SELECT tratt_atpname, tratt_startdate, tratt_isparti FROM cp_trainingattendance WHERE tratt_empnid = ? ORDER BY tratt_startdate DESC LIMIT 20',
            's',
            [$nid]
        );
        $public['attendance'] = $attended;
    }
    json_out(['ok' => true, 'profile' => $public, 'full' => $full]);
}

function action_officer_history(): void
{
    $nid = trim((string) ($_GET['nid'] ?? ''));
    if ($nid === '') {
        json_out(['ok' => false, 'error' => 'Enter the officer ID.'], 422);
    }
    $found = rows(
        'SELECT stf_Name, stf_desig, stf_office, stf_Photo FROM cp_staff WHERE stf_Nid = ? LIMIT 1',
        's',
        [$nid]
    );
    if (!$found) {
        json_out(['ok' => false, 'error' => 'No officer was found for that ID.'], 404);
    }
    $person = $found[0];
    $trainings = rows(
        "SELECT a.tratt_atpid AS atp_id, a.tratt_atpname AS name, a.tratt_startdate AS start_date,
                p.atp_location AS location
         FROM cp_trainingattendance a
         LEFT JOIN cp_atp p ON p.atp_id = a.tratt_atpid
         WHERE a.tratt_empnid = ? AND (a.tratt_isparti = 'Yes' OR a.tratt_isparti = ?)
         ORDER BY a.tratt_startdate DESC
         LIMIT 1000",
        'ss',
        [$nid, YES_SI]
    );
    json_out([
        'ok' => true,
        'officer' => [
            'name' => $person['stf_Name'],
            'designation' => $person['stf_desig'],
            'office' => $person['stf_office'],
            'photo' => $person['stf_Photo'] !== '' ? public_file('staff', (string) $person['stf_Photo']) : '',
        ],
        'trainings' => $trainings,
    ]);
}

function signatory_titles(): array
{
    return ['මහතා', 'මහත්මිය', 'මෙනවිය'];
}

function signatory_profile(): array
{
    $rows = rows('SELECT sg_name, sg_title, sg_sign, sg_photo FROM cp_signatory WHERE sg_id = 1 LIMIT 1');
    $row = $rows[0] ?? [];
    $name = trim((string) ($row['sg_name'] ?? ''));
    if ($name === '') {
        $name = 'එස්.එම්.පෙත්තාවඩු';
    }
    $title = trim((string) ($row['sg_title'] ?? ''));
    if (!in_array($title, signatory_titles(), true)) {
        $title = 'මහත්මිය';
    }
    $sign = trim((string) ($row['sg_sign'] ?? ''));
    $photo = trim((string) ($row['sg_photo'] ?? ''));
    return [
        'name' => $name,
        'title' => $title,
        'display' => trim($name . ' ' . $title),
        'file' => $sign,
        'signUrl' => $sign !== '' ? public_file('sign', $sign) : '',
        'photo' => $photo,
        'photoUrl' => $photo !== '' ? public_file('sign', $photo) : '',
    ];
}

function signatory_public(): array
{
    $profile = signatory_profile();
    return [
        'name' => $profile['name'],
        'title' => $profile['title'],
        'display' => $profile['display'],
        'photoUrl' => $profile['photoUrl'],
    ];
}

function letter_signatory(): array
{
    $profile = signatory_profile();
    return [
        'signName' => $profile['display'],
        'signUrl' => $profile['signUrl'],
    ];
}

function letter_selected_date(array $application): string
{
    $date = substr(trim((string) ($application['tapp_selecteddate'] ?? '')), 0, 10);
    if ($date === '' || str_starts_with($date, '0000') || str_starts_with($date, '1111')) {
        return '';
    }
    return $date;
}

function blacklist_until(string $nid): string
{
    $today = date('Y-m-d');
    $found = rows(
        'SELECT bl_until FROM cp_blacklist WHERE bl_nid = ? AND bl_until >= ? ORDER BY bl_until DESC LIMIT 1',
        'ss',
        [$nid, $today]
    );
    if (!$found) {
        return '';
    }
    return substr((string) $found[0]['bl_until'], 0, 10);
}

function officer_is_blacklisted(string $nid): bool
{
    return blacklist_until($nid) !== '';
}

function blacklist_apply_error(string $nid): string
{
    $until = blacklist_until($nid);
    if ($until === '') {
        return '';
    }
    return 'මේ නිලධාරියා අසාදු ලේඛනයේ ඉන්නවා. ' . $until . ' දක්වා කිසිම ගිණුමකින් කිසිම පුහුණුවකට අයදුම් කළ නොහැක.';
}

function action_blacklist(): void
{
    $user = require_user();
    if (!is_super($user)) {
        json_out(['ok' => false, 'error' => 'මෙය බලන්න පුළුවන් පුහුණු කාර්ය මණ්ඩලයට පමණයි.'], 403);
    }
    $today = date('Y-m-d');
    $year = (int) ($_GET['year'] ?? 0);
    if ($year < 1990 || $year > 2100) {
        $year = (int) date('Y');
    }
    $items = rows(
        'SELECT bl_nid, bl_name, bl_reason, bl_from, bl_until FROM cp_blacklist WHERE bl_until >= ? AND LEFT(bl_from, 4) = ? ORDER BY bl_from DESC, bl_name',
        'ss',
        [$today, (string) $year]
    );
    $years = rows('SELECT DISTINCT LEFT(bl_from, 4) AS year FROM cp_blacklist WHERE bl_until >= ? ORDER BY year DESC', 's', [$today]);
    $list = array_map(static fn(array $row): int => (int) $row['year'], $years);
    if (!in_array((int) date('Y'), $list, true)) {
        $list[] = (int) date('Y');
    }
    rsort($list);
    json_out(['ok' => true, 'year' => $year, 'years' => $list, 'items' => $items]);
}

function action_blacklist_add(): void
{
    csrf_check();
    $user = require_user();
    if (!is_super($user)) {
        json_out(['ok' => false, 'error' => 'මෙය සුරකින්න පුළුවන් පුහුණු කාර්ය මණ්ඩලයට පමණයි.'], 403);
    }
    $data = body();
    $nid = trim((string) ($data['nid'] ?? ''));
    $reason = mb_substr(trim((string) ($data['reason'] ?? '')), 0, 500);
    if ($nid === '') {
        json_out(['ok' => false, 'error' => 'ජාතික හැඳුනුම්පත් අංකය දෙන්න.'], 422);
    }
    if ($reason === '') {
        json_out(['ok' => false, 'error' => 'අසාදු ලේඛනගත කිරීමට හේතුව දෙන්න.'], 422);
    }
    $staff = rows('SELECT stf_Name FROM cp_staff WHERE stf_Nid = ? LIMIT 1', 's', [$nid]);
    if (!$staff || trim((string) $staff[0]['stf_Name']) === '') {
        json_out(['ok' => false, 'error' => 'ඒ අංකයට නිලධාරියෙක් හමු නොවුණා.'], 404);
    }
    if (officer_is_blacklisted($nid)) {
        json_out(['ok' => false, 'error' => 'මේ නිලධාරියා දැනටමත් අසාදු ලේඛනයේ ඉන්නවා.'], 422);
    }
    $name = trim((string) $staff[0]['stf_Name']);
    $from = date('Y-m-d');
    $until = date('Y-m-d', strtotime($from . ' +3 months'));
    $stmt = db()->prepare('INSERT INTO cp_blacklist (bl_nid, bl_name, bl_reason, bl_from, bl_until) VALUES (?, ?, ?, ?, ?)');
    $ok = $stmt && $stmt->bind_param('sssss', $nid, $name, $reason, $from, $until) && $stmt->execute();
    if (!$ok) {
        json_out(['ok' => false, 'error' => 'සුරැකිය නොහැකි විය.'], 500);
    }
    $yes = 'Yes';
    $mark = db()->prepare('UPDATE cp_staff SET stf_blacklisted = ? WHERE stf_Nid = ?');
    if ($mark) {
        $mark->bind_param('ss', $yes, $nid);
        $mark->execute();
    }
    json_out(['ok' => true, 'from' => $from, 'until' => $until]);
}

function gemini_account(): array
{
    return [
        'email' => 'nwptrainingunit@gmail.com',
        'password' => '03722220182024',
    ];
}

function module_staff(): void
{
    $user = require_user();
    if (!is_super($user)) {
        json_out(['ok' => false, 'error' => 'මෙය පුහුණු කාර්ය මණ්ඩලයට පමණයි.'], 403);
    }
}

function module_file_name(string $name): string
{
    $name = basename(str_replace('\\', '/', trim($name)));
    if ($name === '' || $name === '.' || $name === '..') {
        return '';
    }
    $ext = strtolower(pathinfo($name, PATHINFO_EXTENSION));
    if (!in_array($ext, ['pdf', 'doc', 'docx'], true)) {
        return '';
    }
    return $name;
}

function module_days(int $id): array
{
    $rows = rows('SELECT dy_no, dy_title, dy_body FROM cp_moduledays WHERE dy_module = ? ORDER BY dy_no, dy_id', 'i', [$id]);
    $days = [];
    foreach ($rows as $row) {
        $days[] = [
            'no' => (int) $row['dy_no'],
            'title' => (string) $row['dy_title'],
            'body' => (string) $row['dy_body'],
        ];
    }
    return $days;
}

function module_person(string $value): array
{
    static $cache = [];
    $value = trim($value);
    $empty = ['name' => '', 'post' => '', 'office' => ''];
    if ($value === '') {
        return $empty;
    }
    if (isset($cache[$value])) {
        return $cache[$value];
    }
    $staff = rows('SELECT stf_Name, stf_desig, stf_office FROM cp_staff WHERE stf_Nid = ? LIMIT 1', 's', [$value]);
    if ($staff) {
        $cache[$value] = [
            'name' => trim((string) $staff[0]['stf_Name']),
            'post' => trim((string) $staff[0]['stf_desig']),
            'office' => trim((string) $staff[0]['stf_office']),
        ];
        return $cache[$value];
    }
    $cache[$value] = ['name' => $value, 'post' => '', 'office' => ''];
    return $cache[$value];
}

function module_sheet_fields(array $item): array
{
    $liaison = module_person((string) ($item['liaisonNid'] ?? ''));
    $supervisor = module_person((string) ($item['supervisorNid'] ?? ''));
    $people = [];
    foreach ((array) ($item['people'] ?? []) as $name) {
        $name = trim((string) $name);
        if ($name !== '') {
            $people[] = $name;
        }
    }
    return [
        'liaison' => $liaison,
        'supervisor' => $supervisor['name'],
        'supervisorPost' => $supervisor['post'],
        'people' => $people,
        'lecturers' => module_lecturers($people),
    ];
}

function module_lecturers(array $names): array
{
    $out = [];
    $seen = [];
    foreach ($names as $name) {
        $name = trim((string) $name);
        if ($name === '' || isset($seen[$name])) {
            continue;
        }
        $seen[$name] = true;
        $found = rows('SELECT rp_name, rp_desig, rp_office FROM cp_resourcepersons WHERE rp_name = ? LIMIT 1', 's', [$name]);
        if ($found) {
            $out[] = [
                'name' => trim((string) $found[0]['rp_name']) !== '' ? trim((string) $found[0]['rp_name']) : $name,
                'post' => trim((string) $found[0]['rp_desig']),
                'office' => trim((string) $found[0]['rp_office']),
            ];
        } else {
            $out[] = ['name' => $name, 'post' => '', 'office' => ''];
        }
    }
    return $out;
}

function module_sheet_for(int $atp): array
{
    $sheet = [
        'name' => '',
        'place' => '',
        'target' => '',
        'dates' => [],
        'days' => 1,
        'liaison' => ['name' => '', 'post' => '', 'office' => ''],
        'supervisor' => '',
        'supervisorPost' => '',
        'people' => [],
        'lecturers' => [],
        'stime' => '',
        'etime' => '',
        'coordinator' => signatory_profile()['display'],
        'coordinatorPost' => 'නියෝජ්‍ය ප්‍රධාන ලේකම් (පුහුණු)',
    ];
    if ($atp < 1) {
        return $sheet;
    }
    foreach (saved_estimate_items() as $item) {
        if ((int) $item['id'] !== $atp) {
            continue;
        }
        $sheet['name'] = (string) $item['name'];
        $sheet['place'] = (string) ($item['place'] ?? '');
        $sheet['target'] = (string) ($item['target'] ?? '');
        $sheet['dates'] = $item['dates'] ?? [];
        $sheet['days'] = (int) ($item['dayCount'] ?? 1);
        $extra = module_sheet_fields($item);
        $sheet['liaison'] = $extra['liaison'];
        $sheet['supervisor'] = $extra['supervisor'];
        $sheet['supervisorPost'] = $extra['supervisorPost'];
        $sheet['people'] = $extra['people'];
        $sheet['lecturers'] = $extra['lecturers'];
        $sheet['stime'] = (string) ($item['stime'] ?? '');
        $sheet['etime'] = (string) ($item['etime'] ?? '');
        break;
    }
    return $sheet;
}

function action_modules(): void
{
    module_staff();
    $items = [];
    $linked = [];
    foreach (rows('SELECT md_id, md_title, md_file, md_saved, md_atp FROM cp_modules ORDER BY md_id DESC') as $row) {
        $id = (int) $row['md_id'];
        $file = module_file_name((string) $row['md_file']);
        $atp = (int) ($row['md_atp'] ?? 0);
        $items[] = [
            'id' => $id,
            'title' => (string) $row['md_title'],
            'atp' => $atp,
            'file' => $file,
            'fileUrl' => $file !== '' ? 'modules/' . rawurlencode($file) : '',
            'saved' => (string) $row['md_saved'],
            'days' => count(module_days($id)),
        ];
        if ($atp > 0) {
            $linked[$atp] = $id;
        }
    }
    $programmes = [];
    foreach (saved_estimate_items() as $item) {
        if (!empty($item['offweb']) || trim((string) $item['name']) === '') {
            continue;
        }
        $extra = module_sheet_fields($item);
        $programmes[] = [
            'id' => (int) $item['id'],
            'name' => (string) $item['name'],
            'day' => (string) $item['day'],
            'end' => (string) $item['end'],
            'place' => (string) $item['place'],
            'office' => (string) ($item['office'] ?? ''),
            'target' => (string) ($item['target'] ?? ''),
            'time' => (string) ($item['time'] ?? ''),
            'dates' => $item['dates'] ?? [],
            'days' => (int) $item['dayCount'],
            'liaison' => $extra['liaison'],
            'supervisor' => $extra['supervisor'],
            'supervisorPost' => $extra['supervisorPost'],
            'people' => $extra['people'],
            'lecturers' => $extra['lecturers'],
            'stime' => (string) ($item['stime'] ?? ''),
            'etime' => (string) ($item['etime'] ?? ''),
            'module' => (int) ($linked[(int) $item['id']] ?? 0),
        ];
    }
    $leader = signatory_profile();
    json_out(['ok' => true, 'items' => $items, 'programmes' => $programmes, 'coordinator' => $leader['display'], 'coordinatorPost' => 'නියෝජ්‍ය ප්‍රධාන ලේකම් (පුහුණු)', 'gemini' => gemini_account()]);
}

function action_module(): void
{
    module_staff();
    $id = (int) ($_GET['id'] ?? 0);
    $found = rows('SELECT md_id, md_title, md_file, md_saved, md_atp FROM cp_modules WHERE md_id = ? LIMIT 1', 'i', [$id]);
    if (!$found) {
        json_out(['ok' => false, 'error' => 'මොඩියුලය හමු නොවුණා.'], 404);
    }
    $row = $found[0];
    $file = module_file_name((string) $row['md_file']);
    json_out([
        'ok' => true,
        'id' => (int) $row['md_id'],
        'title' => (string) $row['md_title'],
        'file' => $file,
        'fileUrl' => $file !== '' ? 'modules/' . rawurlencode($file) : '',
        'saved' => (string) $row['md_saved'],
        'atp' => (int) ($row['md_atp'] ?? 0),
        'days' => module_days($id),
        'sheet' => module_sheet_for((int) ($row['md_atp'] ?? 0)),
        'coordinator' => signatory_profile()['display'],
        'gemini' => gemini_account(),
    ]);
}

function action_module_save(): void
{
    csrf_check();
    module_staff();
    $data = body();
    $id = (int) ($data['id'] ?? 0);
    $title = trim((string) ($data['title'] ?? ''));
    if (function_exists('mb_substr')) {
        $title = mb_substr($title, 0, 250);
    } else {
        $title = substr($title, 0, 250);
    }
    if ($title === '') {
        json_out(['ok' => false, 'error' => 'මොඩියුලයේ නම දෙන්න.'], 422);
    }
    $atp = (int) ($data['atp'] ?? 0);
    $existing = $id > 0 ? rows('SELECT md_file, md_atp FROM cp_modules WHERE md_id = ? LIMIT 1', 'i', [$id]) : [];
    if (!$existing && $id > 0) {
        json_out(['ok' => false, 'error' => 'මොඩියුලය හමු නොවුණා.'], 404);
    }
    $file = $existing ? module_file_name((string) $existing[0]['md_file']) : '';
    if ($atp < 1 && $existing) {
        $atp = (int) $existing[0]['md_atp'];
    }
    if (!array_key_exists('days', $data)) {
        json_out(['ok' => false, 'error' => 'මොඩියුලය මෙම ආකෘතියෙන් පමණයි. Gemini එකෙන් හදපු මොඩියුලයක් සුරකින්න බැහැ.'], 422);
    }
    $touchDays = true;
    $days = [];
    foreach ((array) $data['days'] as $day) {
        if (!is_array($day)) {
            continue;
        }
        $dayTitle = trim((string) ($day['title'] ?? ''));
        $body = trim((string) ($day['body'] ?? ''));
        $parsed = json_decode($body, true);
        if (!is_array($parsed) || !isset($parsed['sessions']) || !is_array($parsed['sessions'])) {
            json_out(['ok' => false, 'error' => 'මොඩියුලය මෙම ආකෘතියෙන් පමණයි. Gemini එකෙන් හදපු මොඩියුලයක් සුරකින්න බැහැ.'], 422);
        }
        $sessions = [];
        foreach ($parsed['sessions'] as $session) {
            if (!is_array($session)) {
                continue;
            }
            $sessions[] = [
                'time' => trim((string) ($session['time'] ?? '')),
                'session' => trim((string) ($session['session'] ?? '')),
                'lecturer' => trim((string) ($session['lecturer'] ?? '')),
                'points' => trim((string) ($session['points'] ?? '')),
            ];
            if (count($sessions) >= 40) {
                break;
            }
        }
        $clean = json_encode([
            'date' => trim((string) ($parsed['date'] ?? '')),
            'sessions' => $sessions,
        ], JSON_UNESCAPED_UNICODE);
        if (!is_string($clean)) {
            json_out(['ok' => false, 'error' => 'මොඩියුලය සුරකින්න බැරි වුණා.'], 422);
        }
        if (function_exists('mb_substr')) {
            $dayTitle = mb_substr($dayTitle, 0, 250);
            $clean = mb_substr($clean, 0, 20000);
        }
        $days[] = ['title' => $dayTitle, 'body' => $clean];
        if (count($days) >= 60) {
            break;
        }
    }
    if (!$days) {
        json_out(['ok' => false, 'error' => 'පුහුණුවක් තෝරන්න.'], 422);
    }
    $today = date('Y-m-d');
    if ($existing) {
        $stmt = db()->prepare('UPDATE cp_modules SET md_title = ?, md_file = ?, md_saved = ?, md_atp = ? WHERE md_id = ?');
        if (!$stmt || !$stmt->bind_param('sssii', $title, $file, $today, $atp, $id) || !$stmt->execute()) {
            json_out(['ok' => false, 'error' => 'මොඩියුලය සුරකින්න බැරි වුණා.'], 500);
        }
    } else {
        $stmt = db()->prepare('INSERT INTO cp_modules (md_title, md_file, md_saved, md_atp) VALUES (?, ?, ?, ?)');
        if (!$stmt || !$stmt->bind_param('sssi', $title, $file, $today, $atp) || !$stmt->execute()) {
            json_out(['ok' => false, 'error' => 'මොඩියුලය සුරකින්න බැරි වුණා.'], 500);
        }
        $id = (int) db()->insert_id;
    }
    if ($touchDays) {
        $drop = db()->prepare('DELETE FROM cp_moduledays WHERE dy_module = ?');
        if ($drop) {
            $drop->bind_param('i', $id);
            $drop->execute();
        }
        $add = db()->prepare('INSERT INTO cp_moduledays (dy_module, dy_no, dy_title, dy_body) VALUES (?, ?, ?, ?)');
        foreach ($days as $index => $day) {
            $no = $index + 1;
            $dayTitle = $day['title'];
            $dayBody = $day['body'];
            if ($add) {
                $add->bind_param('iiss', $id, $no, $dayTitle, $dayBody);
                $add->execute();
            }
        }
    }
    json_out(['ok' => true, 'id' => $id]);
}

function action_module_excel(): void
{
    csrf_check();
    module_staff();
    if (!isset($_FILES['file']) || !is_uploaded_file($_FILES['file']['tmp_name'])) {
        json_out(['ok' => false, 'error' => 'Excel ගොනුව තෝරන්න.'], 422);
    }
    if (($_FILES['file']['size'] ?? 0) > 4 * 1024 * 1024) {
        json_out(['ok' => false, 'error' => 'ගොනුව විශාල වැඩිය.'], 422);
    }
    $rows = read_sheet($_FILES['file']['tmp_name'], (string) $_FILES['file']['name']);
    $grouped = [];
    $hasLecturer = false;
    foreach ($rows as $line) {
        if (!is_array($line)) {
            continue;
        }
        $cells = [];
        foreach ($line as $value) {
            $cells[] = trim((string) $value);
        }
        $dayCell = $cells[0] ?? '';
        if ($dayCell === 'දිනය' || strcasecmp($dayCell, 'day') === 0) {
            $hasLecturer = str_contains(implode(' ', $cells), 'දේශක');
            continue;
        }
        if ($dayCell === '') {
            continue;
        }
        if (!preg_match('/\d+/', $dayCell, $match)) {
            continue;
        }
        $no = (int) $match[0];
        if ($no < 1 || $no > 60) {
            continue;
        }
        $time = $cells[1] ?? '';
        $session = $cells[2] ?? '';
        $lecturer = $hasLecturer ? ($cells[3] ?? '') : '';
        $points = $hasLecturer ? ($cells[4] ?? '') : ($cells[3] ?? '');
        if ($time === '' && $session === '' && $lecturer === '' && $points === '') {
            continue;
        }
        $grouped[$no][] = ['time' => $time, 'session' => $session, 'lecturer' => $lecturer, 'points' => $points];
    }
    if (!$grouped) {
        json_out(['ok' => false, 'error' => 'Excel ආකෘතියේ සැසි පේළි හමු නොවුණා. බාගත කළ ආකෘතිය පුරවන්න.'], 422);
    }
    $days = [];
    foreach ($grouped as $no => $sessions) {
        $days[] = ['no' => (int) $no, 'sessions' => $sessions];
    }
    json_out(['ok' => true, 'days' => $days]);
}

function eval_staff(): void
{
    $user = require_user();
    if (!is_super($user)) {
        json_out(['ok' => false, 'error' => 'මෙය පුහුණු කාර්ය මණ්ඩලයට පමණයි.'], 403);
    }
}

function eval_clip(string $value, int $max): string
{
    $value = trim($value);
    if (function_exists('mb_substr')) {
        return mb_substr($value, 0, $max);
    }
    return substr($value, 0, $max);
}

function eval_kind(string $kind): string
{
    return $kind === 'post' ? 'post' : 'pre';
}

function eval_questions(int $id, bool $withCorrect): array
{
    $out = [];
    foreach (rows('SELECT eq_no, eq_text, eq_a, eq_b, eq_c, eq_d, eq_correct FROM cp_evalq WHERE eq_eval = ? ORDER BY eq_no, eq_id', 'i', [$id]) as $row) {
        $item = [
            'no' => (int) $row['eq_no'],
            'text' => (string) $row['eq_text'],
            'a' => (string) $row['eq_a'],
            'b' => (string) $row['eq_b'],
            'c' => (string) $row['eq_c'],
            'd' => (string) $row['eq_d'],
        ];
        if ($withCorrect) {
            $item['correct'] = (string) $row['eq_correct'];
        }
        $out[] = $item;
    }
    return $out;
}

function eval_by_token(string $token): array
{
    $token = strtolower(preg_replace('/[^a-f0-9]/', '', $token) ?? '');
    if (strlen($token) < 8) {
        json_out(['ok' => false, 'error' => 'මේ සබැඳිය වැරදියි.'], 404);
    }
    $found = rows('SELECT ev_id, ev_atp, ev_title, ev_token FROM cp_eval WHERE ev_token = ? LIMIT 1', 's', [$token]);
    if (!$found) {
        json_out(['ok' => false, 'error' => 'මේ සබැඳිය වැරදියි.'], 404);
    }
    return $found[0];
}

function eval_try_row(int $eval, string $kind, string $nid): array
{
    $found = rows('SELECT et_id, et_name, et_score, et_done FROM cp_evaltry WHERE et_eval = ? AND et_kind = ? AND et_nid = ? LIMIT 1', 'iss', [$eval, $kind, $nid]);
    return $found[0] ?? [];
}

function eval_review(int $tryId, int $eval, bool $showCorrect): array
{
    $answers = rows('SELECT ea_no, ea_choice, ea_ok FROM cp_evalans WHERE ea_try = ? ORDER BY ea_no', 'i', [$tryId]);
    $byNo = [];
    foreach ($answers as $answer) {
        $byNo[(int) $answer['ea_no']] = $answer;
    }
    $review = [];
    foreach (eval_questions($eval, true) as $question) {
        $answer = $byNo[$question['no']] ?? null;
        $item = [
            'no' => $question['no'],
            'text' => $question['text'],
            'choice' => $answer ? (string) $answer['ea_choice'] : '',
            'ok' => $answer && (int) $answer['ea_ok'] === 1,
        ];
        if ($showCorrect) {
            $item['correct'] = $question['correct'];
            $item['a'] = $question['a'];
            $item['b'] = $question['b'];
            $item['c'] = $question['c'];
            $item['d'] = $question['d'];
        }
        $review[] = $item;
    }
    return $review;
}

function action_eval_get(): void
{
    eval_staff();
    $atp = (int) ($_GET['atp'] ?? 0);
    $programmes = [];
    foreach (rows("SELECT atp_id, atp_trname, atp_day1 FROM cp_atp WHERE TRIM(atp_trname) <> '' ORDER BY atp_id DESC LIMIT 300") as $row) {
        $programmes[] = [
            'id' => (int) $row['atp_id'],
            'name' => (string) $row['atp_trname'],
            'day' => substr((string) $row['atp_day1'], 0, 10),
        ];
    }
    $imports = [];
    foreach (rows('SELECT e.ev_id, e.ev_title, e.ev_atp, MIN(a.atp_day1) AS day, COUNT(q.eq_id) AS n FROM cp_eval e INNER JOIN cp_evalq q ON q.eq_eval = e.ev_id LEFT JOIN cp_atp a ON a.atp_id = e.ev_atp GROUP BY e.ev_id, e.ev_title, e.ev_atp ORDER BY e.ev_id DESC LIMIT 100') as $row) {
        $imports[] = [
            'id' => (int) $row['ev_id'],
            'title' => (string) $row['ev_title'],
            'day' => substr((string) ($row['day'] ?? ''), 0, 10),
            'count' => (int) $row['n'],
        ];
    }
    $eval = ['id' => 0, 'token' => '', 'title' => '', 'questions' => []];
    if ($atp > 0) {
        $found = rows('SELECT ev_id, ev_title, ev_token FROM cp_eval WHERE ev_atp = ? LIMIT 1', 'i', [$atp]);
        if ($found) {
            $eval = [
                'id' => (int) $found[0]['ev_id'],
                'token' => (string) $found[0]['ev_token'],
                'title' => (string) $found[0]['ev_title'],
                'questions' => eval_questions((int) $found[0]['ev_id'], true),
            ];
        }
    }
    $copyId = (int) ($_GET['copy'] ?? 0);
    json_out([
        'ok' => true,
        'atp' => $atp,
        'programmes' => $programmes,
        'imports' => $imports,
        'eval' => $eval,
        'copy' => $copyId > 0 ? eval_questions($copyId, true) : [],
        'gemini' => gemini_account(),
    ]);
}

function action_eval_save(): void
{
    csrf_check();
    eval_staff();
    $data = body();
    $atp = (int) ($data['atp'] ?? 0);
    $plan = rows('SELECT atp_id, atp_trname FROM cp_atp WHERE atp_id = ? LIMIT 1', 'i', [$atp]);
    $title = trim((string) ($plan[0]['atp_trname'] ?? ''));
    if ($title === '') {
        json_out(['ok' => false, 'error' => 'පුහුණු වැඩසටහන තෝරන්න.'], 422);
    }
    $title = eval_clip($title, 250);
    $questions = [];
    foreach ((array) ($data['questions'] ?? []) as $index => $question) {
        if (!is_array($question)) {
            continue;
        }
        $correct = strtoupper(trim((string) ($question['correct'] ?? '')));
        $item = [
            'text' => eval_clip((string) ($question['text'] ?? ''), 2000),
            'a' => eval_clip((string) ($question['a'] ?? ''), 500),
            'b' => eval_clip((string) ($question['b'] ?? ''), 500),
            'c' => eval_clip((string) ($question['c'] ?? ''), 500),
            'd' => eval_clip((string) ($question['d'] ?? ''), 500),
            'correct' => $correct,
        ];
        if ($item['text'] === '' || $item['a'] === '' || $item['b'] === '' || $item['c'] === '' || $item['d'] === '' || !in_array($correct, ['A', 'B', 'C', 'D'], true)) {
            json_out(['ok' => false, 'error' => 'ප්‍රශ්න 10ටම ප්‍රශ්නය, උත්තර 4 සහ නිවැරදි උත්තරය දෙන්න.'], 422);
        }
        $questions[] = $item;
        if (count($questions) >= 10) {
            break;
        }
    }
    if (count($questions) !== 10) {
        json_out(['ok' => false, 'error' => 'ප්‍රශ්න 10ක් දෙන්න.'], 422);
    }
    $existing = rows('SELECT ev_id, ev_token FROM cp_eval WHERE ev_atp = ? LIMIT 1', 'i', [$atp]);
    $today = date('Y-m-d');
    if ($existing) {
        $id = (int) $existing[0]['ev_id'];
        $stmt = db()->prepare('UPDATE cp_eval SET ev_title = ?, ev_saved = ? WHERE ev_id = ?');
        if (!$stmt || !$stmt->bind_param('ssi', $title, $today, $id) || !$stmt->execute()) {
            json_out(['ok' => false, 'error' => 'ප්‍රශ්න සුරකින්න බැරි වුණා.'], 500);
        }
    } else {
        $token = bin2hex(random_bytes(8));
        $stmt = db()->prepare('INSERT INTO cp_eval (ev_atp, ev_title, ev_token, ev_saved) VALUES (?, ?, ?, ?)');
        if (!$stmt || !$stmt->bind_param('isss', $atp, $title, $token, $today) || !$stmt->execute()) {
            json_out(['ok' => false, 'error' => 'ප්‍රශ්න සුරකින්න බැරි වුණා.'], 500);
        }
        $id = (int) db()->insert_id;
    }
    $drop = db()->prepare('DELETE FROM cp_evalq WHERE eq_eval = ?');
    if ($drop) {
        $drop->bind_param('i', $id);
        $drop->execute();
    }
    $add = db()->prepare('INSERT INTO cp_evalq (eq_eval, eq_no, eq_text, eq_a, eq_b, eq_c, eq_d, eq_correct) VALUES (?, ?, ?, ?, ?, ?, ?, ?)');
    foreach ($questions as $index => $question) {
        $no = $index + 1;
        $text = $question['text'];
        $a = $question['a'];
        $b = $question['b'];
        $c = $question['c'];
        $d = $question['d'];
        $correct = $question['correct'];
        if ($add) {
            $add->bind_param('iissssss', $id, $no, $text, $a, $b, $c, $d, $correct);
            $add->execute();
        }
    }
    json_out(['ok' => true, 'id' => $id, 'atp' => $atp]);
}

function eval_people(int $id, string $kind): array
{
    $people = [];
    foreach (rows('SELECT et_id, et_nid, et_name, et_score, et_done FROM cp_evaltry WHERE et_eval = ? AND et_kind = ? ORDER BY et_score DESC, et_name', 'is', [$id, $kind]) as $try) {
        $tryId = (int) $try['et_id'];
        $answers = [];
        foreach (rows('SELECT ea_no, ea_choice, ea_ok, ea_at FROM cp_evalans WHERE ea_try = ? ORDER BY ea_at, ea_no', 'i', [$tryId]) as $answer) {
            $answers[] = [
                'no' => (int) $answer['ea_no'],
                'choice' => (string) $answer['ea_choice'],
                'ok' => (int) $answer['ea_ok'] === 1,
                'at' => (string) $answer['ea_at'],
            ];
        }
        $done = (string) $try['et_done'];
        $people[] = [
            'name' => (string) $try['et_name'],
            'nid' => (string) $try['et_nid'],
            'score' => (int) $try['et_score'],
            'done' => $done !== '' && !str_starts_with($done, '0000'),
            'answers' => $answers,
        ];
    }
    return $people;
}

function eval_can_reveal(int $id, string $kind, bool $force): bool
{
    if ($kind !== 'post') {
        return false;
    }
    if ($force) {
        return true;
    }
    $rows = rows('SELECT et_done FROM cp_evaltry WHERE et_eval = ? AND et_kind = ?', 'is', [$id, $kind]);
    if (!$rows) {
        return false;
    }
    foreach ($rows as $row) {
        $done = (string) $row['et_done'];
        if ($done === '' || str_starts_with($done, '0000')) {
            return false;
        }
    }
    return true;
}

function action_eval_live(): void
{
    eval_staff();
    $id = (int) ($_GET['id'] ?? 0);
    $kind = eval_kind((string) ($_GET['kind'] ?? 'pre'));
    $found = rows('SELECT ev_id, ev_title FROM cp_eval WHERE ev_id = ? LIMIT 1', 'i', [$id]);
    if (!$found) {
        json_out(['ok' => false, 'error' => 'ඇගයීම හමු නොවුණා.'], 404);
    }
    $reveal = eval_can_reveal($id, $kind, (string) ($_GET['reveal'] ?? '') === '1');
    json_out([
        'ok' => true,
        'title' => (string) $found[0]['ev_title'],
        'kind' => $kind,
        'reveal' => $reveal,
        'questions' => eval_questions($id, $reveal),
        'people' => eval_people($id, $kind),
    ]);
}

function action_eval_report(): void
{
    eval_staff();
    $id = (int) ($_GET['id'] ?? 0);
    $found = rows('SELECT ev_id, ev_title FROM cp_eval WHERE ev_id = ? LIMIT 1', 'i', [$id]);
    if (!$found) {
        json_out(['ok' => false, 'error' => 'ඇගයීම හමු නොවුණා.'], 404);
    }
    $byNid = [];
    foreach (eval_people($id, 'pre') as $person) {
        $byNid[$person['nid']] = ['name' => $person['name'], 'nid' => $person['nid'], 'pre' => $person['score'], 'post' => null];
    }
    foreach (eval_people($id, 'post') as $person) {
        if (!isset($byNid[$person['nid']])) {
            $byNid[$person['nid']] = ['name' => $person['name'], 'nid' => $person['nid'], 'pre' => null, 'post' => $person['score']];
        } else {
            $byNid[$person['nid']]['post'] = $person['score'];
            $byNid[$person['nid']]['name'] = $person['name'];
        }
    }
    $items = [];
    foreach ($byNid as $person) {
        $pre = $person['pre'];
        $post = $person['post'];
        $diff = ($pre === null || $post === null) ? null : $post - $pre;
        $change = '';
        if ($diff !== null) {
            $change = $diff > 0 ? 'up' : ($diff < 0 ? 'down' : 'same');
        }
        $items[] = [
            'name' => $person['name'],
            'nid' => $person['nid'],
            'pre' => $pre,
            'post' => $post,
            'diff' => $diff,
            'change' => $change,
        ];
    }
    usort($items, static function (array $a, array $b): int {
        return strcmp((string) $a['name'], (string) $b['name']);
    });
    json_out(['ok' => true, 'title' => (string) $found[0]['ev_title'], 'items' => $items]);
}

function action_eval_open(): void
{
    $row = eval_by_token((string) ($_GET['token'] ?? ''));
    $kind = eval_kind((string) ($_GET['kind'] ?? 'pre'));
    $questions = eval_questions((int) $row['ev_id'], false);
    if (count($questions) < 10) {
        json_out(['ok' => false, 'error' => 'ප්‍රශ්න තව සූදානම් නැත.'], 422);
    }
    json_out([
        'ok' => true,
        'title' => (string) $row['ev_title'],
        'kind' => $kind,
        'questions' => $questions,
    ]);
}

function action_eval_who(): void
{
    eval_by_token((string) ($_GET['token'] ?? ''));
    $nid = trim((string) ($_GET['nid'] ?? ''));
    if ($nid === '') {
        json_out(['ok' => false, 'error' => 'ජාතික හැඳුනුම්පත් අංකය දෙන්න.'], 422);
    }
    $staff = rows('SELECT stf_Name FROM cp_staff WHERE stf_Nid = ? LIMIT 1', 's', [$nid]);
    if (!$staff || trim((string) $staff[0]['stf_Name']) === '') {
        json_out(['ok' => false, 'error' => 'මේ අංකයෙන් නිලධාරියෙක් නැත.'], 404);
    }
    json_out(['ok' => true, 'name' => (string) $staff[0]['stf_Name']]);
}

function action_eval_state(): void
{
    $row = eval_by_token((string) ($_GET['token'] ?? ''));
    $kind = eval_kind((string) ($_GET['kind'] ?? 'pre'));
    $nid = trim((string) ($_GET['nid'] ?? ''));
    $try = $nid === '' ? [] : eval_try_row((int) $row['ev_id'], $kind, $nid);
    $answered = [];
    if ($try) {
        foreach (rows('SELECT ea_no, ea_choice FROM cp_evalans WHERE ea_try = ? ORDER BY ea_no', 'i', [(int) $try['et_id']]) as $answer) {
            $answered[] = ['no' => (int) $answer['ea_no'], 'choice' => (string) $answer['ea_choice']];
        }
    }
    $doneRaw = (string) ($try['et_done'] ?? '');
    $done = $try && $doneRaw !== '' && !str_starts_with($doneRaw, '0000');
    $review = [];
    if ($done && $kind === 'post') {
        $review = eval_review((int) $try['et_id'], (int) $row['ev_id'], true);
    }
    json_out([
        'ok' => true,
        'name' => (string) ($try['et_name'] ?? ''),
        'score' => (int) ($try['et_score'] ?? 0),
        'done' => $done,
        'answered' => $answered,
        'review' => $review,
    ]);
}

function action_eval_answer(): void
{
    csrf_check();
    $data = body();
    $row = eval_by_token((string) ($data['token'] ?? ''));
    $kind = eval_kind((string) ($data['kind'] ?? 'pre'));
    $nid = trim((string) ($data['nid'] ?? ''));
    $no = (int) ($data['no'] ?? 0);
    $choice = strtoupper(trim((string) ($data['choice'] ?? '')));
    if ($nid === '' || $no < 1 || $no > 10 || !in_array($choice, ['A', 'B', 'C', 'D'], true)) {
        json_out(['ok' => false, 'error' => 'උත්තරය තෝරන්න.'], 422);
    }
    $staff = rows('SELECT stf_Name FROM cp_staff WHERE stf_Nid = ? LIMIT 1', 's', [$nid]);
    $name = trim((string) ($staff[0]['stf_Name'] ?? ''));
    if ($name === '') {
        json_out(['ok' => false, 'error' => 'මේ අංකයෙන් නිලධාරියෙක් නැත.'], 404);
    }
    $eval = (int) $row['ev_id'];
    $question = rows('SELECT eq_correct FROM cp_evalq WHERE eq_eval = ? AND eq_no = ? LIMIT 1', 'ii', [$eval, $no]);
    if (!$question) {
        json_out(['ok' => false, 'error' => 'ප්‍රශ්න තව සූදානම් නැත.'], 422);
    }
    $try = eval_try_row($eval, $kind, $nid);
    if (!$try) {
        $zero = 0;
        $stmt = db()->prepare('INSERT INTO cp_evaltry (et_eval, et_kind, et_nid, et_name, et_score) VALUES (?, ?, ?, ?, ?)');
        if (!$stmt || !$stmt->bind_param('isssi', $eval, $kind, $nid, $name, $zero) || !$stmt->execute()) {
            json_out(['ok' => false, 'error' => 'උත්තරය සුරකින්න බැරි වුණා.'], 500);
        }
        $try = eval_try_row($eval, $kind, $nid);
    }
    $tryId = (int) ($try['et_id'] ?? 0);
    if ($tryId < 1) {
        json_out(['ok' => false, 'error' => 'උත්තරය සුරකින්න බැරි වුණා.'], 500);
    }
    $already = rows('SELECT ea_id FROM cp_evalans WHERE ea_try = ? AND ea_no = ? LIMIT 1', 'ii', [$tryId, $no]);
    if (!$already) {
        $ok = strtoupper((string) $question[0]['eq_correct']) === $choice ? 1 : 0;
        $at = date('Y-m-d H:i:s');
        $stmt = db()->prepare('INSERT INTO cp_evalans (ea_try, ea_no, ea_choice, ea_ok, ea_at) VALUES (?, ?, ?, ?, ?)');
        if (!$stmt || !$stmt->bind_param('iisis', $tryId, $no, $choice, $ok, $at) || !$stmt->execute()) {
            json_out(['ok' => false, 'error' => 'උත්තරය සුරකින්න බැරි වුණා.'], 500);
        }
        $count = rows('SELECT COUNT(*) AS n, COALESCE(SUM(ea_ok), 0) AS marks FROM cp_evalans WHERE ea_try = ?', 'i', [$tryId]);
        $score = (int) ($count[0]['marks'] ?? 0) * 10;
        $answered = (int) ($count[0]['n'] ?? 0);
        if ($answered >= 10) {
            $doneAt = date('Y-m-d H:i:s');
            $save = db()->prepare('UPDATE cp_evaltry SET et_score = ?, et_done = ? WHERE et_id = ?');
            if ($save) {
                $save->bind_param('isi', $score, $doneAt, $tryId);
                $save->execute();
            }
        } else {
            $save = db()->prepare('UPDATE cp_evaltry SET et_score = ? WHERE et_id = ?');
            if ($save) {
                $save->bind_param('ii', $score, $tryId);
                $save->execute();
            }
        }
    }
    $fresh = eval_try_row($eval, $kind, $nid);
    $doneRaw = (string) ($fresh['et_done'] ?? '');
    $done = $doneRaw !== '' && !str_starts_with($doneRaw, '0000');
    $review = $done && $kind === 'post' ? eval_review($tryId, $eval, true) : [];
    json_out([
        'ok' => true,
        'score' => (int) ($fresh['et_score'] ?? 0),
        'done' => $done,
        'review' => $review,
    ]);
}

function notify_when(array $plan): string
{
    $dates = programme_days($plan, 'atp_day');
    sort($dates);
    foreach ($dates as $date) {
        $day = substr((string) $date, 0, 10);
        if (preg_match('/^\d{4}-\d{2}-\d{2}$/', $day) && !str_starts_with($day, '0000')) {
            return str_replace('-', '.', $day);
        }
    }
    return '';
}

function notify_letter(string $kind, string $name, string $programme, string $day, string $place): array
{
    $who = trim($name) !== '' ? trim($name) : 'නිලධාරියා';
    $tail = "අනිවාර්යයෙන් සහභාගී වන්න.\nකළමනාකරණ සංවර්ධන හා පුහුණු ඒකකය\nවයඹ පළාත් සභාව";
    if ($kind === 'remind') {
        return [
            'පසුදා එනවාද? — ' . $programme,
            $who . ",\nපසුදා " . $programme . " පුහුණු වැඩසටහන තියෙනවා.\nදිනය: " . $day . "\nස්ථානය: " . $place . "\nඔබ එනවාද?\n" . $tail,
        ];
    }
    return [
        'පුහුණු වැඩසටහන — ' . $programme,
        $who . ",\n" . $programme . " පුහුණු වැඩසටහන " . $day . " දින " . $place . " හි පැවැත්වේ.\nඔබ මේ පුහුණු වැඩසටහනට තෝරාගෙන ඇත.\n" . $tail,
    ];
}

function notify_officers(int $atp): array
{
    return rows(
        "SELECT a.tapp_officerNid, s.stf_Name, s.stf_email, s.stf_mobile
         FROM cp_trainingapplications a
         LEFT JOIN cp_staff s ON s.stf_Nid = a.tapp_officerNid
         WHERE a.tapp_atpid = ? AND a.tapp_isselected IN (?, 'Yes', 'yes')
         ORDER BY s.stf_Name",
        'ss',
        [$atp, YES_SI]
    );
}

function notify_row(): array
{
    $saved = rows('SELECT nt_wa_token, nt_wa_phone, nt_gmail_app FROM cp_notify WHERE nt_id = 1 LIMIT 1');
    return $saved[0] ?? ['nt_wa_token' => '', 'nt_wa_phone' => '', 'nt_gmail_app' => ''];
}

function action_messages(): void
{
    module_staff();
    $atp = (int) ($_GET['atp'] ?? 0);
    $programmes = [];
    foreach (rows("SELECT atp_id, atp_trname, atp_day1, atp_location FROM cp_atp WHERE TRIM(atp_trname) <> '' ORDER BY atp_id DESC LIMIT 300") as $row) {
        $programmes[] = [
            'id' => (int) $row['atp_id'],
            'name' => (string) $row['atp_trname'],
            'day' => substr((string) $row['atp_day1'], 0, 10),
            'place' => (string) ($row['atp_location'] ?? ''),
        ];
    }
    $officers = [];
    $preview = ['notice' => '', 'remind' => ''];
    if ($atp > 0) {
        $plan = rows('SELECT * FROM cp_atp WHERE atp_id = ? LIMIT 1', 'i', [$atp]);
        if ($plan) {
            $name = trim((string) ($plan[0]['atp_trname'] ?? ''));
            $day = notify_when($plan[0]);
            $place = trim((string) ($plan[0]['atp_location'] ?? ''));
            $preview['notice'] = notify_letter('notice', 'නිලධාරියා', $name, $day, $place)[1];
            $preview['remind'] = notify_letter('remind', 'නිලධාරියා', $name, $day, $place)[1];
            foreach (notify_officers($atp) as $person) {
                $who = trim((string) ($person['stf_Name'] ?? ''));
                $label = $who !== '' ? $who : (string) $person['tapp_officerNid'];
                $officers[] = [
                    'name' => $label,
                    'email' => trim((string) ($person['stf_email'] ?? '')),
                    'mobile' => trim((string) ($person['stf_mobile'] ?? '')),
                    'phone' => notify_phone((string) ($person['stf_mobile'] ?? '')),
                    'notice' => notify_letter('notice', $label, $name, $day, $place)[1],
                    'remind' => notify_letter('remind', $label, $name, $day, $place)[1],
                ];
            }
        }
    }
    $saved = notify_row();
    json_out([
        'ok' => true,
        'from' => gemini_account()['email'],
        'whatsapp' => trim((string) $saved['nt_wa_token']) !== '' && trim((string) $saved['nt_wa_phone']) !== '',
        'gmailApp' => trim((string) ($saved['nt_gmail_app'] ?? '')) !== '',
        'waPhone' => (string) $saved['nt_wa_phone'],
        'programmes' => $programmes,
        'officers' => $officers,
        'preview' => $preview,
    ]);
}

function action_messages_save(): void
{
    csrf_check();
    module_staff();
    $data = body();
    $token = trim((string) ($data['token'] ?? ''));
    $phone = preg_replace('/\D/', '', (string) ($data['phone'] ?? '')) ?? '';
    $saved = notify_row();
    if ($token === '') {
        $token = trim((string) $saved['nt_wa_token']);
    }
    if ($phone === '') {
        $phone = preg_replace('/\D/', '', (string) $saved['nt_wa_phone']) ?? '';
    }
    if ($token === '' || $phone === '') {
        json_out(['ok' => false, 'error' => 'WhatsApp Business ටෝකනය සහ දුරකථන අංක හැඳුනුම දෙන්න.'], 422);
    }
    $id = 1;
    $app = (string) ($saved['nt_gmail_app'] ?? '');
    $stmt = db()->prepare('REPLACE INTO cp_notify (nt_id, nt_wa_token, nt_wa_phone, nt_gmail_app) VALUES (?, ?, ?, ?)');
    if (!$stmt || !$stmt->bind_param('isss', $id, $token, $phone, $app) || !$stmt->execute()) {
        json_out(['ok' => false, 'error' => 'WhatsApp Business සුරකින්න බැරි වුණා.'], 500);
    }
    json_out(['ok' => true]);
}

function smtp_read($fp): string
{
    $reply = '';
    while (($line = fgets($fp, 515)) !== false) {
        $reply .= $line;
        if (strlen($line) >= 4 && $line[3] === ' ') {
            break;
        }
    }
    return $reply;
}

function smtp_say($fp, string $cmd, array $ok): void
{
    if ($cmd !== '') {
        fwrite($fp, $cmd . "\r\n");
    }
    $reply = smtp_read($fp);
    $code = (int) substr($reply, 0, 3);
    if (!in_array($code, $ok, true)) {
        throw new RuntimeException((string) $code);
    }
}

function gmail_secret(): string
{
    $saved = preg_replace('/\s+/', '', (string) (notify_row()['nt_gmail_app'] ?? '')) ?? '';
    return $saved !== '' ? $saved : gemini_account()['password'];
}

function action_messages_gmail(): void
{
    csrf_check();
    module_staff();
    $app = preg_replace('/\s+/', '', (string) (body()['app'] ?? '')) ?? '';
    if ($app === '') {
        json_out(['ok' => false, 'error' => 'Gmail එකේ හදපු App password එක දාන්න.'], 422);
    }
    if (strlen($app) < 16) {
        json_out(['ok' => false, 'error' => 'App password එක අකුරු 16කි. Gmail එකේ පෙන්නන ඒකම දාන්න.'], 422);
    }
    $saved = notify_row();
    $id = 1;
    $token = (string) ($saved['nt_wa_token'] ?? '');
    $phone = (string) ($saved['nt_wa_phone'] ?? '');
    $stmt = db()->prepare('REPLACE INTO cp_notify (nt_id, nt_wa_token, nt_wa_phone, nt_gmail_app) VALUES (?, ?, ?, ?)');
    if (!$stmt || !$stmt->bind_param('isss', $id, $token, $phone, $app) || !$stmt->execute()) {
        json_out(['ok' => false, 'error' => 'App password එක සුරකින්න බැරි වුණා.'], 500);
    }
    json_out(['ok' => true]);
}

function gmail_open()
{
    $account = gemini_account();
    $secret = gmail_secret();
    $fp = stream_socket_client('tcp://smtp.gmail.com:587', $errno, $errstr, 20);
    if (!$fp) {
        throw new RuntimeException('connect');
    }
    stream_set_timeout($fp, 25);
    smtp_say($fp, '', [220]);
    smtp_say($fp, 'EHLO mdtu.nw.gov.lk', [250]);
    smtp_say($fp, 'STARTTLS', [220]);
    if (!stream_socket_enable_crypto($fp, true, STREAM_CRYPTO_METHOD_TLS_CLIENT)) {
        throw new RuntimeException('tls');
    }
    smtp_say($fp, 'EHLO mdtu.nw.gov.lk', [250]);
    smtp_say($fp, 'AUTH LOGIN', [334]);
    smtp_say($fp, base64_encode($account['email']), [334]);
    smtp_say($fp, base64_encode($secret), [235]);
    return $fp;
}

function mail_encoded(string $text): string
{
    return '=?UTF-8?B?' . base64_encode($text) . '?=';
}

function gmail_one($fp, string $from, string $to, string $subject, string $body): void
{
    $safe = str_replace(["\r", "\n"], ' ', $to);
    smtp_say($fp, 'MAIL FROM:<' . $from . '>', [250]);
    smtp_say($fp, 'RCPT TO:<' . $safe . '>', [250, 251]);
    smtp_say($fp, 'DATA', [354]);
    $lines = preg_split("/\r\n|\n|\r/", $body) ?: [];
    $stuffed = [];
    foreach ($lines as $line) {
        $stuffed[] = str_starts_with($line, '.') ? '.' . $line : $line;
    }
    $data = 'From: ' . mail_encoded('කළමනාකරණ සංවර්ධන හා පුහුණු ඒකකය') . ' <' . $from . ">\r\n"
        . 'To: <' . $safe . ">\r\n"
        . 'Subject: ' . mail_encoded($subject) . "\r\n"
        . "MIME-Version: 1.0\r\n"
        . "Content-Type: text/plain; charset=UTF-8\r\n"
        . "Content-Transfer-Encoding: 8bit\r\n\r\n"
        . implode("\r\n", $stuffed);
    fwrite($fp, $data . "\r\n.\r\n");
    smtp_say($fp, '', [250]);
}

function notify_phone(string $raw): string
{
    $digits = preg_replace('/\D/', '', $raw) ?? '';
    if (str_starts_with($digits, '0') && strlen($digits) === 10) {
        return '94' . substr($digits, 1);
    }
    if (str_starts_with($digits, '94') && strlen($digits) >= 11) {
        return $digits;
    }
    return '';
}

function whatsapp_one(string $token, string $phoneId, string $to, string $body): void
{
    $payload = json_encode([
        'messaging_product' => 'whatsapp',
        'to' => $to,
        'type' => 'text',
        'text' => ['preview_url' => false, 'body' => $body],
    ], JSON_UNESCAPED_UNICODE);
    $context = stream_context_create([
        'http' => [
            'method' => 'POST',
            'header' => "Authorization: Bearer {$token}\r\nContent-Type: application/json\r\n",
            'content' => $payload,
            'ignore_errors' => true,
            'timeout' => 25,
        ],
    ]);
    $url = 'https://graph.facebook.com/v21.0/' . rawurlencode($phoneId) . '/messages';
    $raw = @file_get_contents($url, false, $context);
    if ($raw === false && function_exists('curl_init')) {
        $ch = curl_init($url);
        curl_setopt_array($ch, [
            CURLOPT_POST => true,
            CURLOPT_HTTPHEADER => ["Authorization: Bearer {$token}", 'Content-Type: application/json'],
            CURLOPT_POSTFIELDS => $payload,
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_TIMEOUT => 25,
        ]);
        $raw = curl_exec($ch);
        curl_close($ch);
    }
    $decoded = is_string($raw) ? json_decode($raw, true) : null;
    if (!is_array($decoded) || empty($decoded['messages'][0]['id'])) {
        $message = is_array($decoded) ? (string) ($decoded['error']['message'] ?? '') : '';
        throw new RuntimeException($message !== '' ? $message : 'WhatsApp');
    }
}

function action_messages_send(): void
{
    csrf_check();
    module_staff();
    $data = body();
    $atp = (int) ($data['atp'] ?? 0);
    $kind = (string) ($data['kind'] ?? '') === 'remind' ? 'remind' : 'notice';
    $channel = (string) ($data['channel'] ?? '') === 'whatsapp' ? 'whatsapp' : 'email';
    $plan = rows('SELECT * FROM cp_atp WHERE atp_id = ? LIMIT 1', 'i', [$atp]);
    $programme = trim((string) ($plan[0]['atp_trname'] ?? ''));
    if ($programme === '') {
        json_out(['ok' => false, 'error' => 'පුහුණු වැඩසටහනක් තෝරන්න.'], 422);
    }
    $day = notify_when($plan[0]);
    $place = trim((string) ($plan[0]['atp_location'] ?? ''));
    $people = notify_officers($atp);
    if (!$people) {
        json_out(['ok' => false, 'error' => 'මේ පුහුණුවට තෝරාගත් නිලධාරීන් නැත.'], 422);
    }
    $sent = 0;
    $skipped = 0;
    $failed = 0;
    $from = gemini_account()['email'];
    $mail = null;
    $token = '';
    $phoneId = '';
    if ($channel === 'email') {
        try {
            $mail = gmail_open();
        } catch (RuntimeException $error) {
            $why = $error->getMessage() === '535' || $error->getMessage() === '534'
                ? (trim((string) (notify_row()['nt_gmail_app'] ?? '')) !== ''
                    ? 'මේ App password එක Gmail එක පිළිගත්තේ නැත. අලුත් එකක් හදලා ආයෙ දාන්න.'
                    : 'Gmail එක සාමාන්‍ය මුරපදය පිළිගත්තේ නැත. Gmail එකේ App password එකක් හදලා මෙතන දාන්න.')
                : 'Gmail එකෙන් ඊමේල් යවන්න බැරි වුණා.';
            json_out(['ok' => false, 'error' => $why], 502);
        }
    } else {
        $saved = notify_row();
        $token = trim((string) $saved['nt_wa_token']);
        $phoneId = trim((string) $saved['nt_wa_phone']);
        if ($token === '' || $phoneId === '') {
            json_out(['ok' => false, 'error' => 'මුලින්ම WhatsApp Business ටෝකනය සුරකින්න.'], 422);
        }
    }
    foreach ($people as $person) {
        $who = trim((string) ($person['stf_Name'] ?? ''));
        [$subject, $body] = notify_letter($kind, $who, $programme, $day, $place);
        try {
            if ($channel === 'email') {
                $email = trim((string) ($person['stf_email'] ?? ''));
                if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
                    $skipped++;
                    continue;
                }
                gmail_one($mail, $from, $email, $subject, $body);
            } else {
                $phone = notify_phone((string) ($person['stf_mobile'] ?? ''));
                if ($phone === '') {
                    $skipped++;
                    continue;
                }
                whatsapp_one($token, $phoneId, $phone, $body);
            }
            $sent++;
        } catch (RuntimeException $error) {
            $failed++;
            if ($channel === 'email' && is_resource($mail)) {
                try {
                    smtp_say($mail, 'RSET', [250]);
                } catch (RuntimeException $ignore) {
                }
            }
        }
    }
    if (is_resource($mail)) {
        fwrite($mail, "QUIT\r\n");
        fclose($mail);
    }
    json_out(['ok' => true, 'sent' => $sent, 'skipped' => $skipped, 'failed' => $failed]);
}

function action_signatory(): void
{
    $user = require_user();
    if (!is_admin($user)) {
        json_out(['ok' => false, 'error' => 'මෙය බලන්න පුළුවන් පුහුණු කාර්ය මණ්ඩලයට පමණයි.'], 403);
    }
    $profile = signatory_profile();
    json_out([
        'ok' => true,
        'name' => $profile['name'],
        'title' => $profile['title'],
        'file' => $profile['file'],
        'url' => $profile['signUrl'],
        'photo' => $profile['photo'],
        'photoUrl' => $profile['photoUrl'],
    ]);
}

function action_signatory_save(): void
{
    csrf_check();
    $user = require_user();
    if (!is_admin($user)) {
        json_out(['ok' => false, 'error' => 'මෙය සුරකින්න පුළුවන් පුහුණු කාර්ය මණ්ඩලයට පමණයි.'], 403);
    }
    $data = body();
    $name = mb_substr(trim((string) ($data['name'] ?? '')), 0, 200);
    $title = trim((string) ($data['title'] ?? ''));
    $file = basename(str_replace('\\', '/', trim((string) ($data['sign'] ?? ''))));
    $photo = basename(str_replace('\\', '/', trim((string) ($data['photo'] ?? ''))));
    if ($name === '') {
        json_out(['ok' => false, 'error' => 'නියෝජ්‍ය ප්‍රධාන ලේකම් (පුහුණු)ගේ නම දෙන්න.'], 422);
    }
    if (!in_array($title, signatory_titles(), true)) {
        json_out(['ok' => false, 'error' => 'මහතා, මහත්මිය හෝ මෙනවිය තෝරන්න.'], 422);
    }
    $existing = rows('SELECT sg_id, sg_sign, sg_photo FROM cp_signatory WHERE sg_id = 1 LIMIT 1');
    if ($file === '' && $existing) {
        $file = (string) $existing[0]['sg_sign'];
    }
    if ($photo === '' && $existing) {
        $photo = (string) $existing[0]['sg_photo'];
    }
    if ($existing) {
        $stmt = db()->prepare('UPDATE cp_signatory SET sg_name = ?, sg_title = ?, sg_sign = ?, sg_photo = ? WHERE sg_id = 1');
        $ok = $stmt && $stmt->bind_param('ssss', $name, $title, $file, $photo) && $stmt->execute();
    } else {
        $id = 1;
        $stmt = db()->prepare('INSERT INTO cp_signatory (sg_id, sg_name, sg_title, sg_sign, sg_photo) VALUES (?, ?, ?, ?, ?)');
        $ok = $stmt && $stmt->bind_param('issss', $id, $name, $title, $file, $photo) && $stmt->execute();
    }
    if (!$ok) {
        json_out(['ok' => false, 'error' => 'සුරැකිය නොහැකි විය.'], 500);
    }
    $profile = signatory_profile();
    json_out([
        'ok' => true,
        'name' => $profile['name'],
        'title' => $profile['title'],
        'file' => $profile['file'],
        'url' => $profile['signUrl'],
        'photo' => $profile['photo'],
        'photoUrl' => $profile['photoUrl'],
    ]);
}

function action_officer_letter(): void
{
    $nid = trim((string) ($_GET['nid'] ?? ''));
    $atp = trim((string) ($_GET['atp'] ?? ''));
    if ($nid === '' || $atp === '') {
        json_out(['ok' => false, 'error' => 'The officer and programme are required.'], 422);
    }
    $attended = rows(
        "SELECT tratt_atpname, tratt_startdate FROM cp_trainingattendance
         WHERE tratt_empnid = ? AND tratt_atpid = ?
           AND (tratt_isparti IS NULL OR TRIM(tratt_isparti) = '' OR tratt_isparti NOT IN ('නැත', 'No', 'no'))
         LIMIT 1",
        'ss',
        [$nid, $atp]
    );
    if (!$attended) {
        json_out(['ok' => false, 'error' => 'That officer has no attendance record for this programme.'], 404);
    }
    $staff = rows('SELECT stf_Name, stf_desig, stf_office, stf_Nid, stf_sex FROM cp_staff WHERE stf_Nid = ? LIMIT 1', 's', [$nid]);
    $planRows = rows('SELECT * FROM cp_atp WHERE atp_id = ? LIMIT 1', 's', [$atp]);
    $plan = $planRows[0] ?? [];
    $applications = rows(
        'SELECT * FROM cp_trainingapplications WHERE tapp_officerNid = ? AND tapp_atpid = ? LIMIT 1',
        'ss',
        [$nid, $atp]
    );
    $application = $applications[0] ?? [
        'tapp_trname' => $attended[0]['tratt_atpname'],
        'tapp_isselected' => YES_SI,
        'tapp_office' => $staff[0]['stf_office'] ?? '',
    ];
    json_out([
        'ok' => true,
        'letter' => [
            'application' => $application,
            'officer' => $staff[0] ?? ['stf_Name' => '', 'stf_desig' => '', 'stf_office' => '', 'stf_Nid' => $nid, 'stf_sex' => ''],
            'programme' => $plan,
            'days' => $plan ? programme_days($plan, 'atp_day') : [substr((string) $attended[0]['tratt_startdate'], 0, 10)],
            'selectedDate' => letter_selected_date($application),
            'unit' => MDTU_NAME,
            'org' => MDTU_ORG,
            'place' => MDTU_PLACE,
            'phone' => MDTU_PHONE,
        ] + letter_signatory(),
    ]);
}

function action_call_letters(): void
{
    $user = require_user();
    $nid = trim((string) ($_GET['nid'] ?? ''));
    $year = (int) ($_GET['year'] ?? 0);
    if ($year < 1990 || $year > 2100) {
        $year = (int) date('Y');
    }
    if ($nid === '') {
        json_out(['ok' => false, 'error' => 'ජාතික හැඳුනුම්පත් අංකය දෙන්න.'], 422);
    }
    $found = rows('SELECT stf_Name, stf_desig, stf_office, stf_Nid FROM cp_staff WHERE stf_Nid = ? LIMIT 1', 's', [$nid]);
    if (!$found) {
        json_out(['ok' => false, 'error' => 'ඒ අංකයට නිලධාරියෙක් හමු නොවුණා.'], 404);
    }
    $person = $found[0];
    if ($user['role'] === 'User' && $person['stf_office'] !== $user['office']) {
        json_out(['ok' => false, 'error' => 'මෙම නිලධාරියා වෙනත් කාර්යාලයකයි.'], 403);
    }
    $items = rows(
        "SELECT a.tratt_atpid AS id,
                COALESCE(NULLIF(p.atp_trname, ''), a.tratt_atpname) AS name,
                CASE
                    WHEN p.atp_day1 IS NOT NULL AND p.atp_day1 NOT LIKE '0000%' AND p.atp_day1 NOT LIKE '1111%' THEN p.atp_day1
                    ELSE a.tratt_startdate
                END AS day,
                p.atp_location AS place
         FROM cp_trainingattendance a
         LEFT JOIN cp_atp p ON p.atp_id = a.tratt_atpid
         WHERE a.tratt_empnid = ?
           AND (a.tratt_isparti IS NULL OR TRIM(a.tratt_isparti) = '' OR a.tratt_isparti NOT IN ('නැත', 'No', 'no'))
           AND LEFT(CASE
                    WHEN p.atp_day1 IS NOT NULL AND p.atp_day1 NOT LIKE '0000%' AND p.atp_day1 NOT LIKE '1111%' THEN p.atp_day1
                    ELSE a.tratt_startdate
                END, 4) = ?
         GROUP BY a.tratt_atpid, name, day, place
         ORDER BY day DESC",
        'ss',
        [$nid, (string) $year]
    );
    json_out([
        'ok' => true,
        'year' => $year,
        'officer' => [
            'name' => $person['stf_Name'],
            'designation' => $person['stf_desig'],
            'office' => $person['stf_office'],
            'nid' => $person['stf_Nid'],
        ],
        'items' => $items,
    ]);
}

function action_letter(): void
{
    $user = require_user();
    $id = (int) ($_GET['id'] ?? 0);
    $found = rows('SELECT * FROM cp_trainingapplications WHERE tapp_id = ? LIMIT 1', 'i', [$id]);
    if (!$found) {
        json_out(['ok' => false, 'error' => 'That application was not found.'], 404);
    }
    $application = $found[0];
    if ($user['role'] === 'User' && $application['tapp_office'] !== $user['office']) {
        json_out(['ok' => false, 'error' => 'This letter belongs to another office.'], 403);
    }
    $staff = rows('SELECT stf_Name, stf_desig, stf_office, stf_Nid, stf_sex FROM cp_staff WHERE stf_Nid = ? LIMIT 1', 's', [$application['tapp_officerNid']]);
    $planRows = rows('SELECT * FROM cp_atp WHERE atp_id = ? LIMIT 1', 's', [(string) $application['tapp_atpid']]);
    $plan = $planRows[0] ?? [];
    json_out([
        'ok' => true,
        'letter' => [
            'application' => $application,
            'officer' => $staff[0] ?? ['stf_Name' => '', 'stf_desig' => '', 'stf_office' => $application['tapp_office'], 'stf_Nid' => $application['tapp_officerNid'], 'stf_sex' => ''],
            'programme' => $plan,
            'days' => $plan ? programme_days($plan, 'atp_day') : [],
            'selectedDate' => letter_selected_date($application),
            'unit' => MDTU_NAME,
            'org' => MDTU_ORG,
            'place' => MDTU_PLACE,
            'phone' => MDTU_PHONE,
        ] + letter_signatory(),
    ]);
}

function estimate_sort_day(string $value): string
{
    $value = substr($value, 0, 10);
    if ($value === '' || str_starts_with($value, '0000') || str_starts_with($value, '1111')) {
        return '0000-00-00';
    }
    return $value;
}

function clean_estimate_sheet(array $sheet): array
{
    $allowed = ['file', 'name', 'target', 'place', 'food', 'tea', 'lunch', '6.2', '6.3', '6.4', 'lecture', '6.6', '6.7', '6.8', '6.9', '6.10', '6.11', '6.12', '6.13', '6.14', '6.15', '6.16', '6.17', '6.18', '6.19', '6.20', 'note'];
    $lines = [];
    foreach ((array) ($sheet['lines'] ?? []) as $line) {
        if (!is_array($line)) {
            continue;
        }
        $key = (string) ($line['key'] ?? '');
        if (!in_array($key, $allowed, true)) {
            continue;
        }
        $auto = (string) ($line['auto'] ?? '');
        $lines[] = [
            'key' => $key,
            'formula' => mb_substr(trim((string) ($line['formula'] ?? '')), 0, 400),
            'auto' => ($auto === '0' || $auto === '1') ? $auto : '',
        ];
    }
    $dates = [];
    foreach (array_slice((array) ($sheet['dates'] ?? []), 0, 100) as $date) {
        $date = substr(trim((string) $date), 0, 10);
        if ($date !== '' && !preg_match('/^\d{4}-\d{2}-\d{2}$/', $date)) {
            continue;
        }
        $dates[] = $date;
    }
    $lecturers = [];
    foreach (array_slice((array) ($sheet['lecturers'] ?? []), 0, 100) as $person) {
        if (!is_array($person)) {
            continue;
        }
        $lecturers[] = [
            'name' => mb_substr(trim((string) ($person['name'] ?? '')), 0, 300),
            'formula' => mb_substr(trim((string) ($person['formula'] ?? '')), 0, 200),
        ];
    }
    $name = '';
    $file = '';
    foreach ($lines as $line) {
        if ($line['key'] === 'name') {
            $name = $line['formula'];
        }
        if ($line['key'] === 'file') {
            $file = $line['formula'];
        }
    }
    $day = '';
    foreach ($dates as $date) {
        if ($date !== '') {
            $day = $date;
            break;
        }
    }
    return [
        'lines' => $lines,
        'dates' => $dates,
        'lecturers' => $lecturers,
        'residential' => mb_substr(trim((string) ($sheet['residential'] ?? '')), 0, 40),
        'total' => mb_substr(trim((string) ($sheet['total'] ?? '')), 0, 40),
        'name' => $name,
        'file' => $file,
        'day' => $day,
    ];
}

function action_save_estimate(): void
{
    csrf_check();
    $user = require_user();
    if (!is_super($user)) {
        json_out(['ok' => false, 'error' => 'ඇස්තමේන්තුව සුරකින්න පුළුවන් පුහුණු කාර්ය මණ්ඩලයට පමණයි.'], 403);
    }
    $data = body();
    $id = (int) ($data['id'] ?? 0);
    $found = rows('SELECT atp_id, atp_trname, atp_fileno, atp_day1 FROM cp_atp WHERE atp_id = ? LIMIT 1', 'i', [$id]);
    if (!$found) {
        json_out(['ok' => false, 'error' => 'ඒ වැඩසටහන හමු නොවුණා.'], 404);
    }
    $sheet = $data['sheet'] ?? null;
    if (!is_array($sheet)) {
        json_out(['ok' => false, 'error' => 'ඇස්තමේන්තුව සුරැකිය නොහැකි විය.'], 422);
    }
    $clean = clean_estimate_sheet($sheet);
    $json = json_encode($clean, JSON_UNESCAPED_UNICODE);
    if ($json === false || strlen($json) > 500000) {
        json_out(['ok' => false, 'error' => 'ඇස්තමේන්තුව සුරැකිය නොහැකි විය.'], 422);
    }
    $plan = $found[0];
    $day = $clean['day'];
    if (!preg_match('/^\d{4}-\d{2}-\d{2}$/', $day)) {
        $day = estimate_sort_day((string) $plan['atp_day1']);
        if ($day === '0000-00-00') {
            $day = '';
        }
    }
    $name = $clean['name'] !== '' ? $clean['name'] : (string) $plan['atp_trname'];
    $file = $clean['file'] !== '' ? $clean['file'] : (string) $plan['atp_fileno'];
    $total = $clean['total'];
    $now = date('Y-m-d H:i:s');
    $existing = rows('SELECT se_id FROM cp_savedestimates WHERE se_atpid = ? LIMIT 1', 'i', [$id]);
    if ($existing) {
        $stmt = db()->prepare('UPDATE cp_savedestimates SET se_day1=?, se_trname=?, se_fileno=?, se_total=?, se_sheet=?, se_savedat=? WHERE se_atpid=?');
        $stmt->bind_param('ssssssi', $day, $name, $file, $total, $json, $now, $id);
    } else {
        $stmt = db()->prepare('INSERT INTO cp_savedestimates (se_atpid, se_day1, se_trname, se_fileno, se_total, se_sheet, se_savedat) VALUES (?, ?, ?, ?, ?, ?, ?)');
        $stmt->bind_param('issssss', $id, $day, $name, $file, $total, $json, $now);
    }
    if (!$stmt || !$stmt->execute()) {
        json_out(['ok' => false, 'error' => 'ඇස්තමේන්තුව සුරැකිය නොහැකි විය.'], 500);
    }
    json_out(['ok' => true]);
}

function saved_estimate_items(): array
{
    $items = rows(
        'SELECT s.se_atpid, s.se_day1, s.se_trname, s.se_fileno, s.se_total,
                a.atp_trname, a.atp_fileno, a.atp_targetgroup, a.atp_noofparticipants, a.atp_noofdays, a.atp_location, a.atp_reqoffice, a.atp_stime, a.atp_etime, a.atp_supportstaff1, a.atp_supervisor,
                a.atp_day1, a.atp_day2, a.atp_day3, a.atp_day4, a.atp_day5, a.atp_day6, a.atp_day7, a.atp_day8, a.atp_day9, a.atp_day10, a.atp_offweb,
                a.atp_moredays, a.atp_resourcep1, a.atp_resourcep2, a.atp_resourcep3, a.atp_resourcep4, a.atp_resourcep5,
                a.atp_resourcep6, a.atp_resourcep7, a.atp_resourcep8, a.atp_resourcep9, a.atp_resourcep10, a.atp_moreresource
         FROM cp_savedestimates s
         LEFT JOIN cp_atp a ON a.atp_id = s.se_atpid'
    );
    $out = [];
    foreach ($items as $row) {
        $day = trim((string) ($row['atp_day1'] ?? ''));
        if (estimate_sort_day($day) === '0000-00-00') {
            $day = (string) $row['se_day1'];
        }
        $name = trim((string) ($row['atp_trname'] ?? ''));
        if ($name === '') {
            $name = (string) $row['se_trname'];
        }
        $file = trim((string) ($row['atp_fileno'] ?? ''));
        if ($file === '') {
            $file = (string) $row['se_fileno'];
        }
        $dates = programme_days($row, 'atp_day');
        sort($dates);
        $dayCount = count($dates);
        if ($dayCount < 1) {
            $dayCount = (int) preg_replace('/\D/', '', (string) ($row['atp_noofdays'] ?? ''));
        }
        if ($dayCount < 1) {
            $dayCount = 1;
        }
        if ($dayCount > 60) {
            $dayCount = 60;
        }
        $end = $dates ? $dates[count($dates) - 1] : '';
        if ($end === '') {
            $end = estimate_sort_day($day) === '0000-00-00' ? '' : substr($day, 0, 10);
        }
        $people = [];
        for ($i = 1; $i <= 10; $i++) {
            $person = trim((string) ($row['atp_resourcep' . $i] ?? ''));
            if ($person !== '') {
                $people[] = $person;
            }
        }
        foreach (preg_split('/\R/', (string) ($row['atp_moreresource'] ?? '')) as $extra) {
            $extra = trim($extra);
            if ($extra !== '') {
                $people[] = $extra;
            }
        }
        $out[] = [
            'id' => (int) $row['se_atpid'],
            'day' => substr($day, 0, 10),
            'end' => $end,
            'name' => $name,
            'file' => $file,
            'target' => (string) ($row['atp_targetgroup'] ?? ''),
            'participants' => (string) ($row['atp_noofparticipants'] ?? ''),
            'days' => (string) ($row['atp_noofdays'] ?? ''),
            'place' => (string) ($row['atp_location'] ?? ''),
            'office' => (string) ($row['atp_reqoffice'] ?? ''),
            'stime' => trim((string) ($row['atp_stime'] ?? '')),
            'etime' => trim((string) ($row['atp_etime'] ?? '')),
            'time' => trim((string) ($row['atp_stime'] ?? '')) !== '' && trim((string) ($row['atp_etime'] ?? '')) !== ''
                ? trim((string) $row['atp_stime']) . ' – ' . trim((string) $row['atp_etime'])
                : trim(trim((string) ($row['atp_stime'] ?? '')) . ' ' . trim((string) ($row['atp_etime'] ?? ''))),
            'dates' => $dates,
            'people' => $people,
            'liaisonNid' => trim((string) ($row['atp_supportstaff1'] ?? '')),
            'supervisorNid' => trim((string) ($row['atp_supervisor'] ?? '')),
            'total' => (string) $row['se_total'],
            'dayCount' => $dayCount,
            'offweb' => in_array((string) ($row['atp_offweb'] ?? ''), [YES_SI, 'Yes', 'yes'], true),
        ];
    }
    usort($out, static function (array $a, array $b): int {
        $left = estimate_sort_day((string) $a['day']);
        $right = estimate_sort_day((string) $b['day']);
        if ($left === $right) {
            return $b['id'] <=> $a['id'];
        }
        return $right <=> $left;
    });
    return $out;
}

function action_saved_estimates(): void
{
    $user = require_user();
    if (!is_super($user)) {
        json_out(['ok' => false, 'error' => 'ඇස්තමේන්තු ලැයිස්තුව බලන්න පුළුවන් පුහුණු කාර්ය මණ්ඩලයට පමණයි.'], 403);
    }
    json_out(['ok' => true, 'items' => saved_estimate_items()]);
}

function action_finish2(): void
{
    $user = require_user();
    if (!is_super($user)) {
        json_out(['ok' => false, 'error' => 'මෙම ලැයිස්තුව බලන්න පුළුවන් පුහුණු කාර්ය මණ්ඩලයට පමණයි.'], 403);
    }
    $ready = [];
    foreach (rows('SELECT ad_atpid FROM cp_advances') as $row) {
        $ready[(int) $row['ad_atpid']] = false;
    }
    foreach (rows("SELECT DISTINCT tratt_atpid FROM cp_trainingattendance WHERE tratt_isparti IS NOT NULL AND TRIM(tratt_isparti) <> ''") as $row) {
        $id = (int) $row['tratt_atpid'];
        if (array_key_exists($id, $ready)) {
            $ready[$id] = true;
        }
    }
    $foodDone = [];
    foreach (rows('SELECT fb_atpid FROM cp_foodbills') as $row) {
        $foodDone[(int) $row['fb_atpid']] = true;
    }
    $payDone = [];
    foreach (rows('SELECT al_atpid FROM cp_allowances') as $row) {
        $payDone[(int) $row['al_atpid']] = true;
    }
    $items = [];
    foreach (saved_estimate_items() as $item) {
        $id = (int) $item['id'];
        if (empty($ready[$id])) {
            continue;
        }
        $item['closed'] = !empty($foodDone[$id]) && !empty($payDone[$id]);
        if ($item['closed']) {
            finish_programme_if_ready($id);
        }
        $items[] = $item;
    }
    json_out(['ok' => true, 'items' => $items]);
}

function action_offweb_save(): void
{
    csrf_check();
    $user = require_user();
    if (!is_super($user)) {
        json_out(['ok' => false, 'error' => 'මෙය ඇතුළත් කරන්න පුළුවන් පුහුණු කාර්ය මණ්ඩලයට පමණයි.'], 403);
    }
    $body = body();
    $data = is_array($body['data'] ?? null) ? $body['data'] : $body;
    $name = trim((string) ($data['atp_trname'] ?? ''));
    if ($name === '') {
        json_out(['ok' => false, 'error' => 'පුහුණු වැඩසටහනේ නම දෙන්න.'], 422);
    }
    $allowed = [
        'atp_trname', 'atp_fileno', 'atp_panelno', 'atp_supervisor', 'atp_purpose', 'atp_content',
        'atp_targetgroup', 'atp_nooftrainings', 'atp_noofdays', 'atp_noofparticipants', 'atp_location',
        'atp_fundsource', 'atp_bdjet', 'atp_stime', 'atp_etime',
        'atp_supportstaff1', 'atp_supportstaff2', 'atp_supportstaff3', 'atp_supportstaff4', 'atp_supportstaff5', 'atp_supportstaff6',
        'atp_cashofficername', 'atp_cashofficerdesig', 'atp_cashofficerotherdetails',
        'atp_trtype', 'atp_otherfacts', 'atp_specialfacts', 'atp_showspecialfacts', 'atp_specialfinletter',
        'atp_moredays', 'atp_moreresource', 'atp_moresupport',
    ];
    for ($i = 1; $i <= 10; $i++) {
        $allowed[] = 'atp_day' . $i;
        $allowed[] = 'atp_resourcep' . $i;
    }
    $row = [];
    foreach ($allowed as $field) {
        $row[$field] = mb_substr(trim((string) ($data[$field] ?? '')), 0, 4000);
    }
    $row['atp_trname'] = mb_substr($name, 0, 500);
    for ($i = 1; $i <= 10; $i++) {
        $day = substr($row['atp_day' . $i], 0, 10);
        $row['atp_day' . $i] = preg_match('/^\d{4}-\d{2}-\d{2}$/', $day) ? $day : '0000-00-00';
    }
    if ($row['atp_stime'] === '') {
        $row['atp_stime'] = '9.00 am';
    }
    if ($row['atp_etime'] === '') {
        $row['atp_etime'] = '4.15 pm';
    }
    if ($row['atp_cashofficerdesig'] === '') {
        $row['atp_cashofficerdesig'] = 'නියේජ්‍ය ප්‍රධාන ලේකම් (පුහුණු)';
    }
    if ($row['atp_trtype'] === '') {
        $row['atp_trtype'] = TYPE_MDTU;
    }
    $row['atp_offweb'] = YES_SI;
    $row['atp_addhome'] = NO_SI;
    $row['atp_isinatp'] = NO_SI;
    $row['atp_isaddatp'] = NO_SI;
    $row['atp_lastdateapply'] = '0000-00-00';
    $row['atp_requestDate'] = date('Y-m-d');
    $fields = array_keys($row);
    $marks = implode(',', array_fill(0, count($fields), '?'));
    $cols = implode(',', array_map(static fn ($field) => '`' . $field . '`', $fields));
    $stmt = db()->prepare('INSERT INTO cp_atp (' . $cols . ') VALUES (' . $marks . ')');
    $types = str_repeat('s', count($fields));
    $params = array_values($row);
    if (!$stmt || !bind_and_run($stmt, $types, $params)) {
        json_out(['ok' => false, 'error' => 'පුහුණු වැඩසටහන ඇතුළත් කළ නොහැකි විය.'], 500);
    }
    json_out(['ok' => true, 'id' => (int) db()->insert_id]);
}

function action_offweb_list(): void
{
    $user = require_user();
    if (!is_super($user)) {
        json_out(['ok' => false, 'error' => 'මෙම ලැයිස්තුව බලන්න පුළුවන් පුහුණු කාර්ය මණ්ඩලයට පමණයි.'], 403);
    }
    $items = rows(
        'SELECT atp_id, atp_trname, atp_fileno, atp_day1, atp_targetgroup, atp_location
         FROM cp_atp WHERE atp_offweb = ? OR atp_offweb = ? OR atp_offweb = ?',
        'sss',
        [YES_SI, 'Yes', 'yes']
    );
    $out = [];
    foreach ($items as $row) {
        $out[] = [
            'id' => (int) $row['atp_id'],
            'name' => (string) $row['atp_trname'],
            'file' => (string) $row['atp_fileno'],
            'day' => substr((string) $row['atp_day1'], 0, 10),
            'target' => (string) $row['atp_targetgroup'],
            'place' => (string) $row['atp_location'],
        ];
    }
    usort($out, static function (array $a, array $b): int {
        $left = estimate_sort_day((string) $a['day']);
        $right = estimate_sort_day((string) $b['day']);
        if ($left === $right) {
            return $b['id'] <=> $a['id'];
        }
        return $right <=> $left;
    });
    json_out(['ok' => true, 'items' => $out]);
}

function provision_year(string $year): string
{
    $year = preg_replace('/\D/', '', $year) ?? '';
    $number = (int) $year;
    if ($number < 1990 || $number > 2100) {
        $number = (int) date('Y');
    }
    return (string) $number;
}

function total_groups(): array
{
    return [
        'general' => 'පොදු පුහුණු',
        'special' => 'විශේෂ පුහුණු',
        'department' => 'දෙපාර්තමේන්තු පුහුණු',
        'external' => 'බාහිර පුහුණු',
        'course' => 'පාඨමාලා',
        'foreign' => 'විදේශ පුහුණු',
        'language' => 'භාෂා පුහුණු',
        'drug' => 'මාත්‍රාව නිවාරණ හා උපදේශන පුහුණු',
    ];
}

function total_fields(): array
{
    return ['planned', 'days', 'applied', 'selected', 'budget', 'estimate', 'revised', 'offest', 'step1', 'step2'];
}

function total_category(string $type): string
{
    $type = trim($type);
    if ($type === 'විශේෂ පුහුණු' || $type === 'OBT') {
        return 'special';
    }
    if ($type === 'දෙපාර්තමේන්තු පුහුණු') {
        return 'department';
    }
    if ($type === 'භාෂා පුහුණු') {
        return 'language';
    }
    if (str_contains($type, 'මත්') || str_contains($type, 'උපදේශ')) {
        return 'drug';
    }
    if (str_contains($type, 'බාහිර') || str_contains($type, 'පිටස්තර')) {
        return 'external';
    }
    if (str_contains($type, 'පාඨමාලා')) {
        return 'course';
    }
    if (str_contains($type, 'විදේශ')) {
        return 'foreign';
    }
    return 'general';
}

function total_step2(array $pay): string
{
    $spent = trim((string) ($pay['al_spent'] ?? ''));
    if (advance_number($spent) > 0) {
        return $spent;
    }
    $sum = 0.0;
    foreach (['al_resource', 'al_coord', 'al_supervise', 'al_liaise', 'al_account', 'al_office'] as $key) {
        $sum += advance_number((string) ($pay[$key] ?? ''));
    }
    if ($sum > 0) {
        return advance_box($sum);
    }
    return $spent;
}

function total_bundle(string $year): array
{
    $plans = rows(
        'SELECT atp_id, atp_trname, atp_trtype, atp_offweb, atp_noofdays, atp_noofparticipants, atp_bdjet, atp_location,
                atp_day1, atp_day2, atp_day3, atp_day4, atp_day5, atp_day6, atp_day7, atp_day8, atp_day9, atp_day10, atp_moredays, atp_requestDate
         FROM cp_atp WHERE TRIM(atp_trname) <> \'\''
    );
    $applied = [];
    foreach (rows('SELECT tapp_atpid, COUNT(*) AS n FROM cp_trainingapplications GROUP BY tapp_atpid') as $row) {
        $applied[(int) $row['tapp_atpid']] = (int) $row['n'];
    }
    $selected = [];
    foreach (rows("SELECT tapp_atpid, COUNT(*) AS n FROM cp_trainingapplications WHERE tapp_isselected IN (?, 'Yes', 'yes') GROUP BY tapp_atpid", 's', [YES_SI]) as $row) {
        $selected[(int) $row['tapp_atpid']] = (int) $row['n'];
    }
    $came = advance_attended_map();
    $estimates = [];
    foreach (rows('SELECT se_atpid, se_total FROM cp_savedestimates') as $row) {
        $estimates[(int) $row['se_atpid']] = trim((string) $row['se_total']);
    }
    $pays = [];
    foreach (rows('SELECT al_atpid, al_spent, al_resource, al_coord, al_supervise, al_liaise, al_account, al_office FROM cp_allowances') as $row) {
        $pays[(int) $row['al_atpid']] = $row;
    }
    $savedRows = [];
    foreach (rows('SELECT * FROM cp_totals') as $row) {
        $savedRows[(int) $row['tt_atpid']] = $row;
    }
    $groups = total_groups();
    $bucket = [];
    foreach (array_keys($groups) as $key) {
        $bucket[$key] = [];
    }
    $years = [];
    foreach ($plans as $plan) {
        $dates = programme_days($plan, 'atp_day');
        sort($dates);
        $day = $dates[0] ?? '';
        $programmeYear = $day !== '' ? substr($day, 0, 4) : substr((string) ($plan['atp_requestDate'] ?? ''), 0, 4);
        if (preg_match('/^\d{4}$/', $programmeYear)) {
            $years[$programmeYear] = true;
        }
        if ($programmeYear !== $year) {
            continue;
        }
        $id = (int) $plan['atp_id'];
        $offweb = in_array((string) ($plan['atp_offweb'] ?? ''), [YES_SI, 'Yes', 'yes'], true);
        $budget = trim((string) ($plan['atp_bdjet'] ?? ''));
        $savedTotal = $estimates[$id] ?? '';
        $days = trim((string) ($plan['atp_noofdays'] ?? ''));
        if ($days === '' || $days === '0') {
            $days = (string) max(1, count($dates));
        }
        $calc = [
            'planned' => trim((string) ($plan['atp_noofparticipants'] ?? '')) !== '' ? trim((string) $plan['atp_noofparticipants']) : '0',
            'days' => $days,
            'applied' => (string) ($applied[$id] ?? 0),
            'selected' => (string) ($selected[$id] ?? 0),
            'budget' => $budget,
            'estimate' => !$offweb ? ($savedTotal !== '' ? $savedTotal : $budget) : '',
            'revised' => !$offweb && $savedTotal !== '' && $budget !== '' && advance_number($savedTotal) != advance_number($budget) ? $savedTotal : '',
            'offest' => $offweb ? ($savedTotal !== '' ? $savedTotal : $budget) : '',
            'step1' => (string) ($came[$id] ?? 0),
            'step2' => isset($pays[$id]) ? total_step2($pays[$id]) : '',
        ];
        $stored = $savedRows[$id] ?? null;
        $category = total_category((string) ($plan['atp_trtype'] ?? ''));
        if ($stored && isset($groups[(string) $stored['tt_category']])) {
            $category = (string) $stored['tt_category'];
        }
        $shown = $calc;
        if ($stored) {
            foreach (total_fields() as $field) {
                $shown[$field] = (string) ($stored['tt_' . $field] ?? '');
            }
        }
        $bucket[$category][] = [
            'id' => $id,
            'name' => (string) $plan['atp_trname'],
            'day' => $day,
            'place' => (string) ($plan['atp_location'] ?? ''),
            'category' => $category,
            'values' => $shown,
        ];
    }
    foreach ($bucket as &$rowsIn) {
        usort($rowsIn, static function (array $a, array $b): int {
            $left = (string) $a['day'];
            $right = (string) $b['day'];
            if ($left === $right) {
                return strnatcasecmp((string) $a['name'], (string) $b['name']);
            }
            return $left <=> $right;
        });
    }
    unset($rowsIn);
    $yearNow = (int) date('Y');
    for ($i = 0; $i < 8; $i++) {
        $years[(string) ($yearNow - $i)] = true;
    }
    $yearList = array_keys($years);
    rsort($yearList, SORT_STRING);
    $provision = provision_row($year);
    $allocation = [
        'general' => (string) ($provision['pv_general'] ?? ''),
        'special' => (string) ($provision['pv_special'] ?? ''),
        'department' => (string) ($provision['pv_department'] ?? ''),
        'external' => (string) ($provision['pv_external'] ?? ''),
        'course' => '',
        'foreign' => '',
        'language' => (string) ($provision['pv_language'] ?? ''),
        'drug' => (string) ($provision['pv_drug'] ?? ''),
    ];
    $out = [];
    foreach ($groups as $key => $label) {
        $out[] = [
            'id' => $key,
            'label' => $label,
            'allocation' => $allocation[$key] ?? '',
            'rows' => $bucket[$key],
        ];
    }
    return [
        'year' => $year,
        'years' => $yearList,
        'allocationTotal' => (string) ($provision['pv_total'] ?? ''),
        'groups' => $out,
    ];
}

function total_staff(): void
{
    $user = require_user();
    if (!is_super($user)) {
        json_out(['ok' => false, 'error' => 'මෙය බලන්න පුළුවන් පුහුණු කාර්ය මණ්ඩලයට පමණයි.'], 403);
    }
}

function total_admin(): void
{
    if (!is_admin(require_user())) {
        json_out(['ok' => false, 'error' => 'මෙය බලන්න පුළුවන් පරිපාලකට පමණයි.'], 403);
    }
}

function action_total(): void
{
    total_admin();
    $year = provision_year((string) ($_GET['year'] ?? ''));
    json_out(['ok' => true] + total_bundle($year));
}

function action_total_save(): void
{
    csrf_check();
    total_admin();
    $rowsIn = body()['rows'] ?? [];
    if (!is_array($rowsIn)) {
        json_out(['ok' => false, 'error' => 'සුරකින්න බැරි වුණා.'], 422);
    }
    $groups = total_groups();
    $fields = total_fields();
    foreach ($rowsIn as $row) {
        if (!is_array($row)) {
            continue;
        }
        $id = (int) ($row['id'] ?? 0);
        if ($id < 1) {
            continue;
        }
        $category = (string) ($row['category'] ?? '');
        if (!isset($groups[$category])) {
            $category = 'general';
        }
        $params = [$id, $category];
        foreach ($fields as $field) {
            $params[] = mb_substr(trim((string) ($row[$field] ?? '')), 0, 40);
        }
        $stmt = db()->prepare('INSERT INTO cp_totals (tt_atpid, tt_category, tt_planned, tt_days, tt_applied, tt_selected, tt_budget, tt_estimate, tt_revised, tt_offest, tt_step1, tt_step2) VALUES (' . implode(',', array_fill(0, count($params), '?')) . ') ON DUPLICATE KEY UPDATE tt_category=VALUES(tt_category), tt_planned=VALUES(tt_planned), tt_days=VALUES(tt_days), tt_applied=VALUES(tt_applied), tt_selected=VALUES(tt_selected), tt_budget=VALUES(tt_budget), tt_estimate=VALUES(tt_estimate), tt_revised=VALUES(tt_revised), tt_offest=VALUES(tt_offest), tt_step1=VALUES(tt_step1), tt_step2=VALUES(tt_step2)');
        if (!$stmt || !bind_and_run($stmt, 'i' . str_repeat('s', count($params) - 1), $params)) {
            json_out(['ok' => false, 'error' => 'Total සුරකින්න බැරි වුණා.'], 500);
        }
    }
    json_out(['ok' => true]);
}

function action_total_calc(): void
{
    csrf_check();
    total_admin();
    $year = provision_year((string) (body()['year'] ?? ''));
    $bundle = total_bundle($year);
    $ids = [];
    foreach ($bundle['groups'] as $group) {
        foreach ($group['rows'] as $row) {
            $ids[] = (int) $row['id'];
        }
    }
    if ($ids) {
        $in = implode(',', $ids);
        db()->query('DELETE FROM cp_totals WHERE tt_atpid IN (' . $in . ')');
    }
    json_out(['ok' => true]);
}

function split_day_count(string $value): float
{
    if (preg_match('/\d+(?:\.\d+)?/', $value, $found)) {
        return (float) $found[0];
    }
    return 0.0;
}

function split_day_text(float $days): string
{
    if (abs($days - round($days)) < 0.05) {
        return (string) (int) round($days);
    }
    return rtrim(rtrim(number_format($days, 1, '.', ''), '0'), '.');
}

function split_plain(string $value): string
{
    return trim(html_entity_decode($value, ENT_QUOTES | ENT_HTML5, 'UTF-8'));
}

function split_skip(string $name, string $type): bool
{
    $blob = $name . ' ' . $type;
    $low = mb_strtolower($blob);
    if (str_contains($blob, 'මත්') || str_contains($low, 'drug')) {
        return true;
    }
    if (str_contains($blob, 'බාහිර') || str_contains($blob, 'පිටස්තර') || str_contains($low, 'external')) {
        return true;
    }
    if (str_contains($blob, 'දෙමළ') || str_contains($low, 'tamil')) {
        return true;
    }
    return false;
}

function split_computer(string $name): bool
{
    if (str_contains($name, 'පරිගණක')) {
        return true;
    }
    $low = mb_strtolower($name);
    foreach (['computer', 'ict', 'excel', 'cigas', 'database', 'network', 'hardware', 'website', 'powerpoint', 'payroll', 'ecommerce'] as $word) {
        if (preg_match('/(?<![a-z0-9])' . preg_quote($word, '/') . '/u', $low)) {
            return true;
        }
    }
    foreach (['ms project', 'power point', 'web site', 'hard ware', 'pay roll', 'data visual', 'video editing', 'artificial intelligence', 'e-commerce', 'e_commerce'] as $phrase) {
        if (str_contains($low, $phrase)) {
            return true;
        }
    }
    return false;
}

function split_unit_office(string $office): bool
{
    $plain = split_plain($office);
    $low = mb_strtolower($plain);
    if ($low === '' || $low === 'mdtu' || $low === 'test') {
        return true;
    }
    if (str_contains($low, 'training unit') || str_contains($plain, 'පුහුණු ඒකක') || str_contains($plain, 'පුහුණු ආයතන')) {
        return true;
    }
    return (bool) preg_match('/nwp\s*\/\s*cs/i', $plain);
}

function split_item(array $plan): array
{
    $days = split_day_count((string) ($plan['atp_noofdays'] ?? ''));
    return [
        'id' => (int) $plan['atp_id'],
        'name' => split_plain((string) $plan['atp_trname']),
        'days' => split_day_text($days),
        'dayCount' => $days,
        'place' => split_plain((string) ($plan['atp_location'] ?? '')),
        'money' => split_plain((string) ($plan['atp_bdjet'] ?? '')),
        'office' => split_plain((string) ($plan['atp_reqoffice'] ?? '')),
    ];
}

function split_lightest(array $sheets, string $key): int
{
    $best = 0;
    $count = count($sheets);
    for ($i = 1; $i < $count; $i++) {
        $pile = $key === 'department' ? 'departments' : $key;
        $fewer = count($sheets[$i][$pile]) < count($sheets[$best][$pile]);
        $lighter = $sheets[$i]['load'][$key] < $sheets[$best]['load'][$key];
        $tied = $sheets[$i]['load'][$key] === $sheets[$best]['load'][$key] && ($fewer || (count($sheets[$i][$pile]) === count($sheets[$best][$pile]) && $sheets[$i]['load']['all'] < $sheets[$best]['load']['all']));
        if ($lighter || $tied) {
            $best = $i;
        }
    }
    return $best;
}

function split_by_days(array $items, array &$sheets, string $key): void
{
    usort($items, static function (array $a, array $b): int {
        if ($a['dayCount'] === $b['dayCount']) {
            return $a['id'] <=> $b['id'];
        }
        return $a['dayCount'] < $b['dayCount'] ? 1 : -1;
    });
    foreach ($items as $item) {
        if (!$sheets) {
            return;
        }
        $slot = split_lightest($sheets, $key);
        $sheets[$slot][$key][] = $item;
        $sheets[$slot]['load'][$key] += $item['dayCount'];
        $sheets[$slot]['load']['all'] += $item['dayCount'];
    }
}

function split_bundle(string $year): array
{
    $plans = rows(
        'SELECT atp_id, atp_trname, atp_trtype, atp_noofdays, atp_bdjet, atp_location, atp_reqoffice,
                atp_day1, atp_day2, atp_day3, atp_day4, atp_day5, atp_day6, atp_day7, atp_day8, atp_day9, atp_day10, atp_moredays, atp_requestDate
         FROM cp_atp WHERE TRIM(atp_trname) <> \'\''
    );
    $piles = [
        'general' => [],
        'computer' => [],
        'department' => [],
        'special' => [],
        'course' => [],
        'foreign' => [],
        'language' => [],
    ];
    foreach ($plans as $plan) {
        $name = split_plain((string) ($plan['atp_trname'] ?? ''));
        if ($name === '') {
            continue;
        }
        $dates = programme_days($plan, 'atp_day');
        sort($dates);
        $day = $dates[0] ?? '';
        $programmeYear = $day !== '' ? substr($day, 0, 4) : substr((string) ($plan['atp_requestDate'] ?? ''), 0, 4);
        if ($programmeYear !== $year) {
            continue;
        }
        $type = (string) ($plan['atp_trtype'] ?? '');
        if (split_skip($name, $type)) {
            continue;
        }
        $item = split_item($plan);
        if (split_computer($name)) {
            $piles['computer'][] = $item;
            continue;
        }
        $category = total_category($type);
        if ($category === 'drug' || $category === 'external') {
            continue;
        }
        if ($category === 'language' && (str_contains($name, 'දෙමළ') || str_contains(mb_strtolower($name), 'tamil'))) {
            continue;
        }
        if ($category === 'department' || !split_unit_office((string) ($plan['atp_reqoffice'] ?? ''))) {
            $piles['department'][] = $item;
            continue;
        }
        if (!isset($piles[$category])) {
            $category = 'general';
        }
        $piles[$category][] = $item;
    }
    $logins = rows("SELECT lg_id, lg_uname, lg_office FROM cp_login WHERE lg_type = 'Super User' AND lg_uname <> 'aaa' ORDER BY lg_id");
    usort($logins, static function (array $a, array $b): int {
        $number = static function (array $row): int {
            if (preg_match('/(\d+)\s*$/', (string) $row['lg_office'], $found)) {
                return (int) $found[1];
            }
            return 1000;
        };
        $left = $number($a);
        $right = $number($b);
        if ($left === $right) {
            return strcasecmp((string) $a['lg_uname'], (string) $b['lg_uname']);
        }
        return $left <=> $right;
    });
    $sheets = [];
    foreach ($logins as $login) {
        $sheets[] = [
            'id' => (int) $login['lg_id'],
            'username' => (string) $login['lg_uname'],
            'file' => (string) $login['lg_office'],
            'general' => [],
            'computer' => [],
            'departments' => [],
            'special' => [],
            'course' => [],
            'foreign' => [],
            'language' => [],
            'load' => ['general' => 0.0, 'computer' => 0.0, 'department' => 0.0, 'special' => 0.0, 'course' => 0.0, 'foreign' => 0.0, 'language' => 0.0, 'all' => 0.0],
        ];
    }
    foreach (['general', 'computer', 'special', 'course', 'foreign', 'language'] as $key) {
        split_by_days($piles[$key], $sheets, $key);
    }
    $offices = [];
    foreach ($piles['department'] as $item) {
        $office = $item['office'] !== '' ? $item['office'] : 'දෙපාර්තමේන්තුව';
        if (!isset($offices[$office])) {
            $offices[$office] = ['office' => $office, 'dayCount' => 0.0, 'items' => []];
        }
        $offices[$office]['items'][] = $item;
        $offices[$office]['dayCount'] += $item['dayCount'];
    }
    $bundles = array_values($offices);
    usort($bundles, static function (array $a, array $b): int {
        if ($a['dayCount'] === $b['dayCount']) {
            return strcmp($a['office'], $b['office']);
        }
        return $a['dayCount'] < $b['dayCount'] ? 1 : -1;
    });
    foreach ($bundles as $bundle) {
        if (!$sheets) {
            break;
        }
        $slot = split_lightest($sheets, 'department');
        $sheets[$slot]['departments'][] = [
            'office' => $bundle['office'],
            'days' => split_day_text($bundle['dayCount']),
            'items' => $bundle['items'],
        ];
        $sheets[$slot]['load']['department'] += $bundle['dayCount'];
        $sheets[$slot]['load']['all'] += $bundle['dayCount'];
    }
    $out = [];
    foreach ($sheets as $sheet) {
        $out[] = [
            'id' => $sheet['id'],
            'username' => $sheet['username'],
            'file' => $sheet['file'],
            'days' => [
                'general' => split_day_text($sheet['load']['general']),
                'computer' => split_day_text($sheet['load']['computer']),
                'department' => split_day_text($sheet['load']['department']),
                'special' => split_day_text($sheet['load']['special']),
                'course' => split_day_text($sheet['load']['course']),
                'foreign' => split_day_text($sheet['load']['foreign']),
                'language' => split_day_text($sheet['load']['language']),
                'all' => split_day_text($sheet['load']['all']),
            ],
            'general' => $sheet['general'],
            'computer' => $sheet['computer'],
            'departments' => $sheet['departments'],
            'special' => $sheet['special'],
            'course' => $sheet['course'],
            'foreign' => $sheet['foreign'],
            'language' => $sheet['language'],
        ];
    }
    return ['year' => $year, 'sheets' => $out];
}

function action_split(): void
{
    total_staff();
    $year = provision_year((string) ($_GET['year'] ?? ''));
    json_out(['ok' => true] + split_bundle($year));
}

function progress_categories(): array
{
    return [
        ['id' => 'special', 'label' => 'විශේෂ පුහුණු', 'band' => 'main'],
        ['id' => 'general', 'label' => 'පොදු පුහුණු', 'band' => 'main'],
        ['id' => 'department', 'label' => 'දෙපාර්තමේන්තු පුහුණු', 'band' => 'main'],
        ['id' => 'tamil', 'label' => 'දෙමළ භාෂා පුහුණු', 'band' => 'lower'],
        ['id' => 'external', 'label' => 'බාහිර පුහුණු', 'band' => 'lower'],
        ['id' => 'foreign', 'label' => 'විදේශ පුහුණු', 'band' => 'lower'],
        ['id' => 'drug', 'label' => 'මත්ද්‍රව්‍ය නිවාරණ හා උපදේශන පුහුණු', 'band' => 'lower'],
    ];
}

function progress_category(string $name, string $type, string $office): string
{
    $blob = $name . ' ' . $type;
    $low = mb_strtolower($blob);
    if (str_contains($blob, 'මත්') || str_contains($blob, 'උපදේශ')) {
        return 'drug';
    }
    if (str_contains($blob, 'බාහිර') || str_contains($blob, 'පිටස්තර') || str_contains($low, 'external')) {
        return 'external';
    }
    if (str_contains($blob, 'විදේශ')) {
        return 'foreign';
    }
    if (str_contains($blob, 'දෙමළ') || str_contains($low, 'tamil')) {
        return 'tamil';
    }
    if ($type === 'විශේෂ පුහුණු' || $type === 'OBT') {
        return 'special';
    }
    if ($type === 'දෙපාර්තමේන්තු පුහුණු' || !split_unit_office($office)) {
        return 'department';
    }
    return 'general';
}

function progress_blank(): array
{
    return [
        'planCount' => 0,
        'heldCount' => 0,
        'planMoney' => 0.0,
        'spentMoney' => 0.0,
        'planPeople' => 0,
        'camePeople' => 0,
    ];
}

function progress_add(array &$box, array $item): void
{
    $box['planCount']++;
    $box['heldCount'] += $item['held'];
    $box['planMoney'] += $item['planMoney'];
    $box['spentMoney'] += $item['spentMoney'];
    $box['planPeople'] += $item['planPeople'];
    $box['camePeople'] += $item['camePeople'];
}

function progress_pack(array $box): array
{
    return [
        'planCount' => $box['planCount'],
        'heldCount' => $box['heldCount'],
        'planMoney' => advance_box($box['planMoney']),
        'spentMoney' => advance_box($box['spentMoney']),
        'planPeople' => $box['planPeople'],
        'camePeople' => $box['camePeople'],
    ];
}

function progress_report(string $year): array
{
    $split = split_bundle($year);
    $owner = [];
    $officers = [];
    foreach ($split['sheets'] as $sheet) {
        $officers[$sheet['id']] = [
            'id' => $sheet['id'],
            'username' => $sheet['username'],
            'annual' => [],
            'months' => [],
        ];
        foreach (['general', 'computer', 'special', 'course', 'foreign', 'language'] as $key) {
            foreach ($sheet[$key] as $item) {
                $owner[(int) $item['id']] = (int) $sheet['id'];
            }
        }
        foreach ($sheet['departments'] as $dep) {
            foreach ($dep['items'] as $item) {
                $owner[(int) $item['id']] = (int) $sheet['id'];
            }
        }
    }
    $spentSaved = [];
    $heldSaved = [];
    foreach (rows('SELECT ct_atpid, ct_actualexpenditure FROM cp_completedtrainings') as $row) {
        $id = (int) $row['ct_atpid'];
        $heldSaved[$id] = true;
        $spentSaved[$id] = advance_number((string) $row['ct_actualexpenditure']);
    }
    foreach (rows('SELECT al_atpid, al_spent, al_resource, al_coord, al_supervise, al_liaise, al_account, al_office FROM cp_allowances') as $row) {
        $id = (int) $row['al_atpid'];
        if (($spentSaved[$id] ?? 0) > 0) {
            continue;
        }
        $spentSaved[$id] = advance_number(total_step2($row));
    }
    $came = advance_attended_map();
    $plans = rows(
        'SELECT atp_id, atp_trname, atp_trtype, atp_noofparticipants, atp_bdjet, atp_reqoffice,
                atp_day1, atp_day2, atp_day3, atp_day4, atp_day5, atp_day6, atp_day7, atp_day8, atp_day9, atp_day10, atp_moredays, atp_requestDate
         FROM cp_atp WHERE TRIM(atp_trname) <> \'\''
    );
    $names = ['01' => 'ජනවාරි', '02' => 'පෙබරවාරි', '03' => 'මාර්තු', '04' => 'අප්‍රේල්', '05' => 'මැයි', '06' => 'ජුනි', '07' => 'ජූලි', '08' => 'අගෝස්තු', '09' => 'සැප්තැම්බර්', '10' => 'ඔක්තෝබර්', '11' => 'නොවැම්බර්', '12' => 'දෙසැම්බර්'];
    foreach ($plans as $plan) {
        $name = split_plain((string) ($plan['atp_trname'] ?? ''));
        if ($name === '') {
            continue;
        }
        $dates = programme_days($plan, 'atp_day');
        sort($dates);
        $day = $dates[0] ?? '';
        $programmeYear = $day !== '' ? substr($day, 0, 4) : substr((string) ($plan['atp_requestDate'] ?? ''), 0, 4);
        if ($programmeYear !== $year) {
            continue;
        }
        $id = (int) $plan['atp_id'];
        $who = $owner[$id] ?? 0;
        if ($who === 0 && !isset($officers[0])) {
            $officers[0] = ['id' => 0, 'username' => 'ඒකකය', 'annual' => [], 'months' => []];
        }
        $month = preg_match('/^\d{4}-(\d{2})-\d{2}$/', $day, $found) ? $found[1] : '00';
        $camePeople = (int) ($came[$id] ?? 0);
        $spent = (float) ($spentSaved[$id] ?? 0);
        $held = !empty($heldSaved[$id]) || $camePeople > 0 ? 1 : 0;
        $item = [
            'name' => $name,
            'day' => $day,
            'category' => progress_category($name, (string) ($plan['atp_trtype'] ?? ''), (string) ($plan['atp_reqoffice'] ?? '')),
            'held' => $held,
            'planMoney' => advance_number((string) ($plan['atp_bdjet'] ?? '')),
            'spentMoney' => $spent,
            'planPeople' => (int) round(split_day_count((string) ($plan['atp_noofparticipants'] ?? ''))),
            'camePeople' => $camePeople,
        ];
        if (!isset($officers[$who]['months'][$month])) {
            $officers[$who]['months'][$month] = ['month' => $month, 'label' => $names[$month] ?? 'වර්ෂය', 'items' => []];
        }
        $officers[$who]['months'][$month]['items'][] = $item;
    }
    $out = [];
    foreach ($officers as $officer) {
        $annual = [];
        foreach (progress_categories() as $category) {
            $annual[$category['id']] = progress_blank();
        }
        $months = [];
        foreach ($officer['months'] as $block) {
            $rows = [];
            foreach (progress_categories() as $category) {
                $rows[$category['id']] = progress_blank();
            }
            $packedItems = [];
            foreach ($block['items'] as $item) {
                $key = $item['category'];
                if (!isset($rows[$key])) {
                    $key = 'general';
                }
                progress_add($rows[$key], $item);
                progress_add($annual[$key], $item);
                $packedItems[] = [
                    'name' => $item['name'],
                    'day' => $item['day'],
                    'category' => $key,
                    'held' => $item['held'],
                    'planMoney' => advance_box($item['planMoney']),
                    'spentMoney' => advance_box($item['spentMoney']),
                    'planPeople' => $item['planPeople'],
                    'camePeople' => $item['camePeople'],
                ];
            }
            $packedRows = [];
            foreach ($rows as $key => $box) {
                $packedRows[$key] = progress_pack($box);
            }
            $months[] = ['month' => $block['month'], 'label' => $block['label'], 'rows' => $packedRows, 'items' => $packedItems];
        }
        usort($months, static fn (array $a, array $b): int => strcmp($a['month'], $b['month']));
        $packedAnnual = [];
        foreach ($annual as $key => $box) {
            $packedAnnual[$key] = progress_pack($box);
        }
        $out[] = [
            'id' => $officer['id'],
            'username' => $officer['username'],
            'annual' => $packedAnnual,
            'months' => $months,
        ];
    }
    usort($out, static function (array $a, array $b): int {
        if ($a['id'] === 0) {
            return 1;
        }
        if ($b['id'] === 0) {
            return -1;
        }
        return 0;
    });
    return ['year' => $year, 'categories' => progress_categories(), 'officers' => $out];
}

function action_person(): void
{
    total_staff();
    $year = provision_year((string) ($_GET['year'] ?? ''));
    json_out(['ok' => true] + progress_report($year));
}

function action_attended(): void
{
    $user = require_user();
    $year = provision_year((string) ($_GET['year'] ?? ''));
    $mine = $user['role'] === 'User';
    $office = $mine ? trim((string) ($user['office'] ?? '')) : trim((string) ($_GET['office'] ?? ''));
    $atp = trim((string) ($_GET['atp'] ?? ''));
    $nid = strtoupper(trim((string) ($_GET['nid'] ?? '')));
    if ($mine && $office === '') {
        json_out(['ok' => true, 'year' => $year, 'office' => '', 'mine' => true, 'programmes' => [], 'offices' => [], 'items' => []]);
    }
    $found = rows(
        "SELECT tratt_id, tratt_atpid, tratt_atpname, tratt_atpfileno, tratt_startdate, tratt_empnid, tratt_name, tratt_desig, tratt_office, tratt_mobile
         FROM cp_trainingattendance
         WHERE tratt_startdate BETWEEN ? AND ? AND (tratt_isparti = 'Yes' OR tratt_isparti = ?)
         ORDER BY tratt_startdate, tratt_atpname, tratt_id",
        'sss',
        [$year . '-01-01', $year . '-12-31', YES_SI]
    );
    $nids = [];
    foreach ($found as $row) {
        $key = trim((string) $row['tratt_empnid']);
        if ($key !== '') {
            $nids[$key] = true;
        }
    }
    $staff = [];
    foreach (array_chunk(array_keys($nids), 500) as $part) {
        $marks = implode(',', array_fill(0, count($part), '?'));
        foreach (rows("SELECT stf_Nid, stf_Name, stf_desig, stf_office, stf_mobile FROM cp_staff WHERE stf_Nid IN ($marks)", str_repeat('s', count($part)), $part) as $person) {
            $key = trim((string) $person['stf_Nid']);
            if (!isset($staff[$key]) || trim((string) $staff[$key]['stf_Name']) === '') {
                $staff[$key] = $person;
            }
        }
    }
    $pick = static fn(string $own, string $kept): string => trim($own) !== '' ? trim($own) : trim($kept);
    $programmes = [];
    $offices = [];
    $items = [];
    foreach ($found as $row) {
        $key = trim((string) $row['tratt_empnid']);
        $person = $staff[$key] ?? [];
        $line = [
            'date' => substr((string) $row['tratt_startdate'], 0, 10),
            'atp' => (string) $row['tratt_atpid'],
            'programme' => trim((string) $row['tratt_atpname']),
            'fileno' => trim((string) $row['tratt_atpfileno']),
            'nid' => $key,
            'name' => $pick((string) $row['tratt_name'], (string) ($person['stf_Name'] ?? '')),
            'desig' => $pick((string) $row['tratt_desig'], (string) ($person['stf_desig'] ?? '')),
            'office' => $pick((string) $row['tratt_office'], (string) ($person['stf_office'] ?? '')),
            'mobile' => $pick((string) $row['tratt_mobile'], (string) ($person['stf_mobile'] ?? '')),
        ];
        if ($office !== '' && $line['office'] !== $office) {
            continue;
        }
        if ($line['office'] !== '') {
            $offices[$line['office']] = true;
        }
        if (!isset($programmes[$line['atp']])) {
            $programmes[$line['atp']] = ['id' => $line['atp'], 'name' => $line['programme'], 'date' => $line['date'], 'people' => 0];
        }
        $programmes[$line['atp']]['people']++;
        if ($atp !== '' && $line['atp'] !== $atp) {
            continue;
        }
        if ($nid !== '' && !str_contains(strtoupper($line['nid']), $nid)) {
            continue;
        }
        $items[] = $line;
    }
    $officeList = [];
    if (!$mine) {
        foreach ($found as $row) {
            $key = trim((string) $row['tratt_empnid']);
            $name = $pick((string) $row['tratt_office'], (string) ($staff[$key]['stf_office'] ?? ''));
            if ($name !== '') {
                $officeList[$name] = true;
            }
        }
        $officeList = array_keys($officeList);
        sort($officeList);
    }
    json_out([
        'ok' => true,
        'year' => $year,
        'office' => $office,
        'mine' => $mine,
        'programmes' => array_values($programmes),
        'offices' => $officeList,
        'items' => $items,
    ]);
}

function pace_categories(): array
{
    return [
        ['id' => 'general', 'label' => 'පොදු පුහුණු'],
        ['id' => 'department', 'label' => 'දෙපාර්තමේන්තු පුහුණු'],
        ['id' => 'special', 'label' => 'විශේෂ පුහුණු'],
        ['id' => 'language', 'label' => 'භාෂා පුහුණු'],
        ['id' => 'drug', 'label' => 'මත්ද්‍රව්‍ය නිවාරණ හා උපදේශන'],
        ['id' => 'external', 'label' => 'බාහිර පුහුණු'],
        ['id' => 'meeting', 'label' => 'රැස්වීම්'],
        ['id' => 'other', 'label' => 'වෙනත්'],
    ];
}

function pace_category_id(string $name, string $type, string $office): string
{
    $blob = $name . ' ' . $type;
    if (str_contains($blob, 'රැස්වීම')) {
        return 'meeting';
    }
    $id = progress_category($name, $type, $office);
    if ($id === 'tamil') {
        return 'language';
    }
    if ($id === 'foreign') {
        return 'other';
    }
    foreach (pace_categories() as $category) {
        if ($category['id'] === $id) {
            return $id;
        }
    }
    return 'other';
}

function pace_money_map(array $row, array $keys): array
{
    $out = [];
    foreach ($keys as $key) {
        $out[$key] = (string) ($row[$key] ?? '');
    }
    return $out;
}

function pace_bundle(string $year): array
{
    $keys = ['total', 'special', 'general', 'department', 'external', 'language', 'drug', 'meeting', 'other'];
    $provision = provision_row($year);
    $original = [
        'total' => (string) ($provision['pv_total'] ?? ''),
        'special' => (string) ($provision['pv_special'] ?? ''),
        'general' => (string) ($provision['pv_general'] ?? ''),
        'department' => (string) ($provision['pv_department'] ?? ''),
        'external' => (string) ($provision['pv_external'] ?? ''),
        'language' => (string) ($provision['pv_language'] ?? ''),
        'drug' => (string) ($provision['pv_drug'] ?? ''),
        'meeting' => (string) ($provision['pv_meeting'] ?? ''),
        'other' => (string) ($provision['pv_other'] ?? ''),
    ];
    $revisedRow = rows('SELECT * FROM cp_pace_revision WHERE pr_year = ? LIMIT 1', 's', [$year]);
    $revised = $revisedRow[0] ?? [];
    $revision = [
        'date' => (string) ($revised['pr_date'] ?? ''),
        'note' => (string) ($revised['pr_note'] ?? ''),
        'total' => (string) ($revised['pr_total'] ?? ''),
        'special' => (string) ($revised['pr_special'] ?? ''),
        'general' => (string) ($revised['pr_general'] ?? ''),
        'department' => (string) ($revised['pr_department'] ?? ''),
        'external' => (string) ($revised['pr_external'] ?? ''),
        'language' => (string) ($revised['pr_language'] ?? ''),
        'drug' => (string) ($revised['pr_drug'] ?? ''),
        'other' => (string) ($revised['pr_other'] ?? ''),
    ];
    $saved = [];
    foreach (rows('SELECT * FROM cp_pace_edit WHERE pe_year = ?', 's', [$year]) as $row) {
        $saved[$row['pe_month'] . '|' . $row['pe_category']] = [
            'held' => (string) $row['pe_held'],
            'people' => (string) $row['pe_people'],
            'spent' => (string) $row['pe_spent'],
        ];
    }
    $spentSaved = [];
    $heldSaved = [];
    foreach (rows('SELECT ct_atpid, ct_actualexpenditure FROM cp_completedtrainings') as $row) {
        $id = (int) $row['ct_atpid'];
        $heldSaved[$id] = true;
        $spentSaved[$id] = advance_number((string) $row['ct_actualexpenditure']);
    }
    foreach (rows('SELECT al_atpid, al_spent, al_resource, al_coord, al_supervise, al_liaise, al_account, al_office FROM cp_allowances') as $row) {
        $id = (int) $row['al_atpid'];
        if (($spentSaved[$id] ?? 0) > 0) {
            continue;
        }
        $spentSaved[$id] = advance_number(total_step2($row));
    }
    $came = advance_attended_map();
    $plans = rows(
        'SELECT atp_id, atp_trname, atp_trtype, atp_reqoffice, atp_noofparticipants,
                atp_day1, atp_day2, atp_day3, atp_day4, atp_day5, atp_day6, atp_day7, atp_day8, atp_day9, atp_day10, atp_moredays, atp_requestDate
         FROM cp_atp WHERE TRIM(atp_trname) <> \'\''
    );
    $names = ['01' => 'ජනවාරි', '02' => 'පෙබරවාරි', '03' => 'මාර්තු', '04' => 'අප්‍රේල්', '05' => 'මැයි', '06' => 'ජුනි', '07' => 'ජූලි', '08' => 'අගෝස්තු', '09' => 'සැප්තැම්බර්', '10' => 'ඔක්තෝබර්', '11' => 'නොවැම්බර්', '12' => 'දෙසැම්බර්'];
    $blank = static function (): array {
        return ['held' => 0, 'people' => 0, 'spent' => 0.0];
    };
    $months = [];
    foreach ($names as $month => $label) {
        $rows = [];
        foreach (pace_categories() as $category) {
            $rows[$category['id']] = $blank();
        }
        $months[$month] = ['month' => $month, 'label' => $label, 'rows' => $rows];
    }
    $items = [];
    foreach ($plans as $plan) {
        $name = split_plain((string) ($plan['atp_trname'] ?? ''));
        if ($name === '') {
            continue;
        }
        $dates = programme_days($plan, 'atp_day');
        sort($dates);
        $day = $dates[0] ?? '';
        $programmeYear = $day !== '' ? substr($day, 0, 4) : substr((string) ($plan['atp_requestDate'] ?? ''), 0, 4);
        if ($programmeYear !== $year) {
            continue;
        }
        $id = (int) $plan['atp_id'];
        $camePeople = (int) ($came[$id] ?? 0);
        $held = !empty($heldSaved[$id]) || $camePeople > 0 ? 1 : 0;
        $spent = (float) ($spentSaved[$id] ?? 0);
        $category = pace_category_id($name, (string) ($plan['atp_trtype'] ?? ''), (string) ($plan['atp_reqoffice'] ?? ''));
        $month = preg_match('/^\d{4}-(\d{2})-\d{2}$/', $day, $foundMonth) ? $foundMonth[1] : '';
        if (!isset($months[$month])) {
            continue;
        }
        $months[$month]['rows'][$category]['held'] += $held;
        $months[$month]['rows'][$category]['people'] += $camePeople;
        $months[$month]['rows'][$category]['spent'] += $spent;
        $items[] = [
            'name' => $name,
            'day' => $day,
            'month' => $month,
            'category' => $category,
            'held' => $held,
            'people' => $camePeople,
            'spent' => advance_box($spent),
        ];
    }
    $outMonths = [];
    foreach ($months as $block) {
        $rows = [];
        foreach (pace_categories() as $category) {
            $calc = $block['rows'][$category['id']];
            $edit = $saved[$block['month'] . '|' . $category['id']] ?? null;
            $rows[$category['id']] = [
                'held' => $edit ? $edit['held'] : (string) $calc['held'],
                'people' => $edit ? $edit['people'] : (string) $calc['people'],
                'spent' => $edit ? $edit['spent'] : advance_box($calc['spent']),
                'calcHeld' => (string) $calc['held'],
                'calcPeople' => (string) $calc['people'],
                'calcSpent' => advance_box($calc['spent']),
                'edited' => $edit ? 1 : 0,
            ];
        }
        $outMonths[] = ['month' => $block['month'], 'label' => $block['label'], 'rows' => $rows];
    }
    return [
        'year' => $year,
        'categories' => pace_categories(),
        'original' => pace_money_map($original, $keys),
        'revision' => $revision,
        'months' => $outMonths,
        'items' => $items,
    ];
}

function ahead_clip(string $value, int $max): string
{
    $value = trim($value);
    if (mb_strlen($value) > $max) {
        $value = mb_substr($value, 0, $max);
    }
    return $value;
}

function ahead_kept(array $edit, string $key, string $fallback): string
{
    if (!isset($edit[$key])) {
        return $fallback;
    }
    $saved = trim((string) $edit[$key]);
    return $saved === '' ? $fallback : $saved;
}

function ahead_progress_bundle(string $year, string $kind): array
{
    if (!in_array($kind, ['drug', 'tamil', 'external', 'foreign', 'general', 'special', 'department'], true)) {
        $kind = 'tamil';
    }
    $plans = rows(
        'SELECT atp_id, atp_trname, atp_trtype, atp_reqoffice, atp_location, atp_noofparticipants, atp_bdjet,
                atp_day1, atp_day2, atp_day3, atp_day4, atp_day5, atp_day6, atp_day7, atp_day8, atp_day9, atp_day10, atp_moredays, atp_requestDate
         FROM cp_atp WHERE TRIM(atp_trname) <> \'\''
    );
    $spentSaved = [];
    foreach (rows('SELECT ct_atpid, ct_actualexpenditure FROM cp_completedtrainings') as $row) {
        $id = (int) $row['ct_atpid'];
        $spentSaved[$id] = advance_number((string) $row['ct_actualexpenditure']);
    }
    foreach (rows('SELECT al_atpid, al_spent, al_resource, al_coord, al_supervise, al_liaise, al_account, al_office FROM cp_allowances') as $row) {
        $id = (int) $row['al_atpid'];
        if (($spentSaved[$id] ?? 0) > 0) {
            continue;
        }
        $spentSaved[$id] = advance_number(total_step2($row));
    }
    $came = advance_attended_map();
    $saved = [];
    foreach (rows('SELECT as_atp, as_spent, as_people, as_money FROM cp_aheadsave WHERE as_year = ? AND as_kind = ?', 'ss', [$year, $kind]) as $row) {
        $saved[(int) $row['as_atp']] = $row;
    }
    $out = [];
    foreach ($plans as $plan) {
        $name = split_plain((string) ($plan['atp_trname'] ?? ''));
        if ($name === '') {
            continue;
        }
        if (progress_category($name, (string) ($plan['atp_trtype'] ?? ''), (string) ($plan['atp_reqoffice'] ?? '')) !== $kind) {
            continue;
        }
        $dates = programme_days($plan, 'atp_day');
        sort($dates);
        $day = $dates[0] ?? '';
        $programmeYear = $day !== '' ? substr($day, 0, 4) : substr((string) ($plan['atp_requestDate'] ?? ''), 0, 4);
        if ($programmeYear !== $year) {
            continue;
        }
        $id = (int) $plan['atp_id'];
        $edit = $saved[$id] ?? [];
        $cameCount = (int) ($came[$id] ?? 0);
        $planned = (int) advance_number((string) $plan['atp_noofparticipants']);
        $out[] = [
            'id' => $id,
            'name' => $name,
            'days' => implode(', ', $dates),
            'place' => split_plain((string) ($plan['atp_location'] ?? '')),
            'money' => ahead_kept($edit, 'as_money', advance_box(advance_number((string) $plan['atp_bdjet']))),
            'spent' => ahead_kept($edit, 'as_spent', advance_box((float) ($spentSaved[$id] ?? 0))),
            'people' => ahead_kept($edit, 'as_people', (string) ($cameCount > 0 ? $cameCount : $planned)),
            'sort' => $day,
        ];
    }
    usort($out, static function (array $a, array $b): int {
        $byDay = strcmp($a['sort'], $b['sort']);
        return $byDay !== 0 ? $byDay : strcmp($a['name'], $b['name']);
    });
    foreach ($out as &$row) {
        unset($row['sort']);
    }
    unset($row);
    $allocation = '';
    $allocKey = [
        'general' => 'pv_general',
        'special' => 'pv_special',
        'department' => 'pv_department',
        'external' => 'pv_external',
    ];
    if (isset($allocKey[$kind])) {
        $allocation = (string) (provision_row($year)[$allocKey[$kind]] ?? '');
    }
    return ['year' => $year, 'allocation' => $allocation, 'rows' => $out];
}

function office_progress(string $year): array
{
    $blank = static function (): array {
        return ['plan' => 0, 'held' => 0, 'target' => 0, 'came' => 0, 'spent' => 0.0];
    };
    $rows = [];
    foreach (['general', 'special', 'department', 'language', 'drug', 'external', 'meeting'] as $id) {
        $rows[$id] = $blank();
    }
    $provision = provision_row($year);
    $alloc = [
        'general' => advance_number((string) ($provision['pv_general'] ?? '')),
        'special' => advance_number((string) ($provision['pv_special'] ?? '')),
        'department' => advance_number((string) ($provision['pv_department'] ?? '')),
        'language' => advance_number((string) ($provision['pv_language'] ?? '')),
        'drug' => advance_number((string) ($provision['pv_drug'] ?? '')),
        'external' => advance_number((string) ($provision['pv_external'] ?? '')),
        'meeting' => advance_number((string) ($provision['pv_meeting'] ?? '')) + advance_number((string) ($provision['pv_other'] ?? '')),
    ];
    $spentSaved = [];
    $heldSaved = [];
    foreach (rows('SELECT ct_atpid, ct_actualexpenditure FROM cp_completedtrainings') as $row) {
        $id = (int) $row['ct_atpid'];
        $heldSaved[$id] = true;
        $spentSaved[$id] = advance_number((string) $row['ct_actualexpenditure']);
    }
    foreach (rows('SELECT al_atpid, al_spent, al_resource, al_coord, al_supervise, al_liaise, al_account, al_office FROM cp_allowances') as $row) {
        $id = (int) $row['al_atpid'];
        if (($spentSaved[$id] ?? 0) > 0) {
            continue;
        }
        $spentSaved[$id] = advance_number(total_step2($row));
    }
    $came = [];
    foreach (rows(
        "SELECT tratt_atpid, COUNT(DISTINCT tratt_empnid) AS n FROM cp_trainingattendance
         WHERE tratt_startdate BETWEEN ? AND ? AND (tratt_isparti = 'Yes' OR tratt_isparti = ?)
         GROUP BY tratt_atpid",
        'sss',
        [$year . '-01-01', $year . '-12-31', YES_SI]
    ) as $row) {
        $came[(int) $row['tratt_atpid']] = (int) $row['n'];
    }
    $plans = rows(
        'SELECT atp_id, atp_trname, atp_trtype, atp_reqoffice, atp_noofparticipants, atp_isaddatp,
                atp_day1, atp_day2, atp_day3, atp_day4, atp_day5, atp_day6, atp_day7, atp_day8, atp_day9, atp_day10, atp_moredays, atp_requestDate
         FROM cp_atp WHERE TRIM(atp_trname) <> \'\''
    );
    foreach ($plans as $plan) {
        $name = split_plain((string) ($plan['atp_trname'] ?? ''));
        if ($name === '') {
            continue;
        }
        $dates = programme_days($plan, 'atp_day');
        sort($dates);
        $day = $dates[0] ?? '';
        $programmeYear = $day !== '' ? substr($day, 0, 4) : substr((string) ($plan['atp_requestDate'] ?? ''), 0, 4);
        if ($programmeYear !== $year) {
            continue;
        }
        $category = pace_category_id($name, (string) ($plan['atp_trtype'] ?? ''), (string) ($plan['atp_reqoffice'] ?? ''));
        if (!isset($rows[$category])) {
            $category = 'meeting';
        }
        $id = (int) $plan['atp_id'];
        $attended = (int) ($came[$id] ?? 0);
        $held = !empty($heldSaved[$id]) || $attended > 0;
        if (in_array((string) ($plan['atp_isaddatp'] ?? ''), [YES_SI, 'Yes', 'yes'], true)) {
            $rows[$category]['plan']++;
            $rows[$category]['target'] += (int) advance_number((string) ($plan['atp_noofparticipants'] ?? ''));
        }
        if ($held) {
            $rows[$category]['held']++;
            $rows[$category]['came'] += $attended;
            $rows[$category]['spent'] += (float) ($spentSaved[$id] ?? 0);
        }
    }
    $out = [];
    foreach ($rows as $id => $row) {
        $out[] = [
            'id' => $id,
            'plan' => $row['plan'],
            'held' => $row['held'],
            'target' => $row['target'],
            'came' => $row['came'],
            'alloc' => advance_money($alloc[$id]),
            'spent' => advance_money($row['spent']),
        ];
    }
    $outside = rows('SELECT po_amount, po_spent, po_note FROM cp_provision_out WHERE po_year = ? LIMIT 1', 's', [$year]);
    return [
        'year' => $year,
        'rows' => $out,
        'outside' => [
            'amount' => (string) ($outside[0]['po_amount'] ?? ''),
            'spent' => (string) ($outside[0]['po_spent'] ?? ''),
            'note' => (string) ($outside[0]['po_note'] ?? ''),
        ],
    ];
}

function action_ahead_office(): void
{
    total_staff();
    $year = provision_year((string) ($_GET['year'] ?? ''));
    json_out(['ok' => true] + office_progress($year));
}

function action_ahead_office_save(): void
{
    csrf_check();
    $user = require_user();
    if (!is_super($user)) {
        json_out(['ok' => false, 'error' => 'මෙය සුරකින්න පුළුවන් පරිපාලක සහ Super User ට පමණයි.'], 403);
    }
    $data = body();
    $year = provision_year((string) ($data['year'] ?? ''));
    $amount = advance_money(advance_number((string) ($data['amount'] ?? '')));
    $spent = advance_money(advance_number((string) ($data['spent'] ?? '')));
    $note = mb_substr(trim((string) ($data['note'] ?? '')), 0, 500);
    $existing = rows('SELECT po_id FROM cp_provision_out WHERE po_year = ? LIMIT 1', 's', [$year]);
    if ($existing) {
        $stmt = db()->prepare('UPDATE cp_provision_out SET po_amount = ?, po_spent = ?, po_note = ? WHERE po_year = ?');
        $params = [$amount, $spent, $note, $year];
    } else {
        $stmt = db()->prepare('INSERT INTO cp_provision_out (po_year, po_amount, po_spent, po_note) VALUES (?, ?, ?, ?)');
        $params = [$year, $amount, $spent, $note];
    }
    if (!$stmt || !bind_and_run($stmt, 'ssss', $params)) {
        json_out(['ok' => false, 'error' => 'සුරකින්න බැරි වුණා.'], 500);
    }
    json_out(['ok' => true, 'year' => $year]);
}

function action_ahead_tamil(): void
{
    total_staff();
    $year = provision_year((string) ($_GET['year'] ?? ''));
    json_out(['ok' => true] + ahead_progress_bundle($year, 'tamil'));
}

function action_ahead_drug(): void
{
    total_staff();
    $year = provision_year((string) ($_GET['year'] ?? ''));
    json_out(['ok' => true] + ahead_progress_bundle($year, 'drug'));
}

function ahead_progress_save(string $kind): void
{
    csrf_check();
    total_staff();
    $data = body();
    $year = provision_year((string) ($data['year'] ?? ''));
    $db = db();
    $stmt = $db->prepare('INSERT INTO cp_aheadsave (as_year, as_kind, as_atp, as_spent, as_people, as_money) VALUES (?, ?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE as_spent = VALUES(as_spent), as_people = VALUES(as_people), as_money = VALUES(as_money)');
    if (!$stmt) {
        json_out(['ok' => false, 'error' => 'Could not save the progress report.'], 500);
    }
    $keep = [];
    $rows = $data['rows'] ?? [];
    if (is_array($rows)) {
        foreach ($rows as $row) {
            if (!is_array($row)) {
                continue;
            }
            $id = (int) ($row['id'] ?? 0);
            if ($id <= 0) {
                continue;
            }
            $keep[] = $id;
            bind_and_run($stmt, 'ssisss', [
                $year,
                $kind,
                $id,
                ahead_clip((string) ($row['spent'] ?? ''), 40),
                ahead_clip((string) ($row['people'] ?? ''), 20),
                ahead_clip((string) ($row['money'] ?? ''), 40),
            ]);
        }
    }
    if ($keep === []) {
        $drop = $db->prepare('DELETE FROM cp_aheadsave WHERE as_year = ? AND as_kind = ?');
        if ($drop) {
            bind_and_run($drop, 'ss', [$year, $kind]);
        }
    } else {
        $marks = implode(',', array_fill(0, count($keep), '?'));
        $drop = $db->prepare("DELETE FROM cp_aheadsave WHERE as_year = ? AND as_kind = ? AND as_atp NOT IN ($marks)");
        if ($drop) {
            bind_and_run($drop, 'ss' . str_repeat('i', count($keep)), array_merge([$year, $kind], $keep));
        }
    }
    json_out(['ok' => true]);
}

function action_ahead_tamil_save(): void
{
    ahead_progress_save('tamil');
}

function action_ahead_drug_save(): void
{
    ahead_progress_save('drug');
}

function action_ahead_external(): void
{
    total_staff();
    $year = provision_year((string) ($_GET['year'] ?? ''));
    json_out(['ok' => true] + ahead_progress_bundle($year, 'external'));
}

function action_ahead_external_save(): void
{
    ahead_progress_save('external');
}

function action_ahead_foreign(): void
{
    total_staff();
    $year = provision_year((string) ($_GET['year'] ?? ''));
    json_out(['ok' => true] + ahead_progress_bundle($year, 'foreign'));
}

function action_ahead_foreign_save(): void
{
    ahead_progress_save('foreign');
}

function action_ahead_general(): void
{
    total_staff();
    $year = provision_year((string) ($_GET['year'] ?? ''));
    json_out(['ok' => true] + ahead_progress_bundle($year, 'general'));
}

function action_ahead_general_save(): void
{
    ahead_progress_save('general');
}

function action_ahead_special(): void
{
    total_staff();
    $year = provision_year((string) ($_GET['year'] ?? ''));
    json_out(['ok' => true] + ahead_progress_bundle($year, 'special'));
}

function action_ahead_special_save(): void
{
    ahead_progress_save('special');
}

function action_ahead_department(): void
{
    total_staff();
    $year = provision_year((string) ($_GET['year'] ?? ''));
    json_out(['ok' => true] + ahead_progress_bundle($year, 'department'));
}

function action_ahead_department_save(): void
{
    ahead_progress_save('department');
}

function action_ahead_compare(): void
{
    total_staff();
    $year = provision_year((string) ($_GET['year'] ?? ''));
    $end = (int) $year;
    $years = [];
    for ($value = $end - 4; $value <= $end; $value += 1) {
        $years[] = (string) $value;
    }
    $items = [];
    foreach ($years as $item) {
        $items[] = office_progress($item);
    }
    json_out(['ok' => true, 'year' => $year, 'years' => $years, 'items' => $items]);
}

function action_pace(): void
{
    total_staff();
    $year = provision_year((string) ($_GET['year'] ?? ''));
    json_out(['ok' => true] + pace_bundle($year));
}

function action_pace_save(): void
{
    csrf_check();
    total_staff();
    $data = body();
    $year = provision_year((string) ($data['year'] ?? ''));
    $revision = is_array($data['revision'] ?? null) ? $data['revision'] : [];
    $fields = [
        mb_substr(trim((string) ($revision['date'] ?? '')), 0, 20),
        mb_substr(trim((string) ($revision['note'] ?? '')), 0, 255),
        mb_substr(trim((string) ($revision['total'] ?? '')), 0, 40),
        mb_substr(trim((string) ($revision['general'] ?? '')), 0, 40),
        mb_substr(trim((string) ($revision['department'] ?? '')), 0, 40),
        mb_substr(trim((string) ($revision['special'] ?? '')), 0, 40),
        mb_substr(trim((string) ($revision['language'] ?? '')), 0, 40),
        mb_substr(trim((string) ($revision['drug'] ?? '')), 0, 40),
        mb_substr(trim((string) ($revision['external'] ?? '')), 0, 40),
        mb_substr(trim((string) ($revision['other'] ?? '')), 0, 40),
    ];
    $existing = rows('SELECT pr_id FROM cp_pace_revision WHERE pr_year = ? LIMIT 1', 's', [$year]);
    if ($existing) {
        $sql = 'UPDATE cp_pace_revision SET pr_date=?, pr_note=?, pr_total=?, pr_general=?, pr_department=?, pr_special=?, pr_language=?, pr_drug=?, pr_external=?, pr_other=? WHERE pr_year=?';
        $stmt = db()->prepare($sql);
        $params = array_merge($fields, [$year]);
        if (!$stmt || !bind_and_run($stmt, str_repeat('s', count($params)), $params)) {
            json_out(['ok' => false, 'error' => 'සුරකින්න බැරි වුණා.'], 500);
        }
    } else {
        $sql = 'INSERT INTO cp_pace_revision (pr_year, pr_date, pr_note, pr_total, pr_general, pr_department, pr_special, pr_language, pr_drug, pr_external, pr_other) VALUES (' . implode(',', array_fill(0, 11, '?')) . ')';
        $stmt = db()->prepare($sql);
        $params = array_merge([$year], $fields);
        if (!$stmt || !bind_and_run($stmt, str_repeat('s', count($params)), $params)) {
            json_out(['ok' => false, 'error' => 'සුරකින්න බැරි වුණා.'], 500);
        }
    }
    $wipe = db()->prepare('DELETE FROM cp_pace_edit WHERE pe_year = ?');
    if (!$wipe || !bind_and_run($wipe, 's', [$year])) {
        json_out(['ok' => false, 'error' => 'සුරකින්න බැරි වුණා.'], 500);
    }
    $allowed = [];
    foreach (pace_categories() as $category) {
        $allowed[$category['id']] = true;
    }
    $edits = is_array($data['edits'] ?? null) ? $data['edits'] : [];
    $insert = db()->prepare('INSERT INTO cp_pace_edit (pe_year, pe_month, pe_category, pe_held, pe_people, pe_spent) VALUES (?, ?, ?, ?, ?, ?)');
    if (!$insert) {
        json_out(['ok' => false, 'error' => 'සුරකින්න බැරි වුණා.'], 500);
    }
    foreach ($edits as $edit) {
        if (!is_array($edit)) {
            continue;
        }
        $month = (string) ($edit['month'] ?? '');
        $category = (string) ($edit['category'] ?? '');
        if (!preg_match('/^(0[1-9]|1[0-2])$/', $month) || !isset($allowed[$category])) {
            continue;
        }
        $params = [
            $year,
            $month,
            $category,
            mb_substr(trim((string) ($edit['held'] ?? '')), 0, 20),
            mb_substr(trim((string) ($edit['people'] ?? '')), 0, 20),
            mb_substr(trim((string) ($edit['spent'] ?? '')), 0, 40),
        ];
        if (!bind_and_run($insert, 'ssssss', $params)) {
            json_out(['ok' => false, 'error' => 'සුරකින්න බැරි වුණා.'], 500);
        }
    }
    json_out(['ok' => true, 'year' => $year]);
}

function action_pace_calc(): void
{
    csrf_check();
    total_staff();
    $year = provision_year((string) (body()['year'] ?? $_GET['year'] ?? ''));
    $wipe = db()->prepare('DELETE FROM cp_pace_edit WHERE pe_year = ?');
    if (!$wipe || !bind_and_run($wipe, 's', [$year])) {
        json_out(['ok' => false, 'error' => 'ගණනය කරන්න බැරි වුණා.'], 500);
    }
    json_out(['ok' => true, 'year' => $year]);
}

function action_pace_slides(): void
{
    total_staff();
    $year = provision_year((string) ($_GET['year'] ?? ''));
    $until = substr((string) ($_GET['until'] ?? ''), 0, 20);
    $slides = [];
    foreach (rows('SELECT ps_slot, ps_title, ps_body FROM cp_pace_slide WHERE ps_year = ? AND ps_until = ? ORDER BY ps_id', 'ss', [$year, $until]) as $row) {
        $slides[] = [
            'slot' => (string) $row['ps_slot'],
            'title' => (string) $row['ps_title'],
            'body' => (string) $row['ps_body'],
        ];
    }
    json_out(['ok' => true, 'year' => $year, 'until' => $until, 'slides' => $slides]);
}

function action_pace_slides_save(): void
{
    csrf_check();
    total_staff();
    $data = body();
    $year = provision_year((string) ($data['year'] ?? ''));
    $until = mb_substr(trim((string) ($data['until'] ?? '')), 0, 20);
    if (!preg_match('/^\d{4}-\d{2}-\d{2}$/', $until)) {
        json_out(['ok' => false, 'error' => 'දිනය තෝරන්න.'], 422);
    }
    $wipe = db()->prepare('DELETE FROM cp_pace_slide WHERE ps_year = ? AND ps_until = ?');
    if (!$wipe || !bind_and_run($wipe, 'ss', [$year, $until])) {
        json_out(['ok' => false, 'error' => 'සුරකින්න බැරි වුණා.'], 500);
    }
    $insert = db()->prepare('INSERT INTO cp_pace_slide (ps_year, ps_until, ps_slot, ps_title, ps_body) VALUES (?, ?, ?, ?, ?)');
    if (!$insert) {
        json_out(['ok' => false, 'error' => 'සුරකින්න බැරි වුණා.'], 500);
    }
    $slides = is_array($data['slides'] ?? null) ? $data['slides'] : [];
    foreach ($slides as $slide) {
        if (!is_array($slide)) {
            continue;
        }
        $slot = mb_substr(trim((string) ($slide['slot'] ?? '')), 0, 40);
        if ($slot === '') {
            continue;
        }
        $params = [
            $year,
            $until,
            $slot,
            mb_substr(trim((string) ($slide['title'] ?? '')), 0, 200),
            mb_substr(trim((string) ($slide['body'] ?? '')), 0, 4000),
        ];
        if (!bind_and_run($insert, 'sssss', $params)) {
            json_out(['ok' => false, 'error' => 'සුරකින්න බැරි වුණා.'], 500);
        }
    }
    json_out(['ok' => true]);
}

function action_provision(): void
{
    $user = require_user();
    if (!is_super($user)) {
        json_out(['ok' => false, 'error' => 'මෙම ප්‍රතිපාදන බලන්න පුළුවන් පුහුණු කාර්ය මණ්ඩලයට පමණයි.'], 403);
    }
    $year = provision_year((string) ($_GET['year'] ?? ''));
    $savedYears = rows('SELECT pv_year FROM cp_provisions ORDER BY pv_year DESC');
    $years = [];
    foreach ($savedYears as $savedYear) {
        $years[] = (string) $savedYear['pv_year'];
    }
    if (!in_array($year, $years, true) && (string) ($_GET['year'] ?? '') === '' && $years) {
        $year = $years[0];
    }
    $found = rows('SELECT * FROM cp_provisions WHERE pv_year = ? LIMIT 1', 's', [$year]);
    $row = $found[0] ?? [];
    $current = provision_row($year);
    $currentItem = [];
    $currentItem['pv_total'] = (string) ($current['pv_total'] ?? '');
    foreach (provision_keys() as $key) {
        $currentItem['pv_' . $key] = (string) ($current['pv_' . $key] ?? '');
    }
    json_out([
        'ok' => true,
        'year' => $year,
        'saved' => (bool) $found,
        'years' => $years,
        'moved' => (bool) provision_moves($year),
        'current' => $currentItem,
        'item' => [
            'pv_total' => (string) ($row['pv_total'] ?? ''),
            'pv_general' => (string) ($row['pv_general'] ?? ''),
            'pv_department' => (string) ($row['pv_department'] ?? ''),
            'pv_special' => (string) ($row['pv_special'] ?? ''),
            'pv_language' => (string) ($row['pv_language'] ?? ''),
            'pv_drug' => (string) ($row['pv_drug'] ?? ''),
            'pv_external' => (string) ($row['pv_external'] ?? ''),
            'pv_meeting' => (string) ($row['pv_meeting'] ?? ''),
            'pv_other' => (string) ($row['pv_other'] ?? ''),
        ],
    ]);
}

function action_provision_save(): void
{
    csrf_check();
    $user = require_user();
    if (!is_super($user)) {
        json_out(['ok' => false, 'error' => 'මෙම ප්‍රතිපාදන සුරකින්න පුළුවන් පුහුණු කාර්ය මණ්ඩලයට පමණයි.'], 403);
    }
    $data = body();
    $year = provision_year((string) ($data['pv_year'] ?? ''));
    $keys = ['pv_total', 'pv_general', 'pv_department', 'pv_special', 'pv_language', 'pv_drug', 'pv_external', 'pv_meeting', 'pv_other'];
    $values = [];
    foreach ($keys as $key) {
        $values[] = mb_substr(trim((string) ($data[$key] ?? '')), 0, 40);
    }
    $existing = rows('SELECT pv_id FROM cp_provisions WHERE pv_year = ? LIMIT 1', 's', [$year]);
    if ($existing) {
        $sql = 'UPDATE cp_provisions SET pv_total=?, pv_general=?, pv_department=?, pv_special=?, pv_language=?, pv_drug=?, pv_external=?, pv_meeting=?, pv_other=? WHERE pv_year=?';
        $stmt = db()->prepare($sql);
        $params = array_merge($values, [$year]);
        if (!$stmt || !bind_and_run($stmt, str_repeat('s', count($params)), $params)) {
            json_out(['ok' => false, 'error' => 'ප්‍රතිපාදන සුරැකිය නොහැකි විය.'], 500);
        }
        json_out(['ok' => true, 'year' => $year]);
    }
    $sql = 'INSERT INTO cp_provisions (pv_year, pv_total, pv_general, pv_department, pv_special, pv_language, pv_drug, pv_external, pv_meeting, pv_other) VALUES (' . implode(',', array_fill(0, 10, '?')) . ')';
    $stmt = db()->prepare($sql);
    $params = array_merge([$year], $values);
    if (!$stmt || !bind_and_run($stmt, str_repeat('s', count($params)), $params)) {
        json_out(['ok' => false, 'error' => 'ප්‍රතිපාදන සුරැකිය නොහැකි විය.'], 500);
    }
    json_out(['ok' => true, 'year' => $year]);
}

function provision_keys(): array
{
    return ['general', 'department', 'special', 'language', 'drug', 'external', 'meeting', 'other'];
}

function provision_moves(string $year): array
{
    return rows('SELECT * FROM cp_provision_moves WHERE pm_year = ? ORDER BY pm_date, pm_id', 's', [$year]);
}

function provision_shift(string $year): array
{
    $shift = array_fill_keys(provision_keys(), 0.0);
    foreach (provision_moves($year) as $move) {
        $amount = (float) $move['pm_amount'];
        if (isset($shift[$move['pm_from']])) {
            $shift[$move['pm_from']] -= $amount;
        }
        if (isset($shift[$move['pm_to']])) {
            $shift[$move['pm_to']] += $amount;
        }
    }
    return $shift;
}

function provision_added(string $year): float
{
    $added = 0.0;
    foreach (provision_moves($year) as $move) {
        if ((string) $move['pm_from'] === 'new') {
            $added += (float) $move['pm_amount'];
        }
    }
    return $added;
}

function provision_row(string $year): array
{
    $found = rows('SELECT * FROM cp_provisions WHERE pv_year = ? LIMIT 1', 's', [$year]);
    $row = $found[0] ?? [];
    foreach (provision_shift($year) as $key => $change) {
        if (abs($change) < 0.005) {
            continue;
        }
        $row['pv_' . $key] = advance_money(advance_number((string) ($row['pv_' . $key] ?? '')) + $change);
    }
    $added = provision_added($year);
    if ($added > 0.004) {
        $row['pv_total'] = advance_money(advance_number((string) ($row['pv_total'] ?? '')) + $added);
    }
    return $row;
}

function action_provision_moves(): void
{
    $user = require_user();
    if (!is_super($user)) {
        json_out(['ok' => false, 'error' => 'ප්‍රතිපාදන මාරු කිරීම් බලන්න පුළුවන් පරිපාලක සහ Super User ට පමණයි.'], 403);
    }
    $year = provision_year((string) ($_GET['year'] ?? ''));
    $found = rows('SELECT * FROM cp_provisions WHERE pv_year = ? LIMIT 1', 's', [$year]);
    $original = $found[0] ?? [];
    $current = provision_row($year);
    $shift = provision_shift($year);
    $lines = [];
    foreach (provision_keys() as $key) {
        $lines[] = [
            'id' => $key,
            'original' => advance_money(advance_number((string) ($original['pv_' . $key] ?? ''))),
            'change' => advance_money($shift[$key]),
            'current' => advance_money(advance_number((string) ($current['pv_' . $key] ?? ''))),
        ];
    }
    $moves = [];
    foreach (provision_moves($year) as $move) {
        $moves[] = [
            'id' => (int) $move['pm_id'],
            'date' => substr((string) $move['pm_date'], 0, 10),
            'from' => (string) $move['pm_from'],
            'to' => (string) $move['pm_to'],
            'amount' => advance_money((float) $move['pm_amount']),
            'ref' => (string) $move['pm_ref'],
            'note' => (string) $move['pm_note'],
            'by' => (string) $move['pm_by'],
        ];
    }
    json_out([
        'ok' => true,
        'year' => $year,
        'saved' => (bool) $found,
        'total' => (string) ($original['pv_total'] ?? ''),
        'lines' => $lines,
        'moves' => $moves,
        'canDelete' => is_admin($user),
    ]);
}

function action_provision_move_save(): void
{
    csrf_check();
    $user = require_user();
    if (!is_super($user)) {
        json_out(['ok' => false, 'error' => 'ප්‍රතිපාදන මාරු කරන්න පුළුවන් පරිපාලක සහ Super User ට පමණයි.'], 403);
    }
    $data = body();
    $year = provision_year((string) ($data['year'] ?? ''));
    $from = (string) ($data['from'] ?? '');
    $to = (string) ($data['to'] ?? '');
    $amount = round(advance_number((string) ($data['amount'] ?? '')), 2);
    $date = plain_date((string) ($data['date'] ?? '')) ?: date('Y-m-d');
    $ref = mb_substr(trim((string) ($data['ref'] ?? '')), 0, 120);
    $note = mb_substr(trim((string) ($data['note'] ?? '')), 0, 1000);
    $keys = provision_keys();
    $isNew = $from === 'new';
    if ($isNew) {
        if (!in_array($to, $keys, true)) {
            json_out(['ok' => false, 'error' => 'ලැබෙන ප්‍රතිපාදනය තෝරන්න.'], 422);
        }
    } elseif (!in_array($from, $keys, true) || !in_array($to, $keys, true) || $from === $to) {
        json_out(['ok' => false, 'error' => 'මාරු කරන ප්‍රතිපාදනය සහ ලැබෙන ප්‍රතිපාදනය වෙනස් දෙකක් තෝරන්න.'], 422);
    }
    if ($amount <= 0) {
        json_out(['ok' => false, 'error' => $isNew ? 'ඇතුළත් කරන මුදල බිංදුවට වඩා වැඩි විය යුතුයි.' : 'මාරු කරන මුදල බිංදුවට වඩා වැඩි විය යුතුයි.'], 422);
    }
    if (!rows('SELECT pv_id FROM cp_provisions WHERE pv_year = ? LIMIT 1', 's', [$year])) {
        json_out(['ok' => false, 'error' => 'මේ වර්ෂයට ප්‍රතිපාදන තවම සුරැකලා නැහැ. පළමුව ප්‍රතිපාදන ටැබ් එකෙන් ඇතුළත් කරන්න.'], 422);
    }
    if (!$isNew) {
        $available = advance_number((string) (provision_row($year)['pv_' . $from] ?? ''));
        if ($amount > $available + 0.001) {
            json_out(['ok' => false, 'error' => 'මාරු කරන ප්‍රතිපාදනයේ ඉතිරි මුදල ' . advance_money($available) . ' පමණයි.'], 422);
        }
    }
    $by = (string) ($user['username'] ?? '');
    $saved = date('Y-m-d H:i:s');
    $stmt = db()->prepare('INSERT INTO cp_provision_moves (pm_year, pm_date, pm_from, pm_to, pm_amount, pm_ref, pm_note, pm_by, pm_saved) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)');
    $params = [$year, $date, $from, $to, advance_money($amount), $ref, $note, $by, $saved];
    if (!$stmt || !bind_and_run($stmt, str_repeat('s', count($params)), $params)) {
        json_out(['ok' => false, 'error' => 'ප්‍රතිපාදන මාරු කිරීම සුරැකිය නොහැකි විය.'], 500);
    }
    json_out(['ok' => true, 'id' => (int) db()->insert_id, 'year' => $year]);
}

function action_provision_move_delete(): void
{
    csrf_check();
    $user = require_user();
    if (!is_admin($user)) {
        json_out(['ok' => false, 'error' => 'ප්‍රතිපාදන මාරු කිරීමක් මකන්න පුළුවන් පරිපාලකට පමණයි.'], 403);
    }
    $id = (int) (body()['id'] ?? 0);
    $found = rows('SELECT * FROM cp_provision_moves WHERE pm_id = ? LIMIT 1', 'i', [$id]);
    if (!$found) {
        json_out(['ok' => false, 'error' => 'ඒ මාරු කිරීම හමු නොවුණා.'], 404);
    }
    $move = $found[0];
    $current = provision_row((string) $move['pm_year']);
    if (advance_number((string) ($current['pv_' . $move['pm_to']] ?? '')) + 0.001 < (float) $move['pm_amount']) {
        json_out(['ok' => false, 'error' => 'මෙය මැකුවොත් ලැබුණු ප්‍රතිපාදනය ඍණ වෙනවා. පසුව කළ මාරු කිරීම් පළමුව මකන්න.'], 422);
    }
    $stmt = db()->prepare('DELETE FROM cp_provision_moves WHERE pm_id = ?');
    if (!$stmt || !bind_and_run($stmt, 'i', [$id])) {
        json_out(['ok' => false, 'error' => 'මකන්න බැරි වුණා.'], 500);
    }
    json_out(['ok' => true]);
}

function provision_send_kinds(): array
{
    return ['general', 'special', 'department'];
}

function provision_send_kind_from_type(string $type): string
{
    if (str_contains($type, 'විශේෂ')) {
        return 'special';
    }
    if (str_contains($type, 'දෙපාර්තමේන්තු')) {
        return 'department';
    }
    return 'general';
}

function provision_send_plans(string $year): array
{
    $start = $year . '-01-01';
    $end = $year . '-12-31';
    [$yearSql, $yearTypes] = atp_year_clause();
    $rows = rows(
        "SELECT atp_id, atp_fileno, atp_trname, atp_trtype FROM cp_atp WHERE TRIM(atp_trname) <> '' AND $yearSql ORDER BY atp_fileno, atp_id",
        $yearTypes,
        atp_year_params($start, $end)
    );
    $out = [];
    foreach ($rows as $row) {
        $out[] = [
            'id' => (string) $row['atp_id'],
            'planNo' => (string) $row['atp_fileno'],
            'name' => (string) $row['atp_trname'],
            'kind' => provision_send_kind_from_type((string) $row['atp_trtype']),
        ];
    }
    return $out;
}

function provision_send_row(array $row): array
{
    $date = (string) ($row['ps_date'] ?? '');
    return [
        'id' => (int) $row['ps_id'],
        'year' => (string) $row['ps_year'],
        'atp' => (string) $row['ps_atp'],
        'plan' => (string) $row['ps_plan'],
        'name' => (string) $row['ps_name'],
        'office' => (string) $row['ps_office'],
        'moved' => substr((string) $row['ps_moved'], 0, 10),
        'amount' => advance_money((float) $row['ps_amount']),
        'kind' => (string) $row['ps_kind'],
        'letter' => (string) $row['ps_letter'],
        'date' => $date !== '' && $date !== '0000-00-00' ? substr($date, 0, 10) : '',
        'by' => (string) $row['ps_by'],
    ];
}

function action_provision_sends(): void
{
    $user = require_user();
    if (!is_super($user)) {
        json_out(['ok' => false, 'error' => 'ප්‍රතිපාදන මාරු කිරීම් බලන්න පුළුවන් පරිපාලක සහ Super User ට පමණයි.'], 403);
    }
    $year = provision_year((string) ($_GET['year'] ?? ''));
    $id = (int) ($_GET['id'] ?? 0);
    $found = rows('SELECT * FROM cp_provision_sends WHERE ps_year = ? ORDER BY ps_moved, ps_id', 's', [$year]);
    $items = [];
    $total = 0.0;
    foreach ($found as $row) {
        $item = provision_send_row($row);
        $items[] = $item;
        $total += (float) $item['amount'];
    }
    $editing = null;
    if ($id > 0) {
        $one = rows('SELECT * FROM cp_provision_sends WHERE ps_id = ? LIMIT 1', 'i', [$id]);
        $editing = $one ? provision_send_row($one[0]) : null;
    }
    json_out([
        'ok' => true,
        'year' => $year,
        'plans' => provision_send_plans($year),
        'items' => $items,
        'total' => advance_money($total),
        'item' => $editing,
        'canDelete' => is_admin($user) || is_super($user),
    ]);
}

function action_provision_send_save(): void
{
    csrf_check();
    $user = require_user();
    if (!is_super($user)) {
        json_out(['ok' => false, 'error' => 'ප්‍රතිපාදන මාරු කරන්න පුළුවන් පරිපාලක සහ Super User ට පමණයි.'], 403);
    }
    $data = body();
    $year = provision_year((string) ($data['year'] ?? ''));
    $id = (int) ($data['id'] ?? 0);
    $atp = mb_substr(trim((string) ($data['atp'] ?? '')), 0, 20);
    $plan = mb_substr(trim((string) ($data['plan'] ?? '')), 0, 80);
    $name = mb_substr(trim((string) ($data['name'] ?? '')), 0, 255);
    $office = mb_substr(trim((string) ($data['office'] ?? '')), 0, 255);
    $moved = plain_date((string) ($data['moved'] ?? '')) ?: date('Y-m-d');
    $amount = round(advance_number((string) ($data['amount'] ?? '')), 2);
    $kind = (string) ($data['kind'] ?? '');
    $letter = mb_substr(trim((string) ($data['letter'] ?? '')), 0, 120);
    $date = plain_date((string) ($data['date'] ?? ''));
    if (!in_array($kind, provision_send_kinds(), true)) {
        json_out(['ok' => false, 'error' => 'වැඩසටහන් වර්ගය තෝරන්න.'], 422);
    }
    if ($name === '' || $office === '') {
        json_out(['ok' => false, 'error' => 'පුහුණු වැඩසටහන සහ මාරු කළ ආයතනය ඇතුළත් කරන්න.'], 422);
    }
    if ($amount <= 0) {
        json_out(['ok' => false, 'error' => 'මුදල බිංදුවට වඩා වැඩි විය යුතුයි.'], 422);
    }
    $by = (string) ($user['username'] ?? '');
    $saved = date('Y-m-d H:i:s');
    $dateValue = $date !== '' ? $date : '';
    if ($id > 0) {
        $existing = rows('SELECT ps_id FROM cp_provision_sends WHERE ps_id = ? LIMIT 1', 'i', [$id]);
        if (!$existing) {
            json_out(['ok' => false, 'error' => 'ඒ මාරු කිරීම හමු නොවුණා.'], 404);
        }
        $stmt = db()->prepare('UPDATE cp_provision_sends SET ps_year=?, ps_atp=?, ps_plan=?, ps_name=?, ps_office=?, ps_moved=?, ps_amount=?, ps_kind=?, ps_letter=?, ps_date=?, ps_by=?, ps_saved=? WHERE ps_id=?');
        $params = [$year, $atp, $plan, $name, $office, $moved, advance_money($amount), $kind, $letter, $dateValue, $by, $saved, (string) $id];
        if (!$stmt || !bind_and_run($stmt, str_repeat('s', count($params)), $params)) {
            json_out(['ok' => false, 'error' => 'ප්‍රතිපාදන මාරු කිරීම සුරැකිය නොහැකි විය.'], 500);
        }
        json_out(['ok' => true, 'id' => $id, 'year' => $year]);
    }
    $stmt = db()->prepare('INSERT INTO cp_provision_sends (ps_year, ps_atp, ps_plan, ps_name, ps_office, ps_moved, ps_amount, ps_kind, ps_letter, ps_date, ps_by, ps_saved) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)');
    $params = [$year, $atp, $plan, $name, $office, $moved, advance_money($amount), $kind, $letter, $dateValue, $by, $saved];
    if (!$stmt || !bind_and_run($stmt, str_repeat('s', count($params)), $params)) {
        json_out(['ok' => false, 'error' => 'ප්‍රතිපාදන මාරු කිරීම සුරැකිය නොහැකි විය.'], 500);
    }
    json_out(['ok' => true, 'id' => (int) db()->insert_id, 'year' => $year]);
}

function action_provision_send_delete(): void
{
    csrf_check();
    $user = require_user();
    if (!is_super($user)) {
        json_out(['ok' => false, 'error' => 'ප්‍රතිපාදන මාරු කිරීමක් මකන්න පුළුවන් පරිපාලක සහ Super User ට පමණයි.'], 403);
    }
    $id = (int) (body()['id'] ?? 0);
    $found = rows('SELECT ps_id FROM cp_provision_sends WHERE ps_id = ? LIMIT 1', 'i', [$id]);
    if (!$found) {
        json_out(['ok' => false, 'error' => 'ඒ මාරු කිරීම හමු නොවුණා.'], 404);
    }
    $stmt = db()->prepare('DELETE FROM cp_provision_sends WHERE ps_id = ?');
    if (!$stmt || !bind_and_run($stmt, 'i', [$id])) {
        json_out(['ok' => false, 'error' => 'මකන්න බැරි වුණා.'], 500);
    }
    json_out(['ok' => true]);
}

function advance_number(string $value): float
{
    $clean = str_replace([',', ' '], '', trim($value));
    if ($clean === '' || !is_numeric($clean)) {
        return 0.0;
    }
    return (float) $clean;
}

function advance_money(float $value): string
{
    return number_format($value, 2, '.', '');
}

function advance_box(float $value): string
{
    if (abs($value) < 0.00001) {
        return '0';
    }
    return advance_money($value);
}

function advance_attended_map(): array
{
    $counts = [];
    $sql = "SELECT a.tapp_atpid, COUNT(DISTINCT a.tapp_officerNid) AS n
            FROM cp_trainingapplications a
            LEFT JOIN cp_trainingattendance t ON t.tratt_atpid = a.tapp_atpid AND t.tratt_empnid = a.tapp_officerNid
            WHERE a.tapp_isselected IN ('ඔව්', 'Yes', 'yes')
              AND (
                t.tratt_id IS NULL
                OR t.tratt_isparti IS NULL
                OR TRIM(t.tratt_isparti) = ''
                OR t.tratt_isparti NOT IN ('නැත', 'No', 'no')
              )
            GROUP BY a.tapp_atpid";
    foreach (rows($sql) as $row) {
        $counts[(int) $row['tapp_atpid']] = (int) $row['n'];
    }
    return $counts;
}

function advance_parse_expr(string $expr, int &$index): float
{
    $value = advance_parse_term($expr, $index);
    $length = strlen($expr);
    while ($index < $length && ($expr[$index] === '+' || $expr[$index] === '-')) {
        $op = $expr[$index];
        $index++;
        $right = advance_parse_term($expr, $index);
        $value = $op === '+' ? $value + $right : $value - $right;
    }
    return $value;
}

function advance_parse_term(string $expr, int &$index): float
{
    $value = advance_parse_factor($expr, $index);
    $length = strlen($expr);
    while ($index < $length && ($expr[$index] === '*' || $expr[$index] === '/')) {
        $op = $expr[$index];
        $index++;
        $right = advance_parse_factor($expr, $index);
        if ($op === '*') {
            $value *= $right;
        } elseif (abs($right) < 0.0000001) {
            $value = 0.0;
        } else {
            $value /= $right;
        }
    }
    return $value;
}

function advance_parse_factor(string $expr, int &$index): float
{
    $length = strlen($expr);
    if ($index < $length && $expr[$index] === '(') {
        $index++;
        $value = advance_parse_expr($expr, $index);
        if ($index < $length && $expr[$index] === ')') {
            $index++;
        }
        return $value;
    }
    $start = $index;
    if ($index < $length && ($expr[$index] === '+' || $expr[$index] === '-')) {
        $index++;
    }
    while ($index < $length && (ctype_digit($expr[$index]) || $expr[$index] === '.')) {
        $index++;
    }
    if ($start === $index) {
        return 0.0;
    }
    return (float) substr($expr, $start, $index - $start);
}

function advance_formula(string $formula): float
{
    $expr = str_replace(['×', 'x', 'X', ',', ' '], ['*', '*', '*', '', ''], trim($formula));
    if (str_starts_with($expr, '=')) {
        $expr = substr($expr, 1);
    }
    if ($expr === '' || !preg_match('/^[\d+\-*\/().]+$/', $expr) || !preg_match('/\d/', $expr)) {
        return 0.0;
    }
    $index = 0;
    $value = advance_parse_expr($expr, $index);
    return $index === strlen($expr) ? $value : 0.0;
}

function advance_government_share(int $atpId): float
{
    $stored = rows('SELECT se_sheet FROM cp_savedestimates WHERE se_atpid = ? LIMIT 1', 'i', [$atpId]);
    if (!$stored) {
        return 0.0;
    }
    $sheet = json_decode((string) $stored[0]['se_sheet'], true);
    if (!is_array($sheet)) {
        return 0.0;
    }
    $base = 0.0;
    foreach ((array) ($sheet['lecturers'] ?? []) as $person) {
        if (!is_array($person)) {
            continue;
        }
        $name = trim((string) ($person['name'] ?? ''));
        if ($name === '') {
            continue;
        }
        $people = rows('SELECT rp_nid FROM cp_resourcepersons WHERE rp_name = ?', 's', [$name]);
        $government = false;
        foreach ($people as $resource) {
            $nid = trim((string) ($resource['rp_nid'] ?? ''));
            if ($nid === '') {
                continue;
            }
            $staff = rows('SELECT stf_ID FROM cp_staff WHERE stf_Nid = ? LIMIT 1', 's', [$nid]);
            if ($staff) {
                $government = true;
                break;
            }
        }
        if ($government) {
            $base += advance_formula((string) ($person['formula'] ?? ''));
        }
    }
    return round($base * 0.10, 2);
}

function advance_coordinator(string $nid, array &$names): string
{
    $nid = trim($nid);
    if ($nid === '') {
        return '';
    }
    if (!array_key_exists($nid, $names)) {
        $staff = rows('SELECT stf_Name FROM cp_staff WHERE stf_Nid = ? LIMIT 1', 's', [$nid]);
        $name = $staff ? trim((string) $staff[0]['stf_Name']) : '';
        $names[$nid] = $name !== '' ? $name : $nid;
    }
    return $names[$nid];
}

function advance_pack(array $plan, array $saved, int $attended, string $coordinator, float $governmentShare): array
{
    $advance = advance_number((string) ($saved['ad_advance'] ?? '0'));
    $spent = advance_number((string) ($saved['ad_spent'] ?? '0'));
    $balance = $advance - $spent;
    $government = !empty($saved['ad_id'])
        ? advance_number((string) ($saved['ad_government'] ?? '0'))
        : $governmentShare;
    $dates = programme_days($plan, 'atp_day');
    sort($dates);
    $start = $dates[0] ?? '';
    $year = strlen($start) >= 4 ? substr($start, 0, 4) : substr((string) ($saved['ad_date'] ?? date('Y-m-d')), 0, 4);
    $planEstimate = trim((string) ($plan['atp_bdjet'] ?? ''));
    $prepared = trim((string) ($saved['se_total'] ?? ''));
    return [
        'id' => (int) $plan['atp_id'],
        'date' => trim((string) ($saved['ad_date'] ?? '')) !== '' ? (string) $saved['ad_date'] : date('Y-m-d'),
        'planNo' => (string) ($plan['atp_panelno'] ?? ''),
        'name' => (string) ($plan['atp_trname'] ?? ''),
        'coordinator' => $coordinator,
        'dates' => implode(', ', $dates),
        'planEstimate' => $planEstimate !== '' ? $planEstimate : '0',
        'prepared' => $prepared !== '' ? $prepared : '0',
        'advance' => advance_box($advance),
        'attended' => $attended,
        'spent' => advance_box($spent),
        'balance' => advance_money($balance),
        'government' => advance_box($government),
        'receipt' => trim((string) ($saved['ad_receipt'] ?? '')) !== '' ? (string) $saved['ad_receipt'] : '0',
        'year' => $year,
        'saved' => isset($saved['ad_id']),
        'numbers' => [
            'planEstimate' => advance_number($planEstimate),
            'prepared' => advance_number($prepared),
            'advance' => $advance,
            'attended' => $attended,
            'spent' => $spent,
            'balance' => $balance,
            'government' => $government,
        ],
    ];
}

function action_advance(): void
{
    $user = require_user();
    if (!is_super($user)) {
        json_out(['ok' => false, 'error' => 'මෙම අත්තිකාරම් විස්තර බලන්න පුළුවන් පුහුණු කාර්ය මණ්ඩලයට පමණයි.'], 403);
    }
    $id = (int) ($_GET['atp'] ?? 0);
    $found = rows('SELECT * FROM cp_atp WHERE atp_id = ? LIMIT 1', 'i', [$id]);
    if (!$found) {
        json_out(['ok' => false, 'error' => 'ඒ වැඩසටහන හමු නොවුණා.'], 404);
    }
    $stored = rows('SELECT d.ad_id, d.ad_date, d.ad_advance, d.ad_spent, d.ad_government, d.ad_receipt, s.se_total FROM cp_atp a LEFT JOIN cp_advances d ON d.ad_atpid = a.atp_id LEFT JOIN cp_savedestimates s ON s.se_atpid = a.atp_id WHERE a.atp_id = ? LIMIT 1', 'i', [$id]);
    $saved = $stored[0] ?? [];
    $counts = advance_attended_map();
    $names = [];
    $item = advance_pack($found[0], $saved, $counts[$id] ?? 0, advance_coordinator((string) ($found[0]['atp_supportstaff1'] ?? ''), $names), advance_government_share($id));
    unset($item['numbers']);
    json_out(['ok' => true, 'item' => $item]);
}

function action_advance_save(): void
{
    csrf_check();
    $user = require_user();
    if (!is_super($user)) {
        json_out(['ok' => false, 'error' => 'මෙම අත්තිකාරම් විස්තර සුරකින්න පුළුවන් පුහුණු කාර්ය මණ්ඩලයට පමණයි.'], 403);
    }
    $data = body();
    $id = (int) ($data['atp'] ?? 0);
    $found = rows('SELECT atp_id FROM cp_atp WHERE atp_id = ? LIMIT 1', 'i', [$id]);
    if (!$found) {
        json_out(['ok' => false, 'error' => 'ඒ වැඩසටහන හමු නොවුණා.'], 404);
    }
    $date = trim((string) ($data['date'] ?? ''));
    if (!preg_match('/^\d{4}-\d{2}-\d{2}$/', $date)) {
        $date = date('Y-m-d');
    }
    $advance = advance_box(advance_number((string) ($data['advance'] ?? '0')));
    $spent = advance_box(advance_number((string) ($data['spent'] ?? '0')));
    $government = advance_box(advance_number((string) ($data['government'] ?? '0')));
    $receipt = mb_substr(trim((string) ($data['receipt'] ?? '0')), 0, 40);
    if ($receipt === '') {
        $receipt = '0';
    }
    $existing = rows('SELECT ad_id FROM cp_advances WHERE ad_atpid = ? LIMIT 1', 'i', [$id]);
    if ($existing) {
        $stmt = db()->prepare('UPDATE cp_advances SET ad_date=?, ad_advance=?, ad_spent=?, ad_government=?, ad_receipt=? WHERE ad_atpid=?');
        $ok = $stmt && bind_and_run($stmt, 'sssssi', [$date, $advance, $spent, $government, $receipt, $id]);
    } else {
        $stmt = db()->prepare('INSERT INTO cp_advances (ad_atpid, ad_date, ad_advance, ad_spent, ad_government, ad_receipt) VALUES (?, ?, ?, ?, ?, ?)');
        $ok = $stmt && bind_and_run($stmt, 'isssss', [$id, $date, $advance, $spent, $government, $receipt]);
    }
    if (!$ok) {
        json_out(['ok' => false, 'error' => 'අත්තිකාරම් විස්තර සුරැකිය නොහැකි විය.'], 500);
    }
    json_out(['ok' => true]);
}

function action_advances(): void
{
    $user = require_user();
    if (!is_super($user)) {
        json_out(['ok' => false, 'error' => 'මෙම අත්තිකාරම් විස්තර බලන්න පුළුවන් පුහුණු කාර්ය මණ්ඩලයට පමණයි.'], 403);
    }
    $rows = rows(
        'SELECT d.ad_id, d.ad_atpid, d.ad_date, d.ad_advance, d.ad_spent, d.ad_government, d.ad_receipt, s.se_total,
                a.atp_id, a.atp_panelno, a.atp_trname, a.atp_supportstaff1, a.atp_bdjet,
                a.atp_day1, a.atp_day2, a.atp_day3, a.atp_day4, a.atp_day5, a.atp_day6, a.atp_day7, a.atp_day8, a.atp_day9, a.atp_day10, a.atp_moredays
         FROM cp_advances d
         JOIN cp_atp a ON a.atp_id = d.ad_atpid
         LEFT JOIN cp_savedestimates s ON s.se_atpid = d.ad_atpid'
    );
    $counts = advance_attended_map();
    $names = [];
    $packed = [];
    foreach ($rows as $row) {
        $id = (int) $row['atp_id'];
        $packed[] = advance_pack($row, $row, $counts[$id] ?? 0, advance_coordinator((string) ($row['atp_supportstaff1'] ?? ''), $names), 0.0);
    }
    $years = [];
    foreach ($packed as $item) {
        if (!in_array($item['year'], $years, true) && preg_match('/^\d{4}$/', $item['year'])) {
            $years[] = $item['year'];
        }
    }
    rsort($years);
    $asked = trim((string) ($_GET['year'] ?? ''));
    $year = $asked !== '' ? provision_year($asked) : ($years[0] ?? date('Y'));
    $items = [];
    $totals = [
        'planEstimate' => 0.0,
        'prepared' => 0.0,
        'advance' => 0.0,
        'attended' => 0,
        'spent' => 0.0,
        'balance' => 0.0,
        'government' => 0.0,
    ];
    foreach ($packed as $item) {
        if ($item['year'] !== $year) {
            continue;
        }
        foreach ($totals as $key => $value) {
            $totals[$key] += $item['numbers'][$key];
        }
        unset($item['numbers']);
        $items[] = $item;
    }
    json_out([
        'ok' => true,
        'year' => $year,
        'years' => $years,
        'items' => $items,
        'totals' => [
            'planEstimate' => advance_money($totals['planEstimate']),
            'prepared' => advance_money($totals['prepared']),
            'advance' => advance_money($totals['advance']),
            'attended' => $totals['attended'],
            'spent' => advance_money($totals['spent']),
            'balance' => advance_money($totals['balance']),
            'government' => advance_money($totals['government']),
        ],
    ]);
}

function foodbill_lines($raw): array
{
    if (is_string($raw)) {
        $decoded = json_decode($raw, true);
    } elseif (is_array($raw)) {
        $decoded = $raw;
    } else {
        $decoded = null;
    }
    if (!is_array($decoded)) {
        return [];
    }
    $lines = [];
    foreach ($decoded as $line) {
        if (!is_array($line)) {
            continue;
        }
        $text = mb_substr(trim((string) ($line['text'] ?? '')), 0, 200);
        $amount = advance_number((string) ($line['amount'] ?? '0'));
        if ($text === '' && abs($amount) < 0.00001) {
            continue;
        }
        $lines[] = ['text' => $text, 'amount' => advance_box($amount)];
        if (count($lines) >= 40) {
            break;
        }
    }
    return $lines;
}

function foodbill_item(int $id): ?array
{
    $found = rows('SELECT * FROM cp_atp WHERE atp_id = ? LIMIT 1', 'i', [$id]);
    if (!$found) {
        return null;
    }
    $stored = rows('SELECT d.ad_id, d.ad_date, d.ad_advance, d.ad_spent, d.ad_government, d.ad_receipt, s.se_total FROM cp_atp a LEFT JOIN cp_advances d ON d.ad_atpid = a.atp_id LEFT JOIN cp_savedestimates s ON s.se_atpid = a.atp_id WHERE a.atp_id = ? LIMIT 1', 'i', [$id]);
    $saved = $stored[0] ?? [];
    $counts = advance_attended_map();
    $names = [];
    $base = advance_pack($found[0], $saved, $counts[$id] ?? 0, advance_coordinator((string) ($found[0]['atp_supportstaff1'] ?? ''), $names), 0.0);
    $bill = rows('SELECT fb_id, fb_date, fb_advance, fb_food, fb_lines FROM cp_foodbills WHERE fb_atpid = ? LIMIT 1', 'i', [$id]);
    $row = $bill[0] ?? [];
    $lines = foodbill_lines($row['fb_lines'] ?? '[]');
    $food = 0.0;
    foreach ($lines as $line) {
        $food += advance_number($line['amount']);
    }
    if (isset($row['fb_id'])) {
        $food = advance_number((string) ($row['fb_food'] ?? '0'));
    }
    $spent = advance_number($base['spent']);
    $total = $spent + $food;
    $plan = advance_number($base['planEstimate']);
    $gap = $plan - $total;
    $typed = trim((string) ($row['fb_advance'] ?? ''));
    $planned = trim((string) ($found[0]['atp_noofparticipants'] ?? ''));
    return [
        'id' => $base['id'],
        'date' => trim((string) ($row['fb_date'] ?? '')) !== '' ? (string) $row['fb_date'] : $base['date'],
        'planNo' => $base['planNo'],
        'name' => $base['name'],
        'coordinator' => $base['coordinator'],
        'dates' => $base['dates'],
        'planned' => $planned !== '' ? $planned : '0',
        'attended' => $base['attended'],
        'planEstimate' => $base['planEstimate'],
        'prepared' => $base['prepared'],
        'advance' => $typed !== '' ? advance_box(advance_number($typed)) : $base['advance'],
        'spent' => $base['spent'],
        'food' => advance_money($food),
        'total' => advance_money($total),
        'gap' => advance_money(abs($gap)),
        'short' => $gap < -0.00001,
        'lines' => $lines,
        'saved' => isset($row['fb_id']),
    ];
}

function action_foodbill(): void
{
    $user = require_user();
    if (!is_super($user)) {
        json_out(['ok' => false, 'error' => 'මෙම ආහාර බිල් පියවීම බලන්න පුළුවන් පුහුණු කාර්ය මණ්ඩලයට පමණයි.'], 403);
    }
    $atp = (int) ($_GET['atp'] ?? 0);
    $item = foodbill_item($atp);
    if (!$item) {
        json_out(['ok' => false, 'error' => 'ඒ වැඩසටහන හමු නොවුණා.'], 404);
    }
    json_out(['ok' => true, 'item' => $item, 'closed' => programme_steps_done($atp)]);
}

function action_foodbill_save(): void
{
    csrf_check();
    $user = require_user();
    if (!is_super($user)) {
        json_out(['ok' => false, 'error' => 'මෙම ආහාර බිල් පියවීම සුරකින්න පුළුවන් පුහුණු කාර්ය මණ්ඩලයට පමණයි.'], 403);
    }
    $data = body();
    $id = (int) ($data['atp'] ?? 0);
    $found = rows('SELECT atp_id FROM cp_atp WHERE atp_id = ? LIMIT 1', 'i', [$id]);
    if (!$found) {
        json_out(['ok' => false, 'error' => 'ඒ වැඩසටහන හමු නොවුණා.'], 404);
    }
    $date = trim((string) ($data['date'] ?? ''));
    if (!preg_match('/^\d{4}-\d{2}-\d{2}$/', $date)) {
        $date = date('Y-m-d');
    }
    $advance = advance_box(advance_number((string) ($data['advance'] ?? '0')));
    $food = advance_box(advance_number((string) ($data['food'] ?? '0')));
    $lines = foodbill_lines($data['lines'] ?? []);
    $encoded = json_encode($lines);
    if ($encoded === false) {
        $encoded = '[]';
    }
    $existing = rows('SELECT fb_id FROM cp_foodbills WHERE fb_atpid = ? LIMIT 1', 'i', [$id]);
    if ($existing) {
        $stmt = db()->prepare('UPDATE cp_foodbills SET fb_date=?, fb_advance=?, fb_food=?, fb_lines=? WHERE fb_atpid=?');
        $ok = $stmt && bind_and_run($stmt, 'ssssi', [$date, $advance, $food, $encoded, $id]);
    } else {
        $stmt = db()->prepare('INSERT INTO cp_foodbills (fb_atpid, fb_date, fb_advance, fb_food, fb_lines) VALUES (?, ?, ?, ?, ?)');
        $ok = $stmt && bind_and_run($stmt, 'issss', [$id, $date, $advance, $food, $encoded]);
    }
    if (!$ok) {
        json_out(['ok' => false, 'error' => 'ආහාර බිල් පියවීම සුරැකිය නොහැකි විය.'], 500);
    }
    json_out(['ok' => true, 'closed' => finish_programme_if_ready($id)]);
}

function estimate_sheet(int $id): array
{
    $stored = rows('SELECT se_sheet FROM cp_savedestimates WHERE se_atpid = ? LIMIT 1', 'i', [$id]);
    if (!$stored) {
        return [];
    }
    $sheet = json_decode((string) $stored[0]['se_sheet'], true);
    return is_array($sheet) ? $sheet : [];
}

function estimate_line_amount(array $sheet, string $key): float
{
    foreach ((array) ($sheet['lines'] ?? []) as $line) {
        if (!is_array($line) || (string) ($line['key'] ?? '') !== $key) {
            continue;
        }
        return advance_formula((string) ($line['formula'] ?? ''));
    }
    return 0.0;
}

function estimate_lecture_total(array $sheet): float
{
    $sum = 0.0;
    foreach ((array) ($sheet['lecturers'] ?? []) as $person) {
        if (!is_array($person)) {
            continue;
        }
        $sum += advance_formula((string) ($person['formula'] ?? ''));
    }
    if (abs($sum) < 0.00001) {
        return estimate_line_amount($sheet, 'lecture');
    }
    return $sum;
}

function allowance_text(string $value): string
{
    return mb_substr(trim($value), 0, 500);
}

function allowance_people($raw): array
{
    if (is_string($raw)) {
        $decoded = json_decode($raw, true);
    } elseif (is_array($raw)) {
        $decoded = $raw;
    } else {
        $decoded = null;
    }
    if (!is_array($decoded)) {
        return [];
    }
    $people = [];
    foreach ($decoded as $person) {
        if (!is_array($person)) {
            continue;
        }
        $nid = mb_substr(trim((string) ($person['nid'] ?? '')), 0, 40);
        $name = mb_substr(trim((string) ($person['name'] ?? '')), 0, 200);
        if ($nid === '' && $name === '') {
            continue;
        }
        $people[] = ['nid' => $nid, 'name' => $name];
        if (count($people) >= 20) {
            break;
        }
    }
    return $people;
}

function allowance_named(string $value, array &$names): string
{
    $value = trim($value);
    if ($value === '') {
        return '';
    }
    if (preg_match('/\d{6,}/', $value)) {
        return advance_coordinator($value, $names);
    }
    return $value;
}

function office_assistant_choices(array $extra): array
{
    $names = [];
    $people = $extra;
    foreach (rows('SELECT al_officeids FROM cp_allowances') as $row) {
        foreach (allowance_people($row['al_officeids'] ?? '[]') as $person) {
            $people[] = $person;
        }
    }
    $byNid = [];
    foreach ($people as $person) {
        if (!is_array($person)) {
            continue;
        }
        $nid = trim((string) ($person['nid'] ?? ''));
        if ($nid === '') {
            continue;
        }
        $name = trim((string) ($person['name'] ?? ''));
        $looked = advance_coordinator($nid, $names);
        if ($looked !== '' && $looked !== $nid) {
            $name = $looked;
        }
        if (!isset($byNid[$nid]) || ($byNid[$nid]['name'] === '' && $name !== '')) {
            $byNid[$nid] = ['nid' => $nid, 'name' => $name];
        }
    }
    $list = array_values($byNid);
    usort($list, static function (array $a, array $b): int {
        return strcmp($a['name'] !== '' ? $a['name'] : $a['nid'], $b['name'] !== '' ? $b['name'] : $b['nid']);
    });
    return $list;
}

function plan_support_people(array $plan, array &$names): array
{
    $ids = [];
    for ($i = 2; $i <= 6; $i++) {
        $nid = trim((string) ($plan['atp_supportstaff' . $i] ?? ''));
        if ($nid !== '') {
            $ids[] = $nid;
        }
    }
    foreach (preg_split('/\R/', (string) ($plan['atp_moresupport'] ?? '')) as $extra) {
        $extra = trim($extra);
        if ($extra !== '') {
            $ids[] = $extra;
        }
    }
    $people = [];
    foreach ($ids as $nid) {
        $people[] = ['nid' => $nid, 'name' => advance_coordinator($nid, $names)];
        if (count($people) >= 20) {
            break;
        }
    }
    return $people;
}

function estimate_lecture_names(array $sheet, array $plan): string
{
    $names = [];
    for ($i = 1; $i <= 10; $i++) {
        $name = trim((string) ($plan['atp_resourcep' . $i] ?? ''));
        if ($name !== '') {
            $names[] = $name;
        }
    }
    foreach (preg_split('/\R/', (string) ($plan['atp_moreresource'] ?? '')) as $extra) {
        $extra = trim($extra);
        if ($extra !== '') {
            $names[] = $extra;
        }
    }
    if (!$names) {
        foreach ((array) ($sheet['lecturers'] ?? []) as $person) {
            if (!is_array($person)) {
                continue;
            }
            $name = trim((string) ($person['name'] ?? ''));
            if ($name !== '') {
                $names[] = $name;
            }
        }
    }
    return implode(', ', $names);
}

function allowance_item(int $id): ?array
{
    $found = rows('SELECT * FROM cp_atp WHERE atp_id = ? LIMIT 1', 'i', [$id]);
    if (!$found) {
        return null;
    }
    $stored = rows('SELECT d.ad_id, d.ad_date, d.ad_advance, d.ad_spent, d.ad_government, d.ad_receipt, s.se_total FROM cp_atp a LEFT JOIN cp_advances d ON d.ad_atpid = a.atp_id LEFT JOIN cp_savedestimates s ON s.se_atpid = a.atp_id WHERE a.atp_id = ? LIMIT 1', 'i', [$id]);
    $saved = $stored[0] ?? [];
    $counts = advance_attended_map();
    $names = [];
    $base = advance_pack($found[0], $saved, $counts[$id] ?? 0, advance_coordinator((string) ($found[0]['atp_supportstaff1'] ?? ''), $names), 0.0);
    $sheet = estimate_sheet($id);
    $plan = $found[0];
    $planned = trim((string) ($plan['atp_noofparticipants'] ?? ''));
    $support = plan_support_people($plan, $names);
    $officeUnit = estimate_line_amount($sheet, '6.11');
    $officeCount = count($support);
    $suggest = [
        'date' => $base['date'],
        'planNo' => (string) $base['planNo'],
        'name' => (string) $base['name'],
        'coordinator' => (string) $base['coordinator'],
        'dates' => (string) $base['dates'],
        'planned' => $planned !== '' ? $planned : '0',
        'attended' => (string) $base['attended'],
        'resource' => advance_box(estimate_lecture_total($sheet)),
        'resourceWho' => estimate_lecture_names($sheet, $plan),
        'coord' => advance_box(estimate_line_amount($sheet, '6.7')),
        'coordWho' => signatory_profile()['display'],
        'supervise' => advance_box(estimate_line_amount($sheet, '6.8')),
        'superviseWho' => allowance_named((string) ($plan['atp_supervisor'] ?? ''), $names),
        'liaise' => advance_box(estimate_line_amount($sheet, '6.9')),
        'liaiseWho' => (string) $base['coordinator'],
        'account' => advance_box(estimate_line_amount($sheet, '6.10')),
        'accountWho' => 'අචිනි අප්සරා මෙය',
        'office' => advance_box($officeUnit * ($officeCount > 0 ? $officeCount : 1)),
        'spent' => (string) $base['spent'],
    ];
    $row = rows('SELECT * FROM cp_allowances WHERE al_atpid = ? LIMIT 1', 'i', [$id]);
    $kept = $row[0] ?? [];
    $savedRow = isset($kept['al_id']);
    $pick = static function (string $column, string $key, bool $money) use ($kept, $suggest, $savedRow): string {
        if (!$savedRow) {
            return $suggest[$key];
        }
        $value = (string) ($kept[$column] ?? '');
        return $money ? advance_box(advance_number($value)) : $value;
    };
    $resource = advance_number($pick('al_resource', 'resource', true));
    $coord = advance_number($pick('al_coord', 'coord', true));
    $supervise = advance_number($pick('al_supervise', 'supervise', true));
    $liaise = advance_number($pick('al_liaise', 'liaise', true));
    $account = advance_number($pick('al_account', 'account', true));
    $office = advance_number($pick('al_office', 'office', true));
    $officePeople = $savedRow ? allowance_people($kept['al_officeids'] ?? '[]') : $support;
    if (!$officePeople) {
        $officePeople = $support;
    }
    foreach ($officePeople as $index => $person) {
        $nid = trim((string) ($person['nid'] ?? ''));
        if ($nid === '') {
            continue;
        }
        $foundName = advance_coordinator($nid, $names);
        if ($foundName !== '' && $foundName !== $nid) {
            $officePeople[$index]['name'] = $foundName;
        }
    }
    $foodSaved = rows('SELECT fb_food FROM cp_foodbills WHERE fb_atpid = ? LIMIT 1', 'i', [$id]);
    $spentAmount = advance_number((string) $base['spent']);
    $billTotal = $spentAmount + advance_number((string) ($foodSaved[0]['fb_food'] ?? '0'));
    $savedAccountWho = trim((string) ($kept['al_accountwho'] ?? ''));
    $cashName = trim((string) ($plan['atp_cashofficername'] ?? ''));
    $accountWho = ($savedRow && $savedAccountWho !== '' && $savedAccountWho !== $cashName) ? $savedAccountWho : $suggest['accountWho'];
    $coordWho = $suggest['coordWho'];
    return [
        'id' => $id,
        'date' => $pick('al_date', 'date', false),
        'planNo' => $pick('al_planno', 'planNo', false),
        'name' => $pick('al_name', 'name', false),
        'coordinator' => $pick('al_coordinator', 'coordinator', false),
        'dates' => $pick('al_dates', 'dates', false),
        'planned' => $pick('al_planned', 'planned', false),
        'attended' => $pick('al_attended', 'attended', false),
        'resource' => advance_box($resource),
        'resourceWho' => $suggest['resourceWho'],
        'coord' => advance_box($coord),
        'coordWho' => $coordWho,
        'supervise' => advance_box($supervise),
        'superviseWho' => $suggest['superviseWho'],
        'liaise' => advance_box($liaise),
        'liaiseWho' => $suggest['liaiseWho'],
        'account' => advance_box($account),
        'accountWho' => $accountWho,
        'office' => advance_box($office),
        'officeWho' => (static function () use ($plan, &$names): string {
            $nid = trim((string) ($plan['atp_supportstaff2'] ?? ''));
            if ($nid === '') {
                return '';
            }
            $name = advance_coordinator($nid, $names);
            return $name === $nid ? '' : $name;
        })(),
        'officeUnit' => advance_box($officeUnit),
        'officePeople' => $officePeople,
        'officeChoices' => office_assistant_choices(array_merge($officePeople, $support)),
        'spent' => advance_box($spentAmount),
        'total' => advance_money($billTotal),
        'saved' => $savedRow,
    ];
}

function action_allowance(): void
{
    $user = require_user();
    if (!is_super($user)) {
        json_out(['ok' => false, 'error' => 'මෙම දීමනා ගෙවීම බලන්න පුළුවන් පුහුණු කාර්ය මණ්ඩලයට පමණයි.'], 403);
    }
    $atp = (int) ($_GET['atp'] ?? 0);
    $item = allowance_item($atp);
    if (!$item) {
        json_out(['ok' => false, 'error' => 'ඒ වැඩසටහන හමු නොවුණා.'], 404);
    }
    json_out(['ok' => true, 'item' => $item, 'closed' => programme_steps_done($atp)]);
}

function action_allowance_save(): void
{
    csrf_check();
    $user = require_user();
    if (!is_super($user)) {
        json_out(['ok' => false, 'error' => 'මෙම දීමනා ගෙවීම සුරකින්න පුළුවන් පුහුණු කාර්ය මණ්ඩලයට පමණයි.'], 403);
    }
    $data = body();
    $id = (int) ($data['atp'] ?? 0);
    $found = rows('SELECT atp_id FROM cp_atp WHERE atp_id = ? LIMIT 1', 'i', [$id]);
    if (!$found) {
        json_out(['ok' => false, 'error' => 'ඒ වැඩසටහන හමු නොවුණා.'], 404);
    }
    $date = trim((string) ($data['date'] ?? ''));
    if (!preg_match('/^\d{4}-\d{2}-\d{2}$/', $date)) {
        $date = date('Y-m-d');
    }
    $values = [
        $date,
        allowance_text((string) ($data['planNo'] ?? '')),
        allowance_text((string) ($data['name'] ?? '')),
        allowance_text((string) ($data['coordinator'] ?? '')),
        allowance_text((string) ($data['dates'] ?? '')),
        mb_substr(trim((string) ($data['planned'] ?? '')), 0, 80),
        mb_substr(trim((string) ($data['attended'] ?? '')), 0, 80),
        advance_box(advance_number((string) ($data['resource'] ?? '0'))),
        allowance_text((string) ($data['resourceWho'] ?? '')),
        advance_box(advance_number((string) ($data['coord'] ?? '0'))),
        allowance_text((string) ($data['coordWho'] ?? '')),
        advance_box(advance_number((string) ($data['supervise'] ?? '0'))),
        allowance_text((string) ($data['superviseWho'] ?? '')),
        advance_box(advance_number((string) ($data['liaise'] ?? '0'))),
        allowance_text((string) ($data['liaiseWho'] ?? '')),
        advance_box(advance_number((string) ($data['account'] ?? '0'))),
        allowance_text((string) ($data['accountWho'] ?? '')),
        advance_box(advance_number((string) ($data['office'] ?? '0'))),
        json_encode(allowance_people($data['officePeople'] ?? [])) ?: '[]',
        advance_box(advance_number((string) ($data['spent'] ?? '0'))),
    ];
    $existing = rows('SELECT al_id FROM cp_allowances WHERE al_atpid = ? LIMIT 1', 'i', [$id]);
    if ($existing) {
        $stmt = db()->prepare('UPDATE cp_allowances SET al_date=?, al_planno=?, al_name=?, al_coordinator=?, al_dates=?, al_planned=?, al_attended=?, al_resource=?, al_resourcewho=?, al_coord=?, al_coordwho=?, al_supervise=?, al_supervisewho=?, al_liaise=?, al_liaisewho=?, al_account=?, al_accountwho=?, al_office=?, al_officeids=?, al_spent=? WHERE al_atpid=?');
        $ok = $stmt && bind_and_run($stmt, 'ssssssssssssssssssssi', array_merge($values, [$id]));
    } else {
        $stmt = db()->prepare('INSERT INTO cp_allowances (al_atpid, al_date, al_planno, al_name, al_coordinator, al_dates, al_planned, al_attended, al_resource, al_resourcewho, al_coord, al_coordwho, al_supervise, al_supervisewho, al_liaise, al_liaisewho, al_account, al_accountwho, al_office, al_officeids, al_spent) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)');
        $ok = $stmt && bind_and_run($stmt, 'issssssssssssssssssss', array_merge([$id], $values));
    }
    if (!$ok) {
        json_out(['ok' => false, 'error' => 'දීමනා ගෙවීම සුරැකිය නොහැකි විය.'], 500);
    }
    json_out(['ok' => true, 'closed' => finish_programme_if_ready($id)]);
}

function settle_same_name(string $left, string $right): bool
{
    $left = preg_replace('/\s+/u', ' ', trim($left)) ?? '';
    $right = preg_replace('/\s+/u', ' ', trim($right)) ?? '';
    return $left !== '' && $left === $right;
}

function settle_lecture_rows(array $plan, array $sheet): array
{
    $named = [];
    for ($i = 1; $i <= 10; $i++) {
        $name = trim((string) ($plan['atp_resourcep' . $i] ?? ''));
        if ($name !== '') {
            $named[] = $name;
        }
    }
    foreach (preg_split('/\R/u', (string) ($plan['atp_moreresource'] ?? '')) ?: [] as $extra) {
        $extra = trim((string) $extra);
        if ($extra !== '') {
            $named[] = $extra;
        }
    }
    $priced = [];
    foreach ((array) ($sheet['lecturers'] ?? []) as $person) {
        if (!is_array($person)) {
            continue;
        }
        $priced[] = [
            'name' => trim((string) ($person['name'] ?? '')),
            'amount' => advance_formula((string) ($person['formula'] ?? '')),
        ];
    }
    if (!$named) {
        foreach ($priced as $person) {
            if ($person['name'] !== '') {
                $named[] = $person['name'];
            }
        }
    }
    $rows = [];
    foreach ($named as $index => $name) {
        $amount = 0.0;
        foreach ($priced as $person) {
            if (settle_same_name($person['name'], $name)) {
                $amount = $person['amount'];
                break;
            }
        }
        if (abs($amount) < 0.00001 && isset($priced[$index]) && ($priced[$index]['name'] === '' || settle_same_name($priced[$index]['name'], $name))) {
            $amount = $priced[$index]['amount'];
        }
        $rows[] = ['name' => $name, 'amount' => $amount];
    }
    return $rows;
}

function settle_group_add(array &$groups, string $key, string $who, string $nid, string $programme, float $amount): void
{
    if ($key === '') {
        return;
    }
    if (!isset($groups[$key])) {
        $groups[$key] = ['who' => $who, 'nid' => $nid, 'amount' => 0.0, 'programmes' => []];
    }
    $groups[$key]['amount'] += $amount;
    $groups[$key]['programmes'][] = ['name' => $programme, 'amount' => advance_money($amount)];
}

function settle_groups(array $groups): array
{
    $list = array_values($groups);
    usort($list, static function (array $left, array $right): int {
        return strcmp($left['who'] !== '' ? $left['who'] : $left['nid'], $right['who'] !== '' ? $right['who'] : $right['nid']);
    });
    $out = [];
    foreach ($list as $group) {
        $out[] = [
            'who' => $group['who'],
            'nid' => $group['nid'],
            'amount' => advance_money($group['amount']),
            'count' => count($group['programmes']),
            'programmes' => $group['programmes'],
        ];
    }
    return $out;
}

function action_settle(): void
{
    $user = require_user();
    if (!is_super($user)) {
        json_out(['ok' => false, 'error' => 'මෙම වාර්තා බලන්න පුළුවන් පුහුණු කාර්ය මණ්ඩලයට පමණයි.'], 403);
    }
    $plans = rows(
        'SELECT atp_id, atp_panelno, atp_trname, atp_bdjet, atp_supportstaff1, atp_supervisor,
                atp_supportstaff2, atp_supportstaff3, atp_supportstaff4, atp_supportstaff5, atp_supportstaff6, atp_moresupport,
                atp_resourcep1, atp_resourcep2, atp_resourcep3, atp_resourcep4, atp_resourcep5,
                atp_resourcep6, atp_resourcep7, atp_resourcep8, atp_resourcep9, atp_resourcep10, atp_moreresource,
                atp_day1, atp_day2, atp_day3, atp_day4, atp_day5, atp_day6, atp_day7, atp_day8, atp_day9, atp_day10,
                atp_moredays, atp_requestDate
         FROM cp_atp WHERE TRIM(atp_trname) <> \'\''
    );
    $advances = [];
    foreach (rows('SELECT ad_id, ad_atpid, ad_date, ad_advance, ad_spent, ad_government, ad_receipt FROM cp_advances') as $row) {
        $advances[(int) $row['ad_atpid']] = $row;
    }
    $bills = [];
    foreach (rows('SELECT fb_atpid, fb_advance, fb_food FROM cp_foodbills') as $row) {
        $bills[(int) $row['fb_atpid']] = $row;
    }
    $pays = [];
    foreach (rows('SELECT * FROM cp_allowances') as $row) {
        $pays[(int) $row['al_atpid']] = $row;
    }
    $sheets = [];
    $prepared = [];
    foreach (rows('SELECT se_atpid, se_total, se_sheet FROM cp_savedestimates') as $row) {
        $id = (int) $row['se_atpid'];
        $prepared[$id] = trim((string) ($row['se_total'] ?? ''));
        $decoded = json_decode((string) ($row['se_sheet'] ?? ''), true);
        $sheets[$id] = is_array($decoded) ? $decoded : [];
    }
    $attended = advance_attended_map();
    $years = [];
    $packedYears = [];
    foreach ($plans as $plan) {
        $dates = programme_days($plan, 'atp_day');
        sort($dates);
        $start = $dates[0] ?? '';
        $programmeYear = strlen($start) >= 4 ? substr($start, 0, 4) : substr((string) ($plan['atp_requestDate'] ?? ''), 0, 4);
        if (preg_match('/^\d{4}$/', $programmeYear)) {
            $years[$programmeYear] = true;
        }
        $packedYears[(int) $plan['atp_id']] = [$programmeYear, $dates];
    }
    $yearList = array_keys($years);
    rsort($yearList);
    $asked = trim((string) ($_GET['year'] ?? ''));
    $year = preg_match('/^\d{4}$/', $asked) ? $asked : ($yearList[0] ?? date('Y'));
    $nid = trim((string) ($_GET['nid'] ?? ''));
    $person = null;
    $personMissing = false;
    if ($nid !== '') {
        $found = rows('SELECT rp_nid, rp_name, rp_desig FROM cp_resourcepersons WHERE rp_nid = ? LIMIT 1', 's', [$nid]);
        if ($found) {
            $person = [
                'nid' => trim((string) $found[0]['rp_nid']),
                'name' => trim((string) $found[0]['rp_name']),
                'post' => trim((string) $found[0]['rp_desig']),
                'rows' => [],
                'amount' => 0.0,
            ];
        } else {
            $personMissing = true;
        }
    }
    $signatory = signatory_profile()['display'] ?? '';
    $names = [];
    $advanceRows = [];
    $foodRows = [];
    $payRows = [];
    $advanceTotals = ['planEstimate' => 0.0, 'prepared' => 0.0, 'advance' => 0.0, 'attended' => 0, 'spent' => 0.0, 'balance' => 0.0, 'government' => 0.0];
    $foodTotals = ['planEstimate' => 0.0, 'advance' => 0.0, 'spent' => 0.0, 'food' => 0.0, 'total' => 0.0, 'gap' => 0.0];
    $payTotals = ['resource' => 0.0, 'coord' => 0.0, 'supervise' => 0.0, 'liaise' => 0.0, 'account' => 0.0, 'office' => 0.0, 'total' => 0.0];
    $coordRows = [];
    $superviseRows = [];
    $accountRows = [];
    $accountAmount = 0.0;
    $accountCount = 0;
    $liaiseGroups = [];
    $officeGroups = [];
    $coordAmount = 0.0;
    $coordCount = 0;
    $superviseAmount = 0.0;
    $superviseCount = 0;
    foreach ($plans as $plan) {
        $id = (int) $plan['atp_id'];
        [$programmeYear, $dates] = $packedYears[$id];
        if ($programmeYear !== $year) {
            continue;
        }
        $savedAdvance = $advances[$id] ?? [];
        $sheet = $sheets[$id] ?? [];
        $coordinator = advance_coordinator((string) ($plan['atp_supportstaff1'] ?? ''), $names);
        $pack = advance_pack($plan, $savedAdvance, $attended[$id] ?? 0, $coordinator, 0.0);
        $pack['prepared'] = ($prepared[$id] ?? '') !== '' ? $prepared[$id] : '0';
        $pack['dates'] = implode(', ', $dates);
        if (empty($savedAdvance['ad_id'])) {
            $pack['date'] = $dates[0] ?? '';
            $pack['receipt'] = '';
        }
        unset($pack['numbers'], $pack['year']);
        $advanceRows[] = $pack;
        $advanceTotals['planEstimate'] += advance_number((string) $pack['planEstimate']);
        $advanceTotals['prepared'] += advance_number((string) $pack['prepared']);
        $advanceTotals['advance'] += advance_number((string) $pack['advance']);
        $advanceTotals['attended'] += (int) $pack['attended'];
        $advanceTotals['spent'] += advance_number((string) $pack['spent']);
        $advanceTotals['balance'] += advance_number((string) $pack['balance']);
        $advanceTotals['government'] += advance_number((string) $pack['government']);

        $bill = $bills[$id] ?? [];
        $foodAmount = advance_number((string) ($bill['fb_food'] ?? '0'));
        $typedAdvance = trim((string) ($bill['fb_advance'] ?? ''));
        $foodAdvance = $typedAdvance !== '' ? advance_number($typedAdvance) : advance_number((string) $pack['advance']);
        $spent = advance_number((string) $pack['spent']);
        $foodTotal = $spent + $foodAmount;
        $planEstimate = advance_number((string) $pack['planEstimate']);
        $gap = $planEstimate - $foodTotal;
        $foodRows[] = [
            'id' => $id,
            'name' => (string) $pack['name'],
            'dates' => implode(', ', $dates),
            'planEstimate' => (string) $pack['planEstimate'],
            'advance' => advance_money($foodAdvance),
            'spent' => advance_money($spent),
            'food' => advance_money($foodAmount),
            'total' => advance_money($foodTotal),
            'gap' => advance_money(abs($gap)),
            'short' => $gap < -0.00001,
        ];
        $foodTotals['planEstimate'] += $planEstimate;
        $foodTotals['advance'] += $foodAdvance;
        $foodTotals['spent'] += $spent;
        $foodTotals['food'] += $foodAmount;
        $foodTotals['total'] += $foodTotal;
        $foodTotals['gap'] += $gap;

        $pay = $pays[$id] ?? [];
        $savedPay = isset($pay['al_id']);
        $lectures = settle_lecture_rows($plan, $sheet);
        $lectureSum = 0.0;
        foreach ($lectures as $lecture) {
            $lectureSum += $lecture['amount'];
        }
        $resource = $savedPay ? advance_number((string) ($pay['al_resource'] ?? '0')) : $lectureSum;
        if ($lectures && abs($lectureSum) < 0.00001 && $resource > 0) {
            $share = $resource / count($lectures);
            foreach ($lectures as $index => $lecture) {
                $lectures[$index]['amount'] = $share;
            }
        }
        $coord = $savedPay ? advance_number((string) ($pay['al_coord'] ?? '0')) : estimate_line_amount($sheet, '6.7');
        $supervise = $savedPay ? advance_number((string) ($pay['al_supervise'] ?? '0')) : estimate_line_amount($sheet, '6.8');
        $liaise = $savedPay ? advance_number((string) ($pay['al_liaise'] ?? '0')) : estimate_line_amount($sheet, '6.9');
        $account = $savedPay ? advance_number((string) ($pay['al_account'] ?? '0')) : estimate_line_amount($sheet, '6.10');
        $officeUnit = estimate_line_amount($sheet, '6.11');
        $support = plan_support_people($plan, $names);
        $officePeople = $savedPay ? allowance_people($pay['al_officeids'] ?? '[]') : $support;
        if (!$officePeople) {
            $officePeople = $support;
        }
        $office = $savedPay ? advance_number((string) ($pay['al_office'] ?? '0')) : ($officeUnit * count($officePeople));
        $coordWho = $savedPay && trim((string) ($pay['al_coordwho'] ?? '')) !== '' ? trim((string) $pay['al_coordwho']) : (string) $signatory;
        $superviseWho = $savedPay && trim((string) ($pay['al_supervisewho'] ?? '')) !== '' ? trim((string) $pay['al_supervisewho']) : allowance_named((string) ($plan['atp_supervisor'] ?? ''), $names);
        $liaiseWho = $savedPay && trim((string) ($pay['al_liaisewho'] ?? '')) !== '' ? trim((string) $pay['al_liaisewho']) : $coordinator;
        $lineTotal = $resource + $coord + $supervise + $liaise + $account + $office;
        $payRows[] = [
            'id' => $id,
            'name' => (string) $pack['name'],
            'dates' => implode(', ', $dates),
            'resource' => advance_money($resource),
            'coord' => advance_money($coord),
            'supervise' => advance_money($supervise),
            'liaise' => advance_money($liaise),
            'account' => advance_money($account),
            'office' => advance_money($office),
            'total' => advance_money($lineTotal),
            'coordWho' => $coordWho,
            'superviseWho' => $superviseWho,
            'liaiseWho' => $liaiseWho,
        ];
        $payTotals['resource'] += $resource;
        $payTotals['coord'] += $coord;
        $payTotals['supervise'] += $supervise;
        $payTotals['liaise'] += $liaise;
        $payTotals['account'] += $account;
        $payTotals['office'] += $office;
        $payTotals['total'] += $lineTotal;
        if ($coord > 0) {
            $coordAmount += $coord;
            $coordCount += 1;
            $coordRows[] = ['name' => (string) $pack['name'], 'who' => $coordWho, 'amount' => advance_money($coord)];
        }
        if ($supervise > 0) {
            $superviseAmount += $supervise;
            $superviseCount += 1;
            $superviseRows[] = ['name' => (string) $pack['name'], 'who' => $superviseWho, 'amount' => advance_money($supervise)];
        }
        $accountPaid = $savedPay ? advance_number((string) ($pay['al_account'] ?? '0')) : 0.0;
        $accountPaidWho = '';
        if ($savedPay) {
            $accountPaidWho = trim((string) ($pay['al_accountwho'] ?? ''));
            if ($accountPaidWho === '') {
                $accountPaidWho = 'අචිනි අප්සරා මෙනවිය';
            }
        }
        $accountRows[] = ['name' => (string) $pack['name'], 'who' => $accountPaidWho, 'amount' => advance_money($accountPaid)];
        $accountAmount += $accountPaid;
        if ($accountPaid > 0) {
            $accountCount += 1;
        }
        if ($liaise > 0 && $liaiseWho !== '') {
            settle_group_add($liaiseGroups, $liaiseWho, $liaiseWho, '', (string) $pack['name'], $liaise);
        }
        $officeCount = count($officePeople);
        $officeShare = $officeCount > 0 ? $office / $officeCount : 0.0;
        foreach ($officePeople as $officer) {
            $officerNid = trim((string) ($officer['nid'] ?? ''));
            $officerName = trim((string) ($officer['name'] ?? ''));
            if ($officerNid !== '') {
                $looked = advance_coordinator($officerNid, $names);
                if ($looked !== '' && $looked !== $officerNid) {
                    $officerName = $looked;
                }
            }
            if ($officerName === '' && $officerNid === '') {
                continue;
            }
            if ($officeShare <= 0) {
                continue;
            }
            $key = $officerNid !== '' ? $officerNid : $officerName;
            settle_group_add($officeGroups, $key, $officerName, $officerNid, (string) $pack['name'], $officeShare);
        }
        if ($person && $person['name'] !== '') {
            $mine = 0.0;
            $hit = false;
            foreach ($lectures as $lecture) {
                if (settle_same_name($lecture['name'], $person['name']) || ($nid !== '' && settle_same_name($lecture['name'], $nid))) {
                    $hit = true;
                    $mine += $lecture['amount'];
                }
            }
            if ($hit) {
                $person['amount'] += $mine;
                $person['rows'][] = [
                    'name' => (string) $pack['name'],
                    'dates' => implode(', ', $dates),
                    'amount' => advance_money($mine),
                ];
            }
        }
    }
    usort($advanceRows, static function (array $left, array $right): int {
        return strcmp((string) $left['dates'], (string) $right['dates']) ?: ((int) $left['id'] <=> (int) $right['id']);
    });
    usort($foodRows, static function (array $left, array $right): int {
        return strcmp((string) $left['dates'], (string) $right['dates']) ?: ((int) $left['id'] <=> (int) $right['id']);
    });
    usort($payRows, static function (array $left, array $right): int {
        return strcmp((string) $left['dates'], (string) $right['dates']) ?: ((int) $left['id'] <=> (int) $right['id']);
    });
    if ($person) {
        $person['total'] = advance_money($person['amount']);
        $person['count'] = count($person['rows']);
        unset($person['amount']);
    }
    $money = static function (float $value): string {
        return advance_money($value);
    };
    json_out([
        'ok' => true,
        'year' => $year,
        'advances' => $advanceRows,
        'advanceTotals' => [
            'planEstimate' => $money($advanceTotals['planEstimate']),
            'prepared' => $money($advanceTotals['prepared']),
            'advance' => $money($advanceTotals['advance']),
            'attended' => $advanceTotals['attended'],
            'spent' => $money($advanceTotals['spent']),
            'balance' => $money($advanceTotals['balance']),
            'government' => $money($advanceTotals['government']),
        ],
        'food' => $foodRows,
        'foodTotals' => [
            'planEstimate' => $money($foodTotals['planEstimate']),
            'advance' => $money($foodTotals['advance']),
            'spent' => $money($foodTotals['spent']),
            'food' => $money($foodTotals['food']),
            'total' => $money($foodTotals['total']),
            'gap' => $money($foodTotals['gap']),
        ],
        'programmes' => $payRows,
        'payTotals' => [
            'resource' => $money($payTotals['resource']),
            'coord' => $money($payTotals['coord']),
            'supervise' => $money($payTotals['supervise']),
            'liaise' => $money($payTotals['liaise']),
            'account' => $money($payTotals['account']),
            'office' => $money($payTotals['office']),
            'total' => $money($payTotals['total']),
        ],
        'coord' => ['amount' => $money($coordAmount), 'count' => $coordCount, 'rows' => $coordRows],
        'supervise' => ['amount' => $money($superviseAmount), 'count' => $superviseCount, 'rows' => $superviseRows],
        'accounts' => ['amount' => $money($accountAmount), 'count' => $accountCount, 'rows' => $accountRows],
        'liaise' => settle_groups($liaiseGroups),
        'office' => settle_groups($officeGroups),
        'person' => $person,
        'personMissing' => $personMissing,
    ]);
}

function action_estimate(): void
{
    $user = require_user();
    if (!is_super($user)) {
        json_out(['ok' => false, 'error' => 'Only training staff can prepare an estimate.'], 403);
    }
    $id = (int) ($_GET['id'] ?? 0);
    $found = rows('SELECT * FROM cp_atp WHERE atp_id = ? LIMIT 1', 'i', [$id]);
    if (!$found) {
        json_out(['ok' => false, 'error' => 'That programme was not found.'], 404);
    }
    $plan = $found[0];
    $askedDays = (int) ($_GET['days'] ?? 0);
    $askedPeople = (int) ($_GET['people'] ?? 0);
    $days = $askedDays > 0 ? $askedDays : max(1, (int) $plan['atp_noofdays'] ?: count(programme_days($plan, 'atp_day')));
    $people = $askedPeople > 0 ? $askedPeople : max(1, (int) $plan['atp_noofparticipants']);
    $food = rows('SELECT fd_name, fd_price FROM cp_food ORDER BY fd_name');
    $lines = [];
    $total = 0.0;
    foreach ($food as $item) {
        $amount = ((float) $item['fd_price']) * $days * $people;
        $total += $amount;
        $lines[] = [
            'item' => $item['fd_name'],
            'price' => (float) $item['fd_price'],
            'quantity' => $days * $people,
            'amount' => $amount,
        ];
    }
    $coordinator = trim((string) ($plan['atp_supportstaff1'] ?? ''));
    $coordinatorSex = '';
    if ($coordinator !== '') {
        $staff = rows('SELECT stf_Name, stf_sex FROM cp_staff WHERE stf_Nid = ? LIMIT 1', 's', [$coordinator]);
        if ($staff && trim((string) $staff[0]['stf_Name']) !== '') {
            $coordinatorSex = trim((string) ($staff[0]['stf_sex'] ?? ''));
            $coordinator = trim((string) $staff[0]['stf_Name']);
        }
    }
    json_out([
        'ok' => true,
        'programme' => $plan['atp_trname'],
        'file' => $plan['atp_fileno'],
        'target' => $plan['atp_targetgroup'],
        'dates' => programme_days($plan, 'atp_day'),
        'place' => $plan['atp_location'],
        'lecturers' => (function () use ($plan) {
            $names = [];
            for ($i = 1; $i <= 10; $i++) {
                $name = trim((string) ($plan['atp_resourcep' . $i] ?? ''));
                if ($name !== '') {
                    $names[] = $name;
                }
            }
            foreach (preg_split('/\R/', (string) ($plan['atp_moreresource'] ?? '')) as $extra) {
                $extra = trim($extra);
                if ($extra !== '') {
                    $names[] = $extra;
                }
            }
            return $names;
        })(),
        'saved' => (function () use ($id) {
            $stored = rows('SELECT se_sheet FROM cp_savedestimates WHERE se_atpid = ? LIMIT 1', 'i', [$id]);
            if (!$stored) {
                return null;
            }
            $decoded = json_decode((string) $stored[0]['se_sheet'], true);
            return is_array($decoded) ? $decoded : null;
        })(),
        'coordinator' => $coordinator,
        'coordinatorSex' => $coordinatorSex,
        'signatory' => signatory_profile()['display'],
        'days' => $days,
        'people' => $people,
        'budget' => $plan['atp_bdjet'],
        'lines' => $lines,
        'total' => $total,
    ]);
}

function action_signsheet(): void
{
    $user = require_user();
    $id = trim((string) ($_GET['id'] ?? ''));
    $planRows = rows('SELECT * FROM cp_atp WHERE atp_id = ? LIMIT 1', 's', [$id]);
    if (!$planRows) {
        json_out(['ok' => false, 'error' => 'That programme was not found.'], 404);
    }
    $plan = $planRows[0];
    $sql = "SELECT a.tapp_officerNid, a.tapp_office, a.tapp_accomodation, a.tapp_diet, s.stf_Name, s.stf_desig, s.stf_mobile,
                   t.tratt_name, t.tratt_desig, t.tratt_mobile
            FROM cp_trainingapplications a
            LEFT JOIN cp_staff s ON s.stf_Nid = a.tapp_officerNid
            LEFT JOIN cp_trainingattendance t ON t.tratt_atpid = a.tapp_atpid AND t.tratt_empnid = a.tapp_officerNid
            WHERE a.tapp_atpid = ? AND a.tapp_isselected = ?";
    $types = 'ss';
    $params = [$id, YES_SI];
    if ($user['role'] === 'User') {
        $sql .= ' AND a.tapp_office = ?';
        $types .= 's';
        $params[] = $user['office'];
    }
    $sql .= ' ORDER BY a.tapp_office, s.stf_Name';
    $people = rows($sql, $types, $params);
    $participantPhones = [];
    $offices = [];
    foreach ($people as $person) {
        $phone = trim((string) ($person['stf_mobile'] ?: $person['tratt_mobile']));
        if ($phone !== '') {
            $participantPhones[] = $phone;
        }
        $office = trim((string) ($person['tapp_office'] ?? ''));
        if ($office !== '') {
            $offices[$office] = $office;
        }
    }
    $officePhones = [];
    if ($offices) {
        $marks = implode(',', array_fill(0, count($offices), '?'));
        $subjectOfficers = rows(
            'SELECT tro_mobile FROM cp_trainingofficers WHERE tro_office IN (' . $marks . ') ORDER BY tro_office, tro_name',
            str_repeat('s', count($offices)),
            array_values($offices)
        );
        foreach ($subjectOfficers as $row) {
            $phone = trim((string) ($row['tro_mobile'] ?? ''));
            if ($phone !== '' && !in_array($phone, $officePhones, true)) {
                $officePhones[] = $phone;
            }
        }
    }
    $names = [];
    for ($i = 1; $i <= 10; $i++) {
        $name = trim((string) ($plan['atp_resourcep' . $i] ?? ''));
        if ($name !== '') {
            $names[] = $name;
        }
    }
    $resourcePhones = [];
    if ($names) {
        $marks = implode(',', array_fill(0, count($names), '?'));
        $found = rows('SELECT rp_name, rp_mobile FROM cp_resourcepersons WHERE rp_name IN (' . $marks . ')', str_repeat('s', count($names)), $names);
        foreach ($found as $row) {
            $phone = trim((string) $row['rp_mobile']);
            if ($phone !== '') {
                $resourcePhones[] = $phone;
            }
        }
    }
    json_out([
        'ok' => true,
        'programme' => $plan,
        'days' => programme_days($plan, 'atp_day'),
        'rows' => $people,
        'participantPhones' => $participantPhones,
        'officePhones' => $officePhones,
        'resourcePhones' => $resourcePhones,
    ]);
}

function action_panelsign(): void
{
    $user = require_user();
    if (!is_super($user)) {
        json_out(['ok' => false, 'error' => 'මෙම ලේඛනය විවෘත කළ නොහැක.'], 403);
    }
    $id = trim((string) ($_GET['id'] ?? ''));
    $planRows = rows('SELECT * FROM cp_atp WHERE atp_id = ? LIMIT 1', 's', [$id]);
    if (!$planRows) {
        json_out(['ok' => false, 'error' => 'පුහුණු වැඩසටහන හමු නොවුණි.'], 404);
    }
    $plan = $planRows[0];
    $people = rows(
        "SELECT s.stf_Name, s.stf_desig, t.tratt_name, t.tratt_desig
         FROM cp_trainingapplications a
         LEFT JOIN cp_staff s ON s.stf_Nid = a.tapp_officerNid
         LEFT JOIN cp_trainingattendance t ON t.tratt_atpid = a.tapp_atpid AND t.tratt_empnid = a.tapp_officerNid
         WHERE a.tapp_atpid = ? AND a.tapp_isselected IN (?, 'Yes', 'yes')
         ORDER BY s.stf_Name, t.tratt_name",
        'ss',
        [$id, YES_SI]
    );
    $staff = [];
    foreach ($people as $person) {
        $name = trim((string) ($person['stf_Name'] ?: $person['tratt_name']));
        $post = trim((string) ($person['stf_desig'] ?: $person['tratt_desig']));
        if ($name === '' && $post === '') {
            continue;
        }
        $staff[] = ['name' => $name, 'post' => $post];
    }
    $signatory = signatory_profile();
    $panel = [[
        'name' => trim($signatory['name'] . ' ' . $signatory['title']),
        'post' => 'නියෝජ්‍ය ප්‍රධාන ලේකම් (පුහුණු)',
        'role' => 'සමායෝජන සම්බන්ධීකරණය',
    ]];
    $supervisor = module_person((string) ($plan['atp_supervisor'] ?? ''));
    if ($supervisor['name'] !== '') {
        $panel[] = ['name' => $supervisor['name'], 'post' => $supervisor['post'], 'role' => 'සම්පත්දායක අධීක්ෂණය'];
    }
    $liaison = module_person((string) ($plan['atp_supportstaff1'] ?? ''));
    if ($liaison['name'] !== '') {
        $panel[] = ['name' => $liaison['name'], 'post' => $liaison['post'], 'role' => 'සම්බන්ධීකරණය'];
    }
    $panel[] = ['name' => 'අචිනි අප්සරා මෙනවිය', 'post' => '', 'role' => 'ගිණුම් අංශය'];
    $lecturers = [];
    for ($i = 1; $i <= 10; $i++) {
        $name = trim((string) ($plan['atp_resourcep' . $i] ?? ''));
        if ($name !== '') {
            $lecturers[] = $name;
        }
    }
    foreach (preg_split('/\R/', (string) ($plan['atp_moreresource'] ?? '')) as $extra) {
        $extra = trim($extra);
        if ($extra !== '') {
            $lecturers[] = $extra;
        }
    }
    foreach (module_lecturers($lecturers) as $lecturer) {
        if ($lecturer['name'] === '') {
            continue;
        }
        $panel[] = ['name' => $lecturer['name'], 'post' => $lecturer['post'], 'role' => 'දේශකයා'];
    }
    for ($i = 2; $i <= 6; $i++) {
        $helper = module_person((string) ($plan['atp_supportstaff' . $i] ?? ''));
        if ($helper['name'] !== '') {
            $panel[] = ['name' => $helper['name'], 'post' => $helper['post'], 'role' => 'සහාය'];
        }
    }
    json_out([
        'ok' => true,
        'name' => split_plain((string) ($plan['atp_trname'] ?? '')),
        'place' => trim((string) ($plan['atp_location'] ?? '')),
        'days' => programme_days($plan, 'atp_day'),
        'staff' => $staff,
        'panel' => $panel,
    ]);
}

function action_selected_programmes(): void
{
    $user = require_user();
    if (!can_access($user, 'cp_trainingapplications', 'read')) {
        json_out(['ok' => false, 'error' => 'You cannot open applications.'], 403);
    }
    $sql = "SELECT DISTINCT tapp_atpid FROM cp_trainingapplications WHERE tapp_isselected IN (?, 'Yes', 'yes')";
    $types = 's';
    $params = [YES_SI];
    if ($user['role'] === 'User') {
        $sql .= ' AND tapp_office = ?';
        $types .= 's';
        $params[] = $user['office'];
    }
    $rows = rows($sql, $types, $params);
    $ids = [];
    foreach ($rows as $row) {
        $id = trim((string) ($row['tapp_atpid'] ?? ''));
        if ($id !== '') {
            $ids[] = $id;
        }
    }
    json_out(['ok' => true, 'ids' => $ids]);
}

function action_applicants(): void
{
    $user = require_user();
    if (!can_access($user, 'cp_trainingapplications', 'read')) {
        json_out(['ok' => false, 'error' => 'You cannot open applications.'], 403);
    }
    $atp = trim((string) ($_GET['atp'] ?? ''));
    if ($atp === '') {
        json_out(['ok' => true, 'items' => []]);
    }
    $sql = "SELECT a.tapp_id, a.tapp_officerNid, a.tapp_office, a.tapp_atpid, a.tapp_trname, a.tapp_applieddate, a.tapp_trstartdate,
                   a.tapp_priority, a.tapp_accomodation, a.tapp_diet, a.tapp_isselected,
                   s.stf_Name, s.stf_desig, s.stf_mobile, s.stf_sex, t.tratt_name, t.tratt_desig, t.tratt_mobile, t.tratt_isparti
            FROM cp_trainingapplications a
            LEFT JOIN cp_staff s ON s.stf_Nid = a.tapp_officerNid
            LEFT JOIN cp_trainingattendance t ON t.tratt_atpid = a.tapp_atpid AND t.tratt_empnid = a.tapp_officerNid
            WHERE a.tapp_atpid = ?";
    $types = 's';
    $params = [$atp];
    if ($user['role'] === 'User') {
        $sql .= ' AND a.tapp_office = ?';
        $types .= 's';
        $params[] = $user['office'];
    }
    if (($_GET['selected'] ?? '') === '1') {
        $sql .= " AND a.tapp_isselected IN ('ඔව්', 'Yes', 'yes')";
    }
    $sql .= ' ORDER BY a.tapp_id ASC';
    $items = rows($sql, $types, $params);
    $today = date('Y-m-d');
    $blocked = [];
    foreach (rows('SELECT bl_nid FROM cp_blacklist WHERE bl_until >= ?', 's', [$today]) as $row) {
        $blocked[(string) $row['bl_nid']] = true;
    }
    foreach ($items as &$item) {
        $item['blacklisted'] = isset($blocked[(string) $item['tapp_officerNid']]) ? 'Yes' : '';
    }
    unset($item);
    json_out(['ok' => true, 'items' => $items]);
}

function enrol_officer(string $atpId, string $nid, string $present = 'Yes'): bool
{
    $nid = trim($nid);
    if ($atpId === '' || $nid === '') {
        return false;
    }
    $plan = rows('SELECT atp_id, atp_trname, atp_day1, atp_fileno FROM cp_atp WHERE atp_id = ? LIMIT 1', 's', [$atpId]);
    if (!$plan) {
        return false;
    }
    $name = $nid;
    $desig = '';
    $office = '';
    $mobile = '';
    $staff = rows('SELECT stf_Name, stf_desig, stf_office, stf_mobile FROM cp_staff WHERE stf_Nid = ? LIMIT 1', 's', [$nid]);
    if ($staff) {
        $name = trim((string) $staff[0]['stf_Name']) !== '' ? (string) $staff[0]['stf_Name'] : $nid;
        $desig = (string) $staff[0]['stf_desig'];
        $office = (string) $staff[0]['stf_office'];
        $mobile = (string) $staff[0]['stf_mobile'];
    }
    $yes = YES_SI;
    $no = NO_SI;
    $today = date('Y-m-d');
    $start = (string) $plan[0]['atp_day1'];
    $trname = (string) $plan[0]['atp_trname'];
    $file = (string) $plan[0]['atp_fileno'];
    $existing = rows('SELECT tapp_id FROM cp_trainingapplications WHERE tapp_officerNid = ? AND tapp_atpid = ? LIMIT 1', 'ss', [$nid, $atpId]);
    if ($existing) {
        $id = (int) $existing[0]['tapp_id'];
        $stmt = db()->prepare('UPDATE cp_trainingapplications SET tapp_isselected = ? WHERE tapp_id = ?');
        $stmt->bind_param('si', $yes, $id);
        $stmt->execute();
        stamp_selected_date($id);
    } else {
        $priority = 1;
        $diet = '';
        $stmt = db()->prepare('INSERT INTO cp_trainingapplications (tapp_officerNid, tapp_office, tapp_atpid, tapp_trname, tapp_applieddate, tapp_trstartdate, tapp_isrelevent, tapp_priority, tapp_accomodation, tapp_diet, tapp_isselected) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)');
        $stmt->bind_param('sssssssisss', $nid, $office, $atpId, $trname, $today, $start, $yes, $priority, $no, $diet, $yes);
        if (!$stmt->execute()) {
            return false;
        }
        stamp_selected_date((int) db()->insert_id);
    }
    $mark = $present === NO_SI || $present === 'No' || $present === 'no' ? NO_SI : 'Yes';
    $note = '';
    $attendance = rows('SELECT tratt_id FROM cp_trainingattendance WHERE tratt_atpid = ? AND tratt_empnid = ? LIMIT 1', 'ss', [$atpId, $nid]);
    if ($attendance) {
        $aid = (int) $attendance[0]['tratt_id'];
        $stmt = db()->prepare('UPDATE cp_trainingattendance SET tratt_isparti = ?, tratt_name = ?, tratt_desig = ?, tratt_office = ?, tratt_mobile = ? WHERE tratt_id = ?');
        $stmt->bind_param('sssssi', $mark, $name, $desig, $office, $mobile, $aid);
        return (bool) $stmt->execute();
    }
    $stmt = db()->prepare('INSERT INTO cp_trainingattendance (tratt_atpid, tratt_atpfileno, tratt_atpname, tratt_startdate, tratt_empnid, tratt_isparti, tratt_comnt, tratt_name, tratt_desig, tratt_office, tratt_mobile) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)');
    $stmt->bind_param('sssssssssss', $atpId, $file, $trname, $start, $nid, $mark, $note, $name, $desig, $office, $mobile);
    return (bool) $stmt->execute();
}

function action_walkin(): void
{
    csrf_check();
    $user = require_user();
    if (!is_super($user)) {
        json_out(['ok' => false, 'error' => 'Only training staff can add a participant.'], 403);
    }
    $data = body();
    $atpId = trim((string) ($data['atp_id'] ?? ''));
    $nid = trim((string) ($data['nid'] ?? ''));
    if ($atpId === '' || $nid === '') {
        json_out(['ok' => false, 'error' => 'පුහුණු වැඩසටහන තෝරලා හැඳුනුම්පත් අංකය දෙන්න.'], 422);
    }
    if (!enrol_officer($atpId, $nid, 'Yes')) {
        json_out(['ok' => false, 'error' => 'නිලධාරියා එකතු කළ නොහැකි විය.'], 500);
    }
    json_out(['ok' => true]);
}

function action_walkin_many(): void
{
    csrf_check();
    $user = require_user();
    if (!is_super($user)) {
        json_out(['ok' => false, 'error' => 'Only training staff can add a participant.'], 403);
    }
    $data = body();
    $atpId = trim((string) ($data['atp_id'] ?? ''));
    $nids = [];
    foreach (array_slice((array) ($data['nids'] ?? []), 0, 1000) as $nid) {
        $nid = trim((string) $nid);
        if ($nid !== '') {
            $nids[$nid] = $nid;
        }
    }
    if ($atpId === '' || !$nids) {
        json_out(['ok' => false, 'error' => 'හැඳුනුම්පත් අංකයක් දෙන්න.'], 422);
    }
    $added = 0;
    foreach ($nids as $nid) {
        if (enrol_officer($atpId, $nid, 'Yes')) {
            $added++;
        }
    }
    json_out(['ok' => true, 'added' => $added]);
}

function action_confirm_attendance(): void
{
    csrf_check();
    $user = require_user();
    if (!is_super($user)) {
        json_out(['ok' => false, 'error' => 'Only training staff can mark attendance.'], 403);
    }
    $data = body();
    $atpId = trim((string) ($data['atp_id'] ?? ''));
    $people = array_slice((array) ($data['people'] ?? []), 0, 1000);
    if ($atpId === '' || !$people) {
        json_out(['ok' => false, 'error' => 'තහවුරු කරන්න නිලධාරීන් නොමැත.'], 422);
    }
    $saved = 0;
    foreach ($people as $person) {
        if (!is_array($person)) {
            continue;
        }
        $nid = trim((string) ($person['nid'] ?? ''));
        $present = !empty($person['present']) ? 'Yes' : NO_SI;
        if ($nid !== '' && enrol_officer($atpId, $nid, $present)) {
            $saved++;
        }
    }
    json_out(['ok' => true, 'saved' => $saved]);
}

function sheet_nids(array $rows): array
{
    $nids = [];
    $start = 0;
    if ($rows) {
        $head = trim((string) ($rows[0][0] ?? ''));
        if ($head === '' || !preg_match('/\d/', $head)) {
            $start = 1;
        }
    }
    for ($i = $start; $i < count($rows) && count($nids) < 1000; $i++) {
        $nid = trim((string) ($rows[$i][0] ?? ''));
        if ($nid !== '') {
            $nids[$nid] = $nid;
        }
    }
    return array_values($nids);
}

function action_attendance_upload(): void
{
    csrf_check();
    $user = require_user();
    if (!is_super($user)) {
        json_out(['ok' => false, 'error' => 'Only training staff can add a participant.'], 403);
    }
    $atpId = trim((string) ($_POST['atp_id'] ?? ''));
    if ($atpId === '' || !isset($_FILES['file']) || !is_uploaded_file($_FILES['file']['tmp_name'])) {
        json_out(['ok' => false, 'error' => 'පුහුණු වැඩසටහන සහ Excel ගොනුව දෙන්න.'], 422);
    }
    $rows = read_sheet($_FILES['file']['tmp_name'], (string) $_FILES['file']['name']);
    $nids = sheet_nids($rows);
    if (!$nids) {
        json_out(['ok' => false, 'error' => 'ගොනුවේ හැඳුනුම්පත් අංක නොමැත.'], 422);
    }
    $added = 0;
    foreach ($nids as $nid) {
        if (enrol_officer($atpId, $nid, 'Yes')) {
            $added++;
        }
    }
    json_out(['ok' => true, 'added' => $added]);
}

function action_drop_participant(): void
{
    csrf_check();
    $user = require_user();
    if (!is_super($user)) {
        json_out(['ok' => false, 'error' => 'Only training staff can remove a participant.'], 403);
    }
    $data = body();
    $atpId = trim((string) ($data['atp_id'] ?? ''));
    $nid = trim((string) ($data['nid'] ?? ''));
    if ($atpId === '' || $nid === '') {
        json_out(['ok' => false, 'error' => 'Choose the programme and the officer.'], 422);
    }
    $no = NO_SI;
    $stmt = db()->prepare('UPDATE cp_trainingapplications SET tapp_isselected = ? WHERE tapp_atpid = ? AND tapp_officerNid = ?');
    $stmt->bind_param('sss', $no, $atpId, $nid);
    $stmt->execute();
    $stmt = db()->prepare('DELETE FROM cp_trainingattendance WHERE tratt_atpid = ? AND tratt_empnid = ?');
    $stmt->bind_param('ss', $atpId, $nid);
    $stmt->execute();
    json_out(['ok' => true]);
}

function action_delete_applicant(): void
{
    csrf_check();
    $user = require_user();
    if (!is_admin($user)) {
        json_out(['ok' => false, 'error' => 'Only an administrator can delete an application.'], 403);
    }
    $data = body();
    $id = (int) ($data['id'] ?? 0);
    $found = rows('SELECT tapp_id, tapp_atpid, tapp_officerNid FROM cp_trainingapplications WHERE tapp_id = ? LIMIT 1', 'i', [$id]);
    if (!$found) {
        json_out(['ok' => false, 'error' => 'That application was not found.'], 404);
    }
    $stmt = db()->prepare('DELETE FROM cp_trainingapplications WHERE tapp_id = ?');
    $stmt->bind_param('i', $id);
    $stmt->execute();
    $atp = (string) $found[0]['tapp_atpid'];
    $nid = (string) $found[0]['tapp_officerNid'];
    $stmt = db()->prepare('DELETE FROM cp_trainingattendance WHERE tratt_atpid = ? AND tratt_empnid = ?');
    $stmt->bind_param('ss', $atp, $nid);
    $stmt->execute();
    json_out(['ok' => true]);
}

function action_private_apply(): void
{
    csrf_check();
    $user = require_user();
    if ($user['role'] !== 'User' && !is_admin($user)) {
        json_out(['ok' => false, 'error' => 'Your role cannot submit a private-course application.'], 403);
    }
    $data = body();
    $nid = trim((string) ($data['nid'] ?? ''));
    $course = trim((string) ($data['course'] ?? ''));
    $institute = trim((string) ($data['institute'] ?? ''));
    if ($nid === '' || $course === '' || $institute === '') {
        json_out(['ok' => false, 'error' => 'National ID, course, and institute are required.'], 422);
    }
    $staff = rows('SELECT stf_Nid, stf_office FROM cp_staff WHERE stf_Nid = ? LIMIT 1', 's', [$nid]);
    if (!$staff) {
        json_out(['ok' => false, 'error' => 'That national ID is not in the staff register.'], 422);
    }
    if ($user['role'] === 'User' && $staff[0]['stf_office'] !== $user['office']) {
        json_out(['ok' => false, 'error' => 'You can apply only for officers in your office.'], 403);
    }
    if (officer_is_blacklisted($nid)) {
        json_out(['ok' => false, 'error' => blacklist_apply_error($nid)], 422);
    }
    $emptyDate = '0000-00-00';
    $today = date('Y-m-d');
    $education = trim((string) ($data['education'] ?? ''));
    $other = trim((string) ($data['other'] ?? ''));
    $start = trim((string) ($data['start'] ?? '')) ?: $emptyDate;
    $end = trim((string) ($data['end'] ?? '')) ?: $emptyDate;
    $duration = trim((string) ($data['duration'] ?? ''));
    $fees = trim((string) ($data['fees'] ?? ''));
    $relevant = trim((string) ($data['relevant'] ?? ''));
    $approved = NO_SI;
    $blank = '';
    $certificate = NO_SI;
    $stmt = db()->prepare('INSERT INTO cp_privatetrainings (pvtt_nid, pvtt_eduq, pvtt_othercourse, pvtt_applydate, pvtt_cname, pvtt_cinstitute, pvtt_cstartdate, pvtt_cduration, pvtt_cenddate, pvtt_fees, pvtt_relevant, pvtt_approved, pvtt_reason, pvtt_chequeno, pvtt_chequeissuedate, pvtt_chequedate, pvtt_chequebank, pvtt_amount, pvtt_comment, pvtt_certificatesubmit) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)');
    $stmt->bind_param(
        'ssssssssssssssssssss',
        $nid,
        $education,
        $other,
        $today,
        $course,
        $institute,
        $start,
        $duration,
        $end,
        $fees,
        $relevant,
        $approved,
        $blank,
        $blank,
        $emptyDate,
        $blank,
        $blank,
        $blank,
        $blank,
        $certificate
    );
    if (!$stmt->execute()) {
        json_out(['ok' => false, 'error' => 'The application could not be saved.'], 500);
    }
    json_out(['ok' => true, 'id' => db()->insert_id]);
}

function action_chat(): void
{
    csrf_check();
    $user = current_user();
    $data = body();
    $question = trim((string) ($data['question'] ?? ''));
    $lang = (string) ($data['lang'] ?? 'si');
    if (!in_array($lang, ['si', 'ta', 'en'], true)) {
        $lang = 'si';
    }
    if ($question === '' || strlen($question) > 500) {
        json_out(['ok' => false, 'error' => 'ඔබේ ප්‍රශ්නය කෙටියෙන් ලියන්න.'], 422);
    }
    json_out(['ok' => true, 'reply' => chat_reply($user, $question, $lang)]);
}

function admin_chat_clip(string $value, int $limit): string
{
    $value = trim(strip_tags($value));
    $value = preg_replace('/[ \t]+/u', ' ', $value) ?? $value;
    return mb_substr(trim($value), 0, $limit);
}

function admin_chat_messages(int $id): array
{
    $out = [];
    foreach (rows('SELECT am_from, am_text, am_time FROM cp_adminchatmsg WHERE am_chat = ? ORDER BY am_id ASC LIMIT 200', 'i', [$id]) as $row) {
        $out[] = [
            'from' => (string) ($row['am_from'] ?? ''),
            'text' => (string) ($row['am_text'] ?? ''),
            'time' => (string) ($row['am_time'] ?? ''),
        ];
    }
    return $out;
}

function admin_chat_who(array $row): array
{
    return [
        'id' => (int) ($row['ac_id'] ?? 0),
        'role' => (string) ($row['ac_role'] ?? ''),
        'name' => (string) ($row['ac_name'] ?? ''),
        'office' => (string) ($row['ac_office'] ?? ''),
        'nid' => (string) ($row['ac_nid'] ?? ''),
        'phone' => (string) ($row['ac_phone'] ?? ''),
        'wait' => (int) ($row['ac_wait'] ?? 0),
    ];
}

function admin_chat_find(?array $user, string $nid, string $phone): ?array
{
    if ($user) {
        $rows = rows('SELECT * FROM cp_adminchat WHERE ac_login = ? LIMIT 1', 'i', [(int) $user['id']]);
        return $rows[0] ?? null;
    }
    if ($nid === '' || $phone === '') {
        return null;
    }
    $rows = rows('SELECT * FROM cp_adminchat WHERE ac_login = 0 AND ac_nid = ? AND ac_phone = ? LIMIT 1', 'ss', [$nid, $phone]);
    return $rows[0] ?? null;
}

function action_admin_chat(): void
{
    $user = current_user();
    $thread = (int) ($_GET['thread'] ?? 0);
    if ($user && is_admin($user) && $thread > 0) {
        $rows = rows('SELECT * FROM cp_adminchat WHERE ac_id = ? LIMIT 1', 'i', [$thread]);
        if (!$rows) {
            json_out(['ok' => false, 'error' => 'ඒ කතාබහ හමු නොවුණා.'], 404);
        }
        json_out(['ok' => true, 'who' => admin_chat_who($rows[0]), 'messages' => admin_chat_messages($thread)]);
    }
    if ($user && is_admin($user) && ($_GET['box'] ?? '') === '1') {
        $threads = [];
        foreach (rows('SELECT * FROM cp_adminchat ORDER BY ac_updated DESC, ac_id DESC LIMIT 80') as $row) {
            $id = (int) $row['ac_id'];
            $last = rows('SELECT am_text FROM cp_adminchatmsg WHERE am_chat = ? ORDER BY am_id DESC LIMIT 1', 'i', [$id]);
            $item = admin_chat_who($row);
            $item['updated'] = (string) ($row['ac_updated'] ?? '');
            $item['last'] = (string) ($last[0]['am_text'] ?? '');
            $threads[] = $item;
        }
        json_out(['ok' => true, 'threads' => $threads]);
    }
    $nid = admin_chat_clip((string) ($_GET['nid'] ?? ''), 20);
    $phone = admin_chat_clip((string) ($_GET['phone'] ?? ''), 20);
    if (!$user && ($nid === '' || $phone === '')) {
        json_out(['ok' => true, 'messages' => [], 'need' => true]);
    }
    $found = admin_chat_find($user, $nid, $phone);
    if (!$found) {
        json_out(['ok' => true, 'messages' => []]);
    }
    json_out(['ok' => true, 'messages' => admin_chat_messages((int) $found['ac_id'])]);
}

function action_admin_chat_send(): void
{
    csrf_check();
    $user = current_user();
    $data = body();
    $text = admin_chat_clip((string) ($data['text'] ?? ''), 500);
    if ($text === '') {
        json_out(['ok' => false, 'error' => 'පණිවිඩය ලියන්න.'], 422);
    }
    $now = date('Y-m-d H:i');
    if ($user && is_admin($user) && (int) ($data['thread'] ?? 0) > 0) {
        $id = (int) $data['thread'];
        $found = rows('SELECT ac_id FROM cp_adminchat WHERE ac_id = ? LIMIT 1', 'i', [$id]);
        if (!$found) {
            json_out(['ok' => false, 'error' => 'ඒ කතාබහ හමු නොවුණා.'], 404);
        }
        $stmt = db()->prepare('INSERT INTO cp_adminchatmsg (am_chat, am_from, am_text, am_time) VALUES (?, ?, ?, ?)');
        $from = 'admin';
        $ok = $stmt && bind_and_run($stmt, 'isss', [$id, $from, $text, $now]);
        if ($ok) {
            $touch = db()->prepare('UPDATE cp_adminchat SET ac_updated = ?, ac_wait = 0 WHERE ac_id = ?');
            if ($touch) {
                bind_and_run($touch, 'si', [$now, $id]);
            }
        }
        json_out($ok ? ['ok' => true] : ['ok' => false, 'error' => 'පණිවිඩය යැවිය නොහැකි විය.'], $ok ? 200 : 500);
    }
    $nid = '';
    $phone = '';
    if (!$user) {
        $nid = admin_chat_clip((string) ($data['nid'] ?? ''), 20);
        $phone = admin_chat_clip((string) ($data['phone'] ?? ''), 20);
        if ($nid === '' || $phone === '' || !preg_match('/\d/', $phone)) {
            json_out(['ok' => false, 'error' => 'ලොග් වෙලා නැත්නම් ජාතික හැඳුනුම්පත් අංකය සහ දුරකථන අංකය දාන්න.'], 422);
        }
    }
    $found = admin_chat_find($user, $nid, $phone);
    if ($found) {
        $id = (int) $found['ac_id'];
        if ($user) {
            $touch = db()->prepare('UPDATE cp_adminchat SET ac_role = ?, ac_name = ?, ac_office = ?, ac_updated = ?, ac_wait = 1 WHERE ac_id = ?');
            if ($touch) {
                bind_and_run($touch, 'ssssi', [$user['role'], $user['username'], $user['office'], $now, $id]);
            }
        } else {
            $touch = db()->prepare('UPDATE cp_adminchat SET ac_updated = ?, ac_wait = 1 WHERE ac_id = ?');
            if ($touch) {
                bind_and_run($touch, 'si', [$now, $id]);
            }
        }
    } else {
        $login = $user ? (int) $user['id'] : 0;
        $role = $user ? (string) $user['role'] : '';
        $name = $user ? (string) $user['username'] : '';
        $office = $user ? (string) $user['office'] : '';
        $stmt = db()->prepare('INSERT INTO cp_adminchat (ac_login, ac_role, ac_name, ac_office, ac_nid, ac_phone, ac_updated, ac_wait) VALUES (?, ?, ?, ?, ?, ?, ?, 1)');
        $ok = $stmt && bind_and_run($stmt, 'issssss', [$login, $role, $name, $office, $nid, $phone, $now]);
        if (!$ok) {
            json_out(['ok' => false, 'error' => 'කතාබහ පටන් ගත නොහැකි විය.'], 500);
        }
        $id = (int) db()->insert_id;
    }
    $stmt = db()->prepare('INSERT INTO cp_adminchatmsg (am_chat, am_from, am_text, am_time) VALUES (?, ?, ?, ?)');
    $from = 'person';
    $ok = $stmt && bind_and_run($stmt, 'isss', [$id, $from, $text, $now]);
    json_out($ok ? ['ok' => true] : ['ok' => false, 'error' => 'පණිවිඩය යැවිය නොහැකි විය.'], $ok ? 200 : 500);
}

function chat_norm(string $text): string
{
    $text = function_exists('mb_strtolower') ? mb_strtolower($text, 'UTF-8') : strtolower($text);
    $text = preg_replace('/\s+/u', ' ', $text) ?? $text;
    return trim($text);
}

function chat_has(string $text, array $needles): bool
{
    foreach ($needles as $needle) {
        $needle = chat_norm($needle);
        if ($needle !== '' && str_contains($text, $needle)) {
            return true;
        }
    }
    return false;
}

function chat_scope_note(array $user, string $lang): string
{
    if ($user['role'] === 'User') {
        $office = $user['office'] !== '' ? $user['office'] : '—';
        return match ($lang) {
            'ta' => 'இது உங்கள் அலுவலகமான ' . $office . ' பற்றியது மட்டும்.',
            'en' => 'This is only about your office, ' . $office . '.',
            default => 'මෙය ඔබේ කාර්යාලය වන ' . $office . ' ගැන පමණි.',
        };
    }
    return match ($lang) {
        'ta' => 'இது எல்லா அலுவலகங்களையும் சேர்த்தது.',
        'en' => 'This covers every office.',
        default => 'මෙය සියලු කාර්යාල ගැනයි.',
    };
}

function chat_guide(array $user, string $lang, string $topic): string
{
    $wide = $user['role'] !== 'User';
    $lines = match ($topic) {
        'apply' => $lang === 'en'
            ? ['Open Apply for a programme. It is on the User, Super User, and Administrator dashboards.', 'Enter the officer national ID, choose the programme, then Apply.', 'If special facts are saved, read them before the officer details appear.', 'Set the priority from 1 to 50 and submit. A passed deadline is not in the list. The closest deadline is first.', 'A blacklisted officer cannot be nominated.']
            : ($lang === 'ta'
                ? ['பயிற்சி விண்ணப்பத்தைத் திறக்கவும். பயனர், சூப்பர் பயனர், நிர்வாகி பலகைகளில் உள்ளது.', 'அடையாள எண், பயிற்சி, முன்னுரிமை 1 முதல் 50. கடைசி நாள் முடிந்த பயிற்சி பட்டியலில் இல்லை.']
                : ['පුහුණු වැඩසටහන් අයදුම් කිරීම විවෘත කරන්න. ඒක User, Super User, Administrator පුවරු තුනේම තියෙනවා.', 'නිලධාරී හැඳුනුම්පත් අංකය දාලා වැඩසටහන තෝරලා අයදුම් කරන්න ඔබන්න.', 'විශේෂ කරුණු තිබේ නම් ඒවා පළමුව පේනවා. ඊට පස්සේ නිලධාරී විස්තර එනවා.', 'ප්‍රමුඛත්වය 1 සිට 50 දක්වා දාලා යවන්න. අයදුම් අවසන් දිනය ගෙවුණාම ලැයිස්තුවෙන් යනවා. ඉක්මනින් ඉවර වෙන එක උඩින්.', 'අසාදු ලේඛනයේ ඉන්න අයෙකුට අයදුම් කළ නොහැක.']),
        'staff' => $lang === 'en'
            ? ['Open the staff register.', 'Add an officer, or search by office, designation, and service.', 'Delete asks you to confirm before the officer is removed.']
            : ($lang === 'ta'
                ? ['பணியாளர் பதிவைத் திறக்கவும்.', 'அதிகாரியைச் சேர்க்கவும் அல்லது தேடவும்.']
                : ['කාර්යමණ්ඩල ලේඛනය විවෘත කරන්න.', 'නිලධාරියෙක් ඇතුළත් කරන්න, නැත්නම් නම, ජාතික හැඳුනුම්පත් අංකය, දුරකථන අංකය අනුව සොයන්න.', 'මකනකොට ඉවත් කරන්න හෝ නැවත යන්න තෝරන්න.']),
        'needs' => $lang === 'en'
            ? ['Open Add a need.', 'Choose the designation and training need, then submit.', 'Users can submit only during the open period.']
            : ($lang === 'ta'
                ? ['தேவையைச் சேர்க்க திறக்கவும்.', 'பதவி, பயிற்சி தேவை, அதிகாரி எண்ணிக்கையை நிரப்பவும்.']
                : ['අවශ්‍යතාවක් එක් කරන්න විවෘත කරන්න.', 'තනතුර, පුහුණු අවශ්‍යතාව, නිලධාරීන් ගණන දාලා ඇතුළත් කරන්න.', 'පරිශීලකයාට කාල සීමාව ඇතුළත විතරක් දාන්න පුළුවන්.']),
        'plan' => $wide
            ? ($lang === 'en'
                ? ['Open the annual plan and choose edit.', 'The first date moves the other dates and the application deadline.', 'People who already applied stay on the new dates. A named programme cannot be deleted.']
                : ($lang === 'ta'
                    ? ['ஆண்டுத் திட்டத்தைத் திறந்து திருத்தவும்.', 'முதல் நாள் நகர்ந்தால் மற்ற நாட்களும் விண்ணப்ப கடைசி நாளும் நகரும்.']
                    : ['වාර්ෂික සැලැස්ම අරින්න, edit ඔබන්න.', 'දිනය 1 වෙනස් කළාම අනිත් දින සහ අයදුම් අවසන් දිනයත් ඒ වෙනසට යනවා.', 'කලින් අයදුම් කළ අය අලුත් දිනයේම ඉන්නවා. නමක් ඇති වැඩසටහනක් මකන්න බැහැ.']))
            : ($lang === 'en'
                ? ['Open the annual plan to see every programme. Your account can look, not change the plan.']
                : ($lang === 'ta'
                    ? ['ஆண்டுத் திட்டத்தில் எல்லா பயிற்சிகளையும் பார்க்கலாம். மாற்ற முடியாது.']
                    : ['වාර්ෂික සැලැස්මෙන් සියලු වැඩසටහන් බලන්න පුළුවන්. වෙනස් කරන්න බැහැ.'])),
        'letter' => $lang === 'en'
            ? ['Open the nomination letter.', 'Search the officer by national ID and print the letter. Dates come from the programme.']
            : ($lang === 'ta'
                ? ['பரிந்துரை கடிதத்தைத் திறக்கவும்.', 'அடையாள எண்ணால் அதிகாரியைத் தேடி அச்சிடவும்.']
                : ['කැඳවීමේ ලිපිය විවෘත කරන්න.', 'ජාතික හැඳුනුම්පත් අංකය දාලා වර්ෂය තෝරන්න.', 'ඒ වර්ෂයේ සහභාගි වූ සෑම පුහුණුවකටම කැඳවීමේ ලිපිය ගන්න පුළුවන්.']),
        default => [chat_overview($user, $lang)],
    };
    if ($topic !== 'default' && $user['role'] === 'User' && in_array($topic, ['staff', 'apply'], true)) {
        $lines[] = chat_scope_note($user, $lang);
    }
    return implode("\n", $lines);
}

function chat_overview(array $user, string $lang): string
{
    if ($user['role'] === 'User') {
        $office = $user['office'] !== '' ? $user['office'] : '—';
        return match ($lang) {
            'ta' => "நீங்கள் பயனர். உங்கள் அலுவலகம் {$office}.\n1. பணியாளர் பதிவில் உங்கள் அலுவலக அதிகாரிகளைச் சேர்க்கலாம்.\n2. பயிற்சி அதிகாரிகளை + அல்லது அடையாள எண்ணால் சேர்க்கலாம்.\n3. கால வரம்பிற்குள் பயிற்சி தேவையைச் சேர்க்கலாம்.\n4. விண்ணப்பிக்கவில் அதிகாரி எண்ணையும் பயிற்சியையும் தெரிவு செய்யவும்.\n5. ஆண்டுத் திட்டத்தைப் பார்க்கலாம். மாற்ற முடியாது.\n6. பரிந்துரை கடிதம், கையொப்பப் படிவம், தனியார் படிப்பு, இன்றைய பிறந்தநாள்.\nமக்கள் பதில்கள் உங்கள் அலுவலகம் மட்டும்.",
            'en' => "You are a User. Your office is {$office}.\n1. Staff register: add and search officers in your office.\n2. Training officers: add with + or a national ID.\n3. Add a training need during the open period.\n4. Apply: officer ID and programme.\n5. Annual plan: you can view every programme, not edit it.\n6. Nomination letter, sign sheet, private course, and today's birthdays.\nAnswers about people stay inside your office.",
            default => "ඔබ පරිශීලකයෙක්. ඔබේ කාර්යාලය {$office}.\n1. කාර්යමණ්ඩල ලේඛනයෙන් ඔබේ කාර්යාලයේ නිලධාරීන් ඇතුළත් කරන්න, සොයන්න.\n2. පුහුණු නිලධාරීන් + බොත්තමෙන් හෝ හැඳුනුම්පතෙන් දමන්න.\n3. කාල සීමාව ඇතුළත පුහුණු අවශ්‍යතාවක් දමන්න.\n4. අයදුම් කරන්න: නිලධාරියාගේ හැඳුනුම්පත සහ වැඩසටහන.\n5. වාර්ෂික සැලැස්ම බලන්න පුළුවන්. වෙනස් කරන්න බැහැ.\n6. කැඳවීමේ ලිපිය, අත්සන් පත්‍රය, පෞද්ගලික පාඨමාලාව, අද උපන්දින.\nමිනිස්සු ගැන පිළිතුරු ඔබේ කාර්යාලය ගැන විතරයි.",
        };
    }
    if ($user['role'] === 'Super User') {
        return match ($lang) {
            'ta' => "நீங்கள் சூப்பர் பயனர். எல்லா அலுவலகங்களும்.\n1. பயிற்சி தேவைகள், கடைசி நாள், திட்டம் அமைத்தல், ஆண்டுத் திட்டம் திருத்தம்.\n2. முதல் நாளை மாற்றினால் மற்ற நாட்களும் விண்ணப்ப நாளும் நகரும். ஏற்கெனவே விண்ணப்பித்தவர் புதிய நாளில் இருப்பர்.\n3. விண்ணப்பங்கள், வருகை, நிகழ்ச்சியை முடித்தல், மதிப்பீடு, கையொப்பம், கடிதம்.\n4. வெளிப்புற படிப்பு நிதி, பிற அலுவலகப் பயிற்சி, வள ஆள்கள்.\n5. உதவித்தொகை பெற்ற அதிகாரிகள், இன்றைய பிறந்தநாள்.\nபெயருள்ள பயிற்சியை நீக்க முடியாது.",
            'en' => "You are a Super User. Every office is included.\n1. Training needs, closing date, build the plan, and edit the annual plan.\n2. Moving day 1 moves the other dates and the application deadline. People who already applied stay on the new dates.\n3. Applications, attendance, finish a programme, estimate, sign sheet, and nomination letter.\n4. External-course funding, other offices' programmes, and resource persons.\n5. Scholarship holders and today's birthdays.\nA programme that has a name cannot be deleted.",
            default => "ඔබ සුපිරි පරිශීලකයෙක්. සියලු කාර්යාල ඇතුළත්.\n1. පුහුණු අවශ්‍යතා, අවසන් දිනය, සැලැස්ම සකසන්න, වාර්ෂික සැලැස්ම වෙනස් කරන්න.\n2. දිනය 1 වෙනස් කළාම අනිත් දින සහ අයදුම් අවසන් දිනයත් යනවා. කලින් අයදුම් කළ අය අලුත් දිනයේම ඉන්නවා.\n3. අයදුම්පත්, පැමිණීම, වැඩසටහන අවසන් කිරීම, ඇස්තමේන්තුව, අත්සන් පත්‍රය, කැඳවීමේ ලිපිය.\n4. බාහිර පාඨමාලා ප්‍රතිපාදන, වෙනත් කාර්යාලවල පුහුණු, සම්පත් දායකයින්.\n5. විදේශ ශිෂ්‍යත්ව සඳහා සහභාගී වූ නිලධාරීන්, අද උපන්දින.\nනමක් ඇති වැඩසටහනක් මකන්න බැහැ.",
        };
    }
    return match ($lang) {
        'ta' => "நீங்கள் நிர்வாகி. எல்லா அலுவலகங்களும், எல்லாப் பக்கங்களும்.\n1. கட்டுப்பாடு: பதவி, அலுவலகம், கணக்கு, பயிற்சி பெயர், பாடம், அறிவிப்பு, பதிவிறக்கம்.\n2. பணியாளர் பதிவு, தடைப் பட்டியல், பயிற்சி அதிகாரிகள்.\n3. சூப்பர் பயனர் செய்யும் திட்டம், விண்ணப்பம், வருகை, மதிப்பீடு, கடிதம்.\n4. தேர்ந்த விண்ணப்பத்தையும் நீக்கலாம்.\nபெயருள்ள பயிற்சியை நீக்க முடியாது. பெயர் இல்லாத வரிசையை நீக்கலாம்.",
        'en' => "You are the Administrator. Every office and every page.\n1. Control: designations, offices, accounts, programme names, subjects, notices, and downloads.\n2. Staff register, blacklist, and training officers.\n3. Everything a Super User does: the plan, applications, attendance, estimates, and letters.\n4. You can delete an application even after the officer was selected.\nA named programme cannot be deleted. An empty-named row can.",
        default => "ඔබ පරිපාලකයෙක්. සියලු කාර්යාල සහ සියලු පිටු.\n1. පාලනය: තනතුරු, කාර්යාල, ගිණුම්, වැඩසටහන් නම්, විෂය, දැනුම්දීම්, බාගත කිරීම්.\n2. කාර්යමණ්ඩල ලේඛනය, අසාදු ලේඛනය, පුහුණු නිලධාරීන්.\n3. සුපිරි පරිශීලකයා කරන සැලැස්ම, අයදුම්, පැමිණීම, ඇස්තමේන්තු, ලිපි.\n4. තෝරාගත් අයදුම්පතක් වුනත් මකන්න පුළුවන්.\nනමක් ඇති වැඩසටහනක් මකන්න බැහැ. හිස් නමක් ඇති පේළියක් මකන්න පුළුවන්.",
    };
}

function chat_office_sql(array $user, string $column): array
{
    if ($user['role'] !== 'User') {
        return ['', '', []];
    }
    if ($user['office'] === '') {
        return [' AND 1=0 ', '', []];
    }
    return [' AND `' . $column . '` = ? ', 's', [$user['office']]];
}

function chat_word_like(string $word, array $targets, int $distance = 1): bool
{
    $word = chat_norm($word);
    foreach ($targets as $target) {
        $target = chat_norm($target);
        if ($word === $target) {
            return true;
        }
        if ($word !== '' && preg_match('/^[a-z]+$/', $word) && preg_match('/^[a-z]+$/', $target) && abs(strlen($word) - strlen($target)) <= $distance && levenshtein($word, $target) <= $distance) {
            return true;
        }
    }
    return false;
}

function chat_greeting(string $text): string
{
    $raw = trim(chat_norm($text), " \t\n\r.!?,;:~-");
    if ($raw === '') {
        return '';
    }
    $words = preg_split('/\s+/u', $raw) ?: [];
    if (count($words) > 4) {
        return '';
    }
    $good = false;
    $morning = false;
    $afternoon = false;
    $evening = false;
    $night = false;
    $hello = false;
    foreach ($words as $word) {
        if (chat_word_like($word, ['good', 'goog', 'gud', 'gd'])) {
            $good = true;
        }
        if (chat_word_like($word, ['morning', 'moring', 'mornin', 'mrning'])) {
            $morning = true;
        }
        if (chat_word_like($word, ['afternoon', 'afternon', 'afternoo'])) {
            $afternoon = true;
        }
        if (chat_word_like($word, ['evening', 'evning', 'evenin'])) {
            $evening = true;
        }
        if (chat_word_like($word, ['night', 'nite'])) {
            $night = true;
        }
        if (in_array($word, ['hi', 'hii', 'hai', 'hay', 'hey', 'hello', 'helo', 'hellow', 'හායි', 'ஹாய்', 'ஹை'], true)) {
            $hello = true;
        }
    }
    if ($good && $morning) {
        return 'Good morning.';
    }
    if ($good && $afternoon) {
        return 'Good afternoon.';
    }
    if ($good && $evening) {
        return 'Good evening.';
    }
    if ($good && $night) {
        return 'Good night.';
    }
    if ($raw === 'ආයුබෝවන්' || $raw === 'ආයුබෝවන්!') {
        return 'ආයුබෝවන්.';
    }
    if ($raw === 'සුභ උදෑසනක්' || str_contains($raw, 'සුභ උදෑසන')) {
        return 'සුභ උදෑසනක්.';
    }
    if ($raw === 'කොහොමද' || $raw === 'කොහොම ද') {
        return 'ආයුබෝවන්.';
    }
    if ($raw === 'வணக்கம்' || str_contains($raw, 'காலை வணக்கம்')) {
        return str_contains($raw, 'காலை') ? 'காலை வணக்கம்.' : 'வணக்கம்.';
    }
    if ($hello && count($words) === 1) {
        if (in_array($words[0], ['hello', 'helo', 'hellow'], true)) {
            return 'Hello.';
        }
        if ($words[0] === 'hey') {
            return 'Hey.';
        }
        if (in_array($words[0], ['හායි'], true)) {
            return 'හායි.';
        }
        if (in_array($words[0], ['ஹாய்', 'ஹை'], true)) {
            return 'ஹாய்.';
        }
        return 'Hi.';
    }
    return '';
}

function chat_answer_lang(string $text, string $lang): string
{
    if (preg_match('/\p{Tamil}/u', $text)) {
        return 'ta';
    }
    if (preg_match('/\p{Sinhala}/u', $text)) {
        return 'si';
    }
    if (chat_has($text, ['eke', 'monada', 'mona', 'thiyen', 'kiyala', 'gena', 'puhunu', 'sampath', 'thoragat', 'thoragath', 'kohom', 'neda', 'meke', 'wadass', 'ayadum', 'niladari', 'home eke'])) {
        return 'si';
    }
    return in_array($lang, ['si', 'ta', 'en'], true) ? $lang : 'si';
}

function chat_home_text(string $lang): string
{
    $name = signatory_profile()['display'];
    return match ($lang) {
        'ta' => "முகப்பில் உள்ளவை:\n1. புகைப்படங்கள்\n2. தலைமை — {$name}, துணை பிரதம செயலாளர் (பயிற்சி)\n3. வள ஆள்கள் பதிவு\n4. நடைபெறும் பயிற்சிகள்\n5. அறிவிப்புகள்\n6. வெளிநாட்டு உதவித்தொகை\n7. வெளிப்புற படிப்புகள்\n8. இன்றைய பிறந்தநாள்\n9. நாட்காட்டி",
        'en' => "The home page has:\n1. Photographs\n2. Leadership — {$name}, Deputy Chief Secretary (Training)\n3. Resource-person register\n4. Training programmes now\n5. Notices\n6. Foreign scholarships\n7. External courses\n8. Birthdays today\n9. Calendar",
        default => "මුල් පිටුවේ තියෙන්නේ:\n1. ඡායාරූප\n2. නායකත්වය — {$name}, නියෝජ්‍ය ප්‍රධාන ලේකම් (පුහුණු)\n3. සම්පත්දායක සංචිතය සහ ලියාපදිංචි වන්න\n4. පවත්වන පුහුණු වැඩසටහන්\n5. දැනුම්දීම්\n6. විදේශ ශිෂ්‍යත්ව\n7. බාහිර පුහුණු පාඨමාලා\n8. අද උපන්දින\n9. දින දර්ශනය",
    };
}

function chat_about_home(string $text): bool
{
    $home = chat_has($text, ['home', 'මුල් පිටු', 'මුල්පිටු', 'முகப்பு', 'homepage']);
    $ask = chat_has($text, ['mona', 'මොන', 'what', 'තියෙ', 'thiyen', 'have', 'ඇති', 'list', 'eka', 'ekath']);
    return $home && ($ask || chat_has($text, ['eke', 'page', 'පිටු']));
}

function chat_about_resource(string $text): bool
{
    return chat_has($text, ['sampath', 'සම්පත්', 'resource person', 'resource', 'வள ஆ']);
}

function chat_about_selected(string $text): bool
{
    return chat_has($text, ['thoragat', 'thoragath', 'selected list', 'selected people', 'තෝරාගත්', 'தேர்ந்த']);
}

function chat_about_programme(string $text): bool
{
    return chat_has($text, ['puhunu', 'wadassata', 'වැඩසටහන', 'වැඩසටහන්', 'programme', 'program', 'பயிற்சி']);
}

function chat_quick(?array $user, string $text, string $lang): string
{
    if (chat_has($text, ['kohom', 'කොහොම', 'how ', 'how?', 'எப்படி'])) {
        return '';
    }
    $talk = chat_answer_lang($text, $lang);
    if (chat_about_home($text)) {
        return chat_home_text($talk);
    }
    if (chat_about_selected($text)) {
        return chat_selected_answer($user, $talk);
    }
    if (chat_about_resource($text)) {
        return chat_resource_answer($user, $talk);
    }
    if (chat_about_programme($text)) {
        return chat_programme_answer($talk);
    }
    return '';
}

function chat_programme_answer(string $lang): string
{
    $today = date('Y-m-d');
    $rows = rows(
        "SELECT atp_trname, atp_day1, atp_lastdateapply, atp_location FROM cp_atp
         WHERE TRIM(atp_trname) <> '' AND atp_lastdateapply >= ? AND atp_lastdateapply NOT LIKE '0000%' AND atp_lastdateapply NOT LIKE '1111%'
         ORDER BY atp_lastdateapply ASC LIMIT 8",
        's',
        [$today]
    );
    $title = match ($lang) {
        'ta' => 'இப்போது விண்ணப்பிக்கும் பயிற்சிகள்:',
        'en' => 'Programmes open for applications:',
        default => 'දැන් අයදුම් කළ හැකි පුහුණු වැඩසටහන්:',
    };
    if (!$rows) {
        return match ($lang) {
            'ta' => 'இப்போது விண்ணப்பிக்கும் பயிற்சி இல்லை.',
            'en' => 'No programme is open for applications right now.',
            default => 'දැන් අයදුම් කළ හැකි වැඩසටහනක් නැහැ.',
        };
    }
    $lines = [$title];
    foreach ($rows as $row) {
        $lines[] = trim($row['atp_trname'] . ' — ' . substr((string) $row['atp_day1'], 0, 10) . ', ' . $row['atp_location'] . ', අවසන් දිනය ' . substr((string) $row['atp_lastdateapply'], 0, 10));
    }
    return implode("\n", $lines);
}

function chat_resource_answer(?array $user, string $lang): string
{
    if ($user === null) {
        return match ($lang) {
            'ta' => 'வள ஆளாகப் பதிவு செய்ய முகப்பில் லියාපදිංචි වන්න. பெயர் பட்டியல் உள்நுழைந்த பின்.',
            'en' => 'Register as a resource person from the home page. The name list is available after you sign in.',
            default => 'සම්පත්දායකයෙක් ලෙස ලියාපදිංචි වෙන්න මුල් පිටුවේ ලියාපදිංචි වන්න බොත්තමෙන්. නම් ලැයිස්තුව පද්ධතියට ඇතුල් වුණාම පේනවා.',
        };
    }
    $rows = rows('SELECT rp_name, rp_desig, rp_office, rp_fld1 FROM cp_resourcepersons WHERE TRIM(rp_name) <> \'\' ORDER BY rp_id DESC LIMIT 8');
    $title = match ($lang) {
        'ta' => 'சமீபத்திய வள ஆள்கள்:',
        'en' => 'Latest resource persons:',
        default => 'අලුත්ම සම්පත් දායකයන්:',
    };
    if (!$rows) {
        return match ($lang) {
            'ta' => 'வள ஆள் பதிவு இல்லை.',
            'en' => 'No resource persons are registered.',
            default => 'සම්පත් දායකයන් ලියාපදිංචි වී නැහැ.',
        };
    }
    $lines = [$title];
    foreach ($rows as $row) {
        $lines[] = trim($row['rp_name'] . ' — ' . $row['rp_desig'] . ', ' . $row['rp_office'] . ($row['rp_fld1'] !== '' ? ', ' . $row['rp_fld1'] : ''));
    }
    return implode("\n", $lines);
}

function chat_selected_answer(?array $user, string $lang): string
{
    if ($user === null) {
        return match ($lang) {
            'ta' => 'தேர்ந்தவர் பட்டியல் உள்நுழைந்த பின்.',
            'en' => 'The selected list is available after you sign in.',
            default => 'තෝරාගත් ලැයිස්තුව බලන්න පද්ධතියට ඇතුල් වෙන්න.',
        };
    }
    $types = '';
    $params = [];
    $office = '';
    if ($user['role'] === 'User') {
        if ($user['office'] === '') {
            return chat_scope_note($user, $lang);
        }
        $office = ' AND tapp_office = ? ';
        $types = 's';
        $params[] = $user['office'];
    }
    $rows = rows(
        'SELECT tapp_trname, tapp_officerNid, tapp_office FROM cp_trainingapplications WHERE tapp_isselected = ?' . $office . ' ORDER BY tapp_id DESC LIMIT 12',
        's' . $types,
        array_merge([YES_SI], $params)
    );
    $title = match ($lang) {
        'ta' => 'தேர்ந்தவர்கள்:',
        'en' => 'Selected people:',
        default => 'තෝරාගත් අය:',
    };
    if (!$rows) {
        $title = match ($lang) {
            'ta' => 'இப்போது தேர்ந்தவர் இல்லை.',
            'en' => 'Nobody is selected right now.',
            default => 'දැන් තෝරාගත් අය නැහැ.',
        };
    }
    $lines = [$title];
    foreach ($rows as $row) {
        $lines[] = trim($row['tapp_trname'] . ' — ' . $row['tapp_officerNid'] . ', ' . $row['tapp_office']);
    }
    if ($user['role'] === 'User') {
        $lines[] = chat_scope_note($user, $lang);
    }
    return implode("\n", $lines);
}

function chat_hidden_column(string $column): bool
{
    $column = strtolower($column);
    return in_array($column, ['lg_pwd', 'rp_code', 'nt_gmail_app', 'nt_wa_token'], true)
        || str_contains($column, 'pwd')
        || str_contains($column, 'password');
}

function chat_login_needed(string $lang): string
{
    return match ($lang) {
        'ta' => 'உள்நுழையாமல் தரவுத்தள விவரங்களைச் சொல்ல முடியாது. முகப்பில் உள்ளவை மட்டும். உள்நுழைந்த பின் கேளுங்கள்.',
        'en' => 'Without signing in I only answer what is on the home page. Sign in to ask about lecturers, officers, or an ID number.',
        default => 'ලොග් වෙලා නැත්නම් මුල් පිටුවේ තියෙන දේ විතරයි කියන්න පුළුවන්. දේශකයා, නිලධාරියා, හෝ හැඳුනුම්පත් අංකය ගැන අහන්න නම් පද්ධතියට ඇතුල් වෙන්න.',
    };
}

function chat_about_lecturer(string $text): bool
{
    if (chat_has($text, ['lecture', 'lecturer', 'lectul', 'lekcure', 'lekchar', 'lekture', 'lectuer', 'දේශක', 'விரிவுரை'])) {
        return true;
    }
    return preg_match('/lekc|lectu|lekch/u', $text) === 1;
}

function chat_subject_of(string $text): string
{
    $drop = [
        'lecture', 'lecturer', 'lectures', 'lectul', 'lekcure', 'lekchar', 'lekture', 'lectuer', 'lekcuer',
        'දේශකයා', 'දේශකයන්', 'දේශක', 'විෂය', 'subject', 'subjects', 'kauda', 'කවුද', 'inne', 'ඉන්නේ', 'ඉන්න',
        'who', 'is', 'the', 'for', 'eke', 'karana', 'කරන', 'කරන්නේ', 'monada', 'මොකද', 'කියන්න', 'please', 'help',
        'of', 'about', 'name', 'නම', 'thiyenne', 'තියෙන්නේ', 'ahuvoth', 'kohomada', 'කොහොමද', 'meke', 'eka', 'ekak',
        'කවුරුන්ද', 'දෙන්න', 'කියලා',
    ];
    foreach ($drop as $word) {
        $text = str_replace(chat_norm($word), ' ', $text);
    }
    $text = preg_replace('/[^\p{L}\p{M}\p{N}\s]/u', ' ', $text) ?? $text;
    $text = trim(preg_replace('/\s+/u', ' ', $text) ?? $text);
    $words = array_values(array_filter(preg_split('/\s+/u', $text) ?: [], static function (string $word): bool {
        return !in_array($word, ['a', 'an', 'me', 'ge', 'ගේ'], true);
    }));
    $text = trim(implode(' ', $words));
    if ((function_exists('mb_strlen') ? mb_strlen($text) : strlen($text)) < 2) {
        return '';
    }
    return $text;
}

function chat_word_hit(string $hay, string $needle): bool
{
    $hay = chat_norm(html_entity_decode($hay, ENT_QUOTES, 'UTF-8'));
    $needle = chat_norm($needle);
    if ($needle === '' || $hay === '') {
        return false;
    }
    $short = (function_exists('mb_strlen') ? mb_strlen($needle) : strlen($needle)) <= 3;
    if ($short) {
        return preg_match('/(?<![\p{L}\p{M}\p{N}])' . preg_quote($needle, '/') . '(?![\p{L}\p{M}\p{N}])/u', $hay) === 1;
    }
    if (str_contains($hay, $needle)) {
        return true;
    }
    $words = preg_split('/\s+/u', $needle) ?: [];
    if (count($words) < 2) {
        return false;
    }
    foreach ($words as $word) {
        if ((function_exists('mb_strlen') ? mb_strlen($word) : strlen($word)) < 3) {
            continue;
        }
        if (!str_contains($hay, $word)) {
            return false;
        }
    }
    return true;
}

function chat_rp_fields(array $row): string
{
    $fields = [];
    foreach (['rp_fld1', 'rp_fld2', 'rp_fld3', 'rp_fld4', 'rp_fld5', 'rp_morefields'] as $column) {
        $value = trim(preg_replace('/\s+/u', ' ', (string) ($row[$column] ?? '')) ?? '');
        if ($value !== '') {
            $fields[] = $value;
        }
    }
    return implode(', ', $fields);
}

function chat_rp_detail(array $row, string $lang): string
{
    $name = trim((string) ($row['rp_name'] ?? ''));
    $post = trim((string) ($row['rp_desig'] ?? ''));
    $office = trim((string) ($row['rp_office'] ?? ''));
    $phone = trim((string) ($row['rp_mobile'] ?? ''));
    if ($phone === '') {
        $phone = trim((string) ($row['rp_offtele'] ?? ''));
    }
    $mail = trim((string) ($row['rp_email'] ?? ''));
    $study = [];
    foreach (['rp_phd' => 'PhD', 'rp_msc' => 'MSc', 'rp_degree' => 'උපාධිය', 'rp_profq' => 'වෘත්තීය'] as $column => $label) {
        $value = trim(preg_replace('/\s+/u', ' ', (string) ($row[$column] ?? '')) ?? '');
        if ($value !== '') {
            $study[] = $label . ' ' . $value;
        }
    }
    $subject = chat_rp_fields($row);
    $who = trim($name . ($post !== '' ? ' — ' . $post : '') . ($office !== '' ? ', ' . $office : ''));
    $bits = [$who];
    if ($phone !== '') {
        $bits[] = ($lang === 'en' ? 'Phone ' : ($lang === 'ta' ? 'தொலைபேசி ' : 'දුරකථන ')) . $phone;
    }
    if ($mail !== '') {
        $bits[] = $mail;
    }
    if ($subject !== '') {
        $bits[] = ($lang === 'en' ? 'Subjects: ' : ($lang === 'ta' ? 'பாடம்: ' : 'විෂය: ')) . $subject;
    }
    if ($study) {
        $bits[] = implode(', ', $study);
    }
    return implode(' — ', $bits);
}

function chat_resource_rows(string $needle, bool $exactNid): array
{
    $cols = 'rp_name, rp_nid, rp_desig, rp_office, rp_mobile, rp_offtele, rp_email, rp_phd, rp_msc, rp_degree, rp_profq, rp_fld1, rp_fld2, rp_fld3, rp_fld4, rp_fld5, rp_morefields';
    if ($exactNid) {
        $nid = strtoupper(str_replace(' ', '', $needle));
        return rows("SELECT $cols FROM cp_resourcepersons WHERE REPLACE(UPPER(rp_nid), ' ', '') = ? LIMIT 4", 's', [$nid]);
    }
    $like = '%' . str_replace(['%', '_'], '', $needle) . '%';
    return rows(
        "SELECT $cols FROM cp_resourcepersons WHERE rp_name LIKE ? OR rp_nid LIKE ? OR rp_desig LIKE ? OR rp_fld1 LIKE ? OR rp_fld2 LIKE ? OR rp_fld3 LIKE ? OR rp_morefields LIKE ? ORDER BY rp_name LIMIT 6",
        'sssssss',
        [$like, $like, $like, $like, $like, $like, $like]
    );
}

function chat_identity(array $user, string $lang, string $needle): string
{
    $clean = trim(str_replace(['%', '_'], '', $needle));
    $compact = strtoupper(str_replace(' ', '', $clean));
    $exactNid = preg_match('/^\d{9}[VX]?$|^\d{12}$/', $compact) === 1;
    $lines = [];
    $people = chat_resource_rows($exactNid ? $compact : $clean, $exactNid);
    if ($people) {
        $lines[] = match ($lang) {
            'ta' => 'வள ஆள் விவரம்:',
            'en' => 'Resource person:',
            default => 'සම්පත් දායකයා:',
        };
        foreach ($people as $row) {
            $lines[] = chat_rp_detail($row, $lang);
        }
    }
    $like = '%' . $clean . '%';
    [$officeSql, $officeType, $officeParams] = chat_office_sql($user, 'stf_office');
    $staff = $exactNid
        ? rows('SELECT stf_Name, stf_desig, stf_office, stf_mobile, stf_Nid FROM cp_staff WHERE REPLACE(UPPER(stf_Nid), \' \', \'\') = ?' . $officeSql . ' LIMIT 4', 's' . $officeType, array_merge([$compact], $officeParams))
        : rows('SELECT stf_Name, stf_desig, stf_office, stf_mobile, stf_Nid FROM cp_staff WHERE (stf_Name LIKE ? OR stf_Nid LIKE ? OR stf_desig LIKE ?)' . $officeSql . ' ORDER BY stf_Name LIMIT 6', 'sss' . $officeType, array_merge([$like, $like, $like], $officeParams));
    if ($staff) {
        $lines[] = match ($lang) {
            'ta' => 'பணியாளர் பதிவு:',
            'en' => 'Staff register:',
            default => 'කාර්යමණ්ඩල ලේඛනය:',
        };
        foreach ($staff as $row) {
            $lines[] = trim($row['stf_Name'] . ' — ' . $row['stf_desig'] . ', ' . $row['stf_office'] . ($row['stf_mobile'] !== '' ? ', ' . $row['stf_mobile'] : ''));
        }
        if ($user['role'] === 'User') {
            $lines[] = chat_scope_note($user, $lang);
        }
    }
    return implode("\n", $lines);
}

function chat_lecturers(string $lang, string $text): string
{
    $subject = chat_subject_of($text);
    if ($subject === '') {
        return match ($lang) {
            'ta' => 'பாடத்தின் பெயரைச் சொல்லுங்கள். எடுத்துக்காட்டு: Excel விரிவுரையாளர் யார்?',
            'en' => 'Tell me the subject. For example: who lectures Excel?',
            default => 'විෂයේ නම කියන්න. උදාහරණ: Excel දේශකයා කවුද?',
        };
    }
    $plans = rows(
        "SELECT atp_trname, atp_resourcep1, atp_resourcep2, atp_resourcep3, atp_resourcep4, atp_resourcep5,
                atp_resourcep6, atp_resourcep7, atp_resourcep8, atp_resourcep9, atp_resourcep10, atp_moreresource
         FROM cp_atp WHERE TRIM(atp_trname) <> ''"
    );
    $lines = [];
    $seen = [];
    foreach ($plans as $plan) {
        if (!chat_word_hit((string) $plan['atp_trname'], $subject)) {
            continue;
        }
        $names = [];
        for ($i = 1; $i <= 10; $i++) {
            $name = trim((string) ($plan['atp_resourcep' . $i] ?? ''));
            if ($name !== '') {
                $names[] = $name;
            }
        }
        foreach (preg_split('/[,;\n]+/u', (string) ($plan['atp_moreresource'] ?? '')) ?: [] as $extra) {
            $extra = trim($extra);
            if ($extra !== '') {
                $names[] = $extra;
            }
        }
        $names = array_values(array_unique($names));
        if (!$names) {
            continue;
        }
        $title = trim(html_entity_decode((string) $plan['atp_trname'], ENT_QUOTES, 'UTF-8'));
        $lines[] = ($lang === 'en' ? 'Programme: ' : ($lang === 'ta' ? 'பயிற்சி: ' : 'වැඩසටහන: ')) . $title;
        foreach ($names as $name) {
            if (isset($seen[$name])) {
                $lines[] = $name;
                continue;
            }
            $seen[$name] = true;
            $found = chat_resource_rows($name, false);
            $match = null;
            foreach ($found as $row) {
                if (chat_norm((string) $row['rp_name']) === chat_norm($name)) {
                    $match = $row;
                    break;
                }
            }
            $lines[] = $match ? chat_rp_detail($match, $lang) : $name;
        }
        if (count($lines) >= 14) {
            break;
        }
    }
    $byField = rows(
        'SELECT rp_name, rp_nid, rp_desig, rp_office, rp_mobile, rp_offtele, rp_email, rp_phd, rp_msc, rp_degree, rp_profq, rp_fld1, rp_fld2, rp_fld3, rp_fld4, rp_fld5, rp_morefields
         FROM cp_resourcepersons WHERE TRIM(rp_name) <> \'\''
    );
    $fieldHits = 0;
    foreach ($byField as $row) {
        if ($fieldHits >= 6 || count($lines) >= 18) {
            break;
        }
        $blob = chat_rp_fields($row) . ' ' . (string) ($row['rp_desig'] ?? '');
        if (!chat_word_hit($blob, $subject)) {
            continue;
        }
        $name = trim((string) $row['rp_name']);
        if ($name === '' || isset($seen[$name])) {
            continue;
        }
        $seen[$name] = true;
        $fieldHits++;
        if ($fieldHits === 1) {
            $lines[] = match ($lang) {
                'ta' => 'அந்தப் பாடத்தைப் பதிவு செய்த வள ஆள்கள்:',
                'en' => 'Resource persons registered for that subject:',
                default => 'ඒ විෂය ලියාපදිංචි කරපු සම්පත් දායකයන්:',
            };
        }
        $lines[] = chat_rp_detail($row, $lang);
    }
    if (!$lines) {
        return match ($lang) {
            'ta' => 'அந்தப் பாடத்துக்கு விரிவுரையாளர் கிடைக்கவில்லை.',
            'en' => 'No lecturer matched that subject.',
            default => 'ඒ විෂයට දේශකයෙක් හමු වුණේ නැහැ.',
        };
    }
    $head = match ($lang) {
        'ta' => $subject . ' பாட விரிவுரையாளர்கள்:',
        'en' => 'Lecturers for ' . $subject . ':',
        default => $subject . ' විෂයේ දේශකයන්:',
    };
    return $head . "\n" . implode("\n", $lines);
}

function chat_reply(?array $user, string $question, string $lang): string
{
    $text = chat_norm($question);
    $greet = chat_greeting($text);
    if ($greet !== '') {
        return $greet;
    }
    $talk = chat_answer_lang($text, $lang);
    $nid = '';
    if (preg_match('/(\d{9}[vx]|\d{12})/u', $text, $found) === 1) {
        $nid = strtoupper($found[1]);
    }
    if ($user === null && ($nid !== '' || chat_about_lecturer($text))) {
        return chat_login_needed($talk);
    }
    if ($user !== null && $nid !== '') {
        $who = chat_identity($user, $talk, $nid);
        return $who !== '' ? $who : (match ($talk) {
            'ta' => 'அந்த அடையாள எண்ணுக்கு விவரம் இல்லை.',
            'en' => 'Nothing matched that ID number.',
            default => 'ඒ හැඳුනුම්පත් අංකයට විස්තර හමු වුණේ නැහැ.',
        });
    }
    if ($user !== null && chat_about_lecturer($text)) {
        return chat_lecturers($talk, $text);
    }
    $quick = chat_quick($user, $text, $lang);
    if ($quick !== '') {
        return $quick;
    }
    if ($user === null) {
        return chat_public_reply($text, $lang);
    }
    $how = chat_has($text, ['help', 'how', 'guide', 'use', 'summary', 'උදව්', 'කොහොම', 'භාවිත', 'පාවිච්චි', 'සාරාංශ', 'எப்படி', 'உதவி']);
    $topic = 'default';
    if (chat_has($text, ['apply', 'අයදුම්', 'விண்ண'])) {
        $topic = 'apply';
    } elseif (chat_has($text, ['resource', 'සම්පත්', 'வள'])) {
        $topic = 'default';
    } elseif (chat_has($text, ['staff', 'සේවක', 'නිලධාරි ඇතුළත්', 'பணியாளர்'])) {
        $topic = 'staff';
    } elseif (chat_has($text, ['need', 'අවශ්‍යතා', 'தேவை'])) {
        $topic = 'needs';
    } elseif (chat_has($text, ['plan', 'සැලැස්ම', 'திட்டம்', 'දිනය 1', 'day 1'])) {
        $topic = 'plan';
    } elseif (chat_has($text, ['letter', 'ලිපි', 'கடித'])) {
        $topic = 'letter';
    }
    if ($how && chat_needle($text) === '') {
        return chat_guide($user, $lang, $topic) . "\n" . chat_live_note($lang);
    }
    if (chat_has($text, ['birthday', 'උපන්දින', 'பிறந்த'])) {
        return chat_birthdays($user, $lang);
    }
    if (chat_has($text, ['blacklist', 'අසාදු', 'asadu', 'தடை'])) {
        if ($user['role'] === 'User') {
            return match ($lang) {
                'ta' => 'தடைப் பட்டியல் உங்கள் பலகையில் இல்லை.',
                'en' => 'The blacklist is not on your dashboard.',
                default => 'අසාදු ලේඛනය ඔබේ පුවරුවේ නැහැ.',
            };
        }
        return chat_blacklist($user, $lang);
    }
    if (chat_has($text, ['how many', 'count', 'කීය', 'කී දෙන', 'ගණන', 'எத்தனை'])) {
        return chat_counts($user, $lang);
    }
    if (chat_has($text, ['scholarship', 'ශිෂ්‍යත්ව', 'உதவித்தொகை']) && !chat_has($text, ['programme', 'වැඩසටහන', 'resource', 'සම්පත්'])) {
        if ($user['role'] === 'User') {
            $open = chat_live($user, $text, $lang);
            return $open !== '' ? $open : match ($lang) {
                'ta' => 'உதவித்தொகை பெற்ற அதிகாரிகள் உங்கள் பலகையில் இல்லை. முகப்பில் உள்ள அறிவிப்பு மட்டும்.',
                'en' => 'Scholarship holders are not on your dashboard. I can only tell you the notices on the home page.',
                default => 'ශිෂ්‍යත්ව ගත් නිලධාරීන් ඔබේ පුවරුවේ නැහැ. මුල් පිටුවේ දැන්වීම් විතරයි.',
            };
        }
        $scholars = chat_scholars($user, $lang);
        $live = chat_live($user, $text, $lang);
        return $live === '' ? $scholars : $scholars . "\n" . $live;
    }
    $name = chat_lookup_text($text);
    if ($name !== '' && !$how) {
        $who = chat_identity($user, $lang, $name);
        if ($who !== '') {
            return $who;
        }
    }
    $live = chat_live($user, $text, $lang);
    if ($live !== '') {
        return $live;
    }
    if ($how) {
        return chat_guide($user, $lang, $topic) . "\n" . chat_live_note($lang);
    }
    return chat_guide($user, $lang, 'default') . "\n" . chat_live_note($lang);
}

function chat_live_note(string $lang): string
{
    return match ($lang) {
        'ta' => 'புதிய பதிவுகள் அடுத்த கேள்வியிலேயே தெரியும்.',
        'en' => 'New records are included the next time you ask.',
        default => 'අලුතින් එකතු කළ දේ ඊළඟ ප්‍රශ්නයේදීම මට පේනවා.',
    };
}

function chat_public_reply(string $text, string $lang): string
{
    if (chat_about_lecturer($text) || preg_match('/(\d{9}[vx]|\d{12})/u', $text) === 1 || chat_has($text, ['password', 'මුරපද', 'staff', 'සේවක', 'නිලධාරි', 'blacklist', 'අසාදු', 'account', 'ගිණුම', 'attendance', 'පැමිණීම', 'sampath dayak', 'සම්පත් දායක', 'அதிகாரி', 'பணியாளர்', 'வள ஆள்'])) {
        return match ($lang) {
            'ta' => 'உள்நுழையாமல் அதிகாரி, விண்ணப்பம், கணக்கு விவரங்களைச் சொல்ல முடியாது. முதலில் உள்நுழையுங்கள்.',
            'en' => 'Without signing in I cannot talk about officers, applications, or accounts. Please sign in.',
            default => 'ලොග් වෙන්නේ නැතුව නිලධාරීන්, අයදුම්, හෝ ගිණුම් ගැන කියන්න බැහැ. පළමුව පද්ධතියට ඇතුල් වෙන්න.',
        };
    }
    $found = chat_live(null, $text, $lang);
    if ($found !== '') {
        return $found;
    }
    return match ($lang) {
        'ta' => "உள்நுழையாமல்:\n1. முகப்பு: புகைப்படம், அறிவிப்பு, திறந்த பயிற்சி, உதவித்தொகை, வெளிப்புற படிப்பு.\n2. வள ஆளாகப் பதிவு: லියාපදිංචි වන්න.\n3. பதிவிறக்கங்கள்.\nஅதிகாரி விவரங்களுக்கு உள்நுழையுங்கள்.",
        'en' => "Without signing in:\n1. Home: photos, notices, open programmes, scholarships, and external courses.\n2. Register as a resource person.\n3. Downloads.\nSign in before asking about officers or applications.",
        default => "ලොග් වෙන්නේ නැතුව:\n1. මුල් පිටුව: ඡායාරූප, දැනුම්දීම්, අයදුම් කළ හැකි වැඩසටහන්, ශිෂ්‍යත්ව, බාහිර පාඨමාලා.\n2. සම්පත්දායකයෙක් ලෙස ලියාපදිංචි වන්න.\n3. බාගත කිරීම්.\nනිලධාරීන් හෝ අයදුම් ගැන අහන්න නම් පද්ධතියට ඇතුල් වෙන්න.",
    };
}

function chat_needle(string $text): string
{
    $stop = ['කොහොමද', 'උදව්', 'කවුද', 'ගැන', 'කියන්න', 'කරන්න', 'මොකක්ද', 'මොකද', 'the', 'who', 'is', 'how', 'what', 'please', 'help', 'about', 'tell', 'me', 'list', 'show'];
    foreach ($stop as $word) {
        $text = str_replace(chat_norm($word), ' ', $text);
    }
    $text = preg_replace('/[^\p{L}\p{M}\p{N}\s]/u', ' ', $text) ?? $text;
    $text = trim(preg_replace('/\s+/u', ' ', $text) ?? $text);
    if (function_exists('mb_strlen') ? mb_strlen($text) < 2 : strlen($text) < 2) {
        return '';
    }
    return $text;
}

function chat_topic_tables(string $text): array
{
    $map = [
        'cp_resourcepersons' => ['resource', 'සම්පත්', 'வள'],
        'cp_atp' => ['programme', 'program', 'වැඩසටහන', 'වැඩසටහන්', 'பயிற்சி'],
        'cp_messeges' => ['notice', 'දැනුම්', 'அறிவிப்பு'],
        'cp_downloads' => ['download', 'බාගත', 'பதிவிற'],
        'cp_foreignschols' => ['scholarship', 'ශිෂ්‍යත්ව', 'உதவித்தொகை'],
        'cp_outsidetrcource' => ['external', 'බාහිර', 'வெளிப்புற'],
        'cp_staff' => ['staff', 'සේවක', 'කාර්යමණ්ඩල', 'නිලධාරි', 'பணியாளர்', 'அதிகாரி'],
        'cp_trrequirements' => ['need', 'අවශ්‍යතා', 'தேவை'],
        'cp_trainingapplications' => ['application', 'අයදුම්පත', 'விண்ணப்ப'],
        'cp_trainingofficers' => ['training officer', 'පුහුණු නිලධාරි'],
        'cp_completedtrainings' => ['completed', 'නිම කළ', 'முடிந்த'],
        'offices' => ['office list', 'කාර්යාල ලැයිස්තු', 'அலுவலகப்'],
    ];
    $hit = [];
    foreach ($map as $table => $needles) {
        if (chat_has($text, $needles)) {
            $hit[] = $table;
        }
    }
    return $hit;
}

function chat_tables(?array $user): array
{
    $all = table_registry();
    unset($all['Sheet1'], $all['Sheet2'], $all['Sheet3'], $all['Sheet4'], $all['Summerized_on_Mgt_Level']);
    if ($user === null) {
        return array_intersect_key($all, array_flip(['cp_messeges', 'cp_downloads', 'cp_foreignschols', 'cp_outsidetrcource', 'cp_atp']));
    }
    if ($user['role'] === 'Administrator' || $user['role'] === 'Super User') {
        return $all;
    }
    if ($user['role'] === 'User') {
        return array_intersect_key($all, array_flip([
            'cp_staff', 'cp_resourcepersons', 'cp_trainingofficers', 'cp_trrequirements', 'cp_atp',
            'cp_trainingapplications', 'cp_trainingattendance', 'cp_messeges', 'cp_downloads',
            'cp_foreignschols', 'cp_outsidetrcource',
        ]));
    }
    return [];
}

function chat_office_column(string $table, array $meta): string
{
    if (!empty($meta['office'])) {
        return (string) $meta['office'];
    }
    if ($table === 'cp_trainingattendance') {
        return 'tratt_office';
    }
    return '';
}

function chat_table_title(string $table, array $meta, string $lang): string
{
    $si = [
        'cp_staff' => 'කාර්යමණ්ඩල ලේඛනය',
        'cp_resourcepersons' => 'සම්පත් දායකයින්',
        'cp_trainingofficers' => 'පුහුණු නිලධාරීන්',
        'cp_trrequirements' => 'පුහුණු අවශ්‍යතා',
        'cp_atp' => 'පුහුණු වැඩසටහන්',
        'cp_trainingapplications' => 'අයදුම්',
        'cp_trainingattendance' => 'පැමිණීම',
        'cp_messeges' => 'දැනුම්දීම්',
        'cp_downloads' => 'බාගත කිරීම්',
        'cp_foreignschols' => 'විදේශ ශිෂ්‍යත්ව',
        'cp_outsidetrcource' => 'බාහිර පාඨමාලා',
        'cp_foriegnscholars' => 'ශිෂ්‍යත්ව නිලධාරීන්',
        'cp_completedtrainings' => 'නිම කළ පුහුණු',
        'offices' => 'කාර්යාල',
        'cp_desigs' => 'තනතුරු',
        'cp_login' => 'පරිශීලක ගිණුම්',
    ];
    $ta = [
        'cp_staff' => 'பணியாளர்',
        'cp_resourcepersons' => 'வள ஆள்கள்',
        'cp_atp' => 'பயிற்சிகள்',
        'cp_messeges' => 'அறிவிப்புகள்',
        'cp_downloads' => 'பதிவிறக்கங்கள்',
    ];
    if ($lang === 'ta' && isset($ta[$table])) {
        return $ta[$table];
    }
    if ($lang === 'si' && isset($si[$table])) {
        return $si[$table];
    }
    if ($lang !== 'en' && isset($si[$table])) {
        return $si[$table];
    }
    return (string) ($meta['label'] ?? $table);
}

function chat_live(?array $user, string $text, string $lang): string
{
    $allowed = chat_tables($user);
    if (!$allowed) {
        return '';
    }
    $topics = array_values(array_filter(chat_topic_tables($text), static fn (string $table): bool => isset($allowed[$table])));
    $needle = str_replace(['%', '_'], '', chat_needle($text));
    if ($topics === [] && $needle === '') {
        return '';
    }
    if ($topics !== []) {
        $stripped = $needle;
        foreach (chat_topic_tables($text) as $topicTable) {
            foreach ([
                'resource', 'සම්පත්', 'வள', 'programme', 'program', 'වැඩසටහන', 'වැඩසටහන්', 'பயிற்சி',
                'notice', 'දැනුම්', 'அறிவிப்பு', 'download', 'බාගත', 'scholarship', 'ශිෂ්‍යත්ව',
                'external', 'බාහිර', 'staff', 'සේවක', 'නිලධාරි', 'need', 'අවශ්‍යතා', 'application', 'අයදුම්පත',
            ] as $word) {
                $stripped = trim(str_replace(chat_norm($word), ' ', chat_norm($stripped)));
            }
            unset($topicTable);
        }
        $needle = (function_exists('mb_strlen') ? mb_strlen($stripped) : strlen($stripped)) < 2 ? '' : $stripped;
    }
    $lines = [];
    $tables = $topics !== [] ? $topics : array_keys($allowed);
    $listTopic = $topics !== [] && $needle === '';
    foreach ($tables as $table) {
        if (count($lines) >= 12) {
            break;
        }
        if (!isset($allowed[$table])) {
            continue;
        }
        $rows = chat_find_rows($user, $table, $allowed[$table], $listTopic ? '' : $needle);
        if (!$rows) {
            continue;
        }
        $lines[] = chat_table_title($table, $allowed[$table], $lang) . ':';
        $publicKeep = [
            'cp_atp' => ['atp_trname', 'atp_day1', 'atp_location', 'atp_lastdateapply'],
            'cp_messeges' => ['msg_date', 'msg_message'],
            'cp_downloads' => ['dwn_name', 'dwn_des'],
            'cp_foreignschols' => ['fs_name', 'fs_country', 'fs_closingdate'],
            'cp_outsidetrcource' => ['ot_training', 'ot_institute', 'ot_closingdate'],
        ];
        foreach ($rows as $row) {
            if ($user === null && isset($publicKeep[$table])) {
                $row = array_intersect_key($row, array_flip($publicKeep[$table]));
            }
            $line = chat_row_line($row);
            if ($line !== '') {
                $lines[] = $line;
            }
            if (count($lines) >= 12) {
                break;
            }
        }
    }
    if (!$lines) {
        return '';
    }
    if ($user === null) {
        $lines[] = match ($lang) {
            'ta' => 'உள்நுழையாத பதில். திறந்த பொது விவரங்கள் மட்டும்.',
            'en' => 'This is a public answer. Sign in for office records.',
            default => 'මේක ලොග් නොවී දෙන පිළිතුරක්. පොදු දේ විතරයි.',
        };
    } elseif ($user['role'] === 'User') {
        $lines[] = chat_scope_note($user, $lang);
    }
    return implode("\n", $lines);
}

function chat_find_rows(?array $user, string $table, array $meta, string $needle): array
{
    if ($user !== null && $user['role'] === 'User' && $table === 'cp_foriegnscholars') {
        if ($user['office'] === '') {
            return [];
        }
        $like = '%' . $needle . '%';
        $filter = $needle === '' ? '' : ' AND (s.sch_name LIKE ? OR s.sch_country LIKE ? OR f.stf_Name LIKE ?)';
        $sql = 'SELECT s.sch_name, s.sch_country, f.stf_Name, f.stf_office FROM cp_foriegnscholars s INNER JOIN cp_staff f ON f.stf_Nid = s.sch_nid WHERE f.stf_office = ?' . $filter . ' ORDER BY s.sch_id DESC LIMIT 4';
        $types = 's';
        $params = [$user['office']];
        if ($needle !== '') {
            $types .= 'sss';
            $params = array_merge($params, [$like, $like, $like]);
        }
        return rows($sql, $types, $params);
    }
    $desc = describe_table($table);
    $textCols = [];
    foreach ($desc['columns'] as $column) {
        $name = (string) $column['Field'];
        if (chat_hidden_column($name)) {
            continue;
        }
        $type = strtolower((string) $column['Type']);
        if (str_contains($type, 'char') || str_contains($type, 'text')) {
            $textCols[] = $name;
        }
    }
    if ($needle !== '' && !$textCols) {
        return [];
    }
    $safe = '`' . str_replace('`', '', $table) . '`';
    $where = ' WHERE 1=1 ';
    $types = '';
    $params = [];
    $today = date('Y-m-d');
    if ($user !== null && $user['role'] === 'User') {
        $officeCol = chat_office_column($table, $meta);
        if ($officeCol !== '') {
            if ($user['office'] === '') {
                return [];
            }
            $where .= ' AND `' . str_replace('`', '', $officeCol) . '` = ? ';
            $types .= 's';
            $params[] = $user['office'];
        }
    }
    if ($table === 'cp_atp' && ($user === null || $needle === '')) {
        $where .= " AND TRIM(atp_trname) <> '' AND atp_lastdateapply >= ? AND atp_lastdateapply NOT LIKE '0000%' AND atp_lastdateapply NOT LIKE '1111%' ";
        $types .= 's';
        $params[] = $today;
    }
    if ($table === 'cp_foreignschols' && ($user === null || $needle === '')) {
        $where .= " AND fs_closingdate >= ? AND fs_closingdate NOT LIKE '0000%' AND fs_closingdate NOT LIKE '1111%' ";
        $types .= 's';
        $params[] = $today;
    }
    if ($table === 'cp_outsidetrcource' && ($user === null || $needle === '')) {
        $where .= " AND ot_closingdate >= ? AND ot_closingdate NOT LIKE '0000%' AND ot_closingdate NOT LIKE '1111%' ";
        $types .= 's';
        $params[] = $today;
    }
    if ($needle !== '') {
        $parts = [];
        $like = '%' . $needle . '%';
        foreach ($textCols as $col) {
            $parts[] = '`' . str_replace('`', '', $col) . '` LIKE ?';
            $types .= 's';
            $params[] = $like;
        }
        $where .= ' AND (' . implode(' OR ', $parts) . ')';
    }
    $order = $table === 'cp_atp' ? 'atp_lastdateapply ASC' : '`' . str_replace('`', '', (string) $desc['primary']) . '` DESC';
    $limit = $needle === '' ? 8 : 4;
    $sql = "SELECT * FROM $safe $where ORDER BY $order LIMIT $limit";
    return rows($sql, $types, $params);
}

function chat_row_line(array $row): string
{
    $parts = [];
    foreach ($row as $column => $value) {
        if (chat_hidden_column((string) $column)) {
            continue;
        }
        if (preg_match('/(_id|_ID)$/', (string) $column)) {
            continue;
        }
        $text = trim((string) $value);
        if ($text === '' || blank_date($text)) {
            continue;
        }
        $text = preg_replace('/\s+/u', ' ', $text) ?? $text;
        if (function_exists('mb_strlen') ? mb_strlen($text) > 90 : strlen($text) > 90) {
            $text = (function_exists('mb_substr') ? mb_substr($text, 0, 90) : substr($text, 0, 90)) . '…';
        }
        $parts[] = $text;
        if (count($parts) >= 4) {
            break;
        }
    }
    return implode(' — ', $parts);
}

function chat_lookup_text(string $text): string
{
    $stop = ['කොහොමද', 'උදව්', 'කවුද', 'සොයන්න', 'ගැන', 'නම', 'නිලධාරියා', 'නිලධාරි', 'කාර්යාලය', 'the', 'who', 'is', 'find', 'search', 'about', 'officer', 'please', 'මොකක්ද', 'මොකද', 'කියන්න', 'අයදුම්', 'සැලැස්ම', 'උපන්දින', 'ශිෂ්‍යත්ව', 'ඇස්තමේන්තු', 'අවශ්‍යතා', 'help', 'how'];
    foreach ($stop as $word) {
        $text = str_replace(chat_norm($word), ' ', $text);
    }
    $text = preg_replace('/[^\p{L}\p{M}\p{N}\s]/u', ' ', $text) ?? $text;
    $text = trim(preg_replace('/\s+/u', ' ', $text) ?? $text);
    if (function_exists('mb_strlen') ? mb_strlen($text) < 2 : strlen($text) < 2) {
        return '';
    }
    return $text;
}

function chat_people(array $user, string $lang, string $needle): string
{
    $like = '%' . str_replace(['%', '_'], '', $needle) . '%';
    [$officeSql, $officeType, $officeParams] = chat_office_sql($user, 'stf_office');
    $sql = 'SELECT stf_Name, stf_desig, stf_office, stf_mobile, stf_Nid FROM cp_staff WHERE (stf_Name LIKE ? OR stf_Nid LIKE ? OR stf_desig LIKE ?)' . $officeSql . ' ORDER BY stf_Name LIMIT 8';
    $rows = rows($sql, 'sss' . $officeType, array_merge([$like, $like, $like], $officeParams));
    if (!$rows) {
        $missing = match ($lang) {
            'ta' => 'அந்த அதிகாரி கிடைக்கவில்லை.',
            'en' => 'No officer matched that.',
            default => 'ඒ නිලධාරියා හමු වුණේ නැහැ.',
        };
        return $missing . "\n" . chat_scope_note($user, $lang);
    }
    $lines = [];
    foreach ($rows as $row) {
        $lines[] = trim($row['stf_Name'] . ' — ' . $row['stf_desig'] . ', ' . $row['stf_office'] . ', ' . $row['stf_mobile']);
    }
    $lines[] = chat_scope_note($user, $lang);
    return implode("\n", $lines);
}

function chat_birthdays(array $user, string $lang): string
{
    [$officeSql, $officeType, $officeParams] = chat_office_sql($user, 'stf_office');
    $rows = rows(
        "SELECT stf_Name, stf_desig, stf_office FROM cp_staff
         WHERE MONTH(stf_dob) = ? AND DAY(stf_dob) = ?
           AND stf_dob NOT LIKE '0000%'" . $officeSql . ' ORDER BY stf_Name LIMIT 12',
        'ii' . $officeType,
        array_merge([(int) date('n'), (int) date('j')], $officeParams)
    );
    $title = match ($lang) {
        'ta' => 'இன்று பிறந்தநாள்:',
        'en' => "Today's birthdays:",
        default => 'අද උපන්දින:',
    };
    if (!$rows) {
        $title = match ($lang) {
            'ta' => 'இன்று பிறந்தநாள் இல்லை.',
            'en' => 'No birthdays today.',
            default => 'අද උපන්දින නැහැ.',
        };
    }
    $lines = [$title];
    foreach ($rows as $row) {
        $lines[] = trim($row['stf_Name'] . ' — ' . $row['stf_desig'] . ', ' . $row['stf_office']);
    }
    $lines[] = chat_scope_note($user, $lang);
    return implode("\n", $lines);
}

function chat_programmes(string $lang): string
{
    $rows = rows(
        "SELECT atp_trname, atp_location, atp_day1, atp_lastdateapply FROM cp_atp
         WHERE TRIM(atp_trname) <> '' AND atp_lastdateapply >= CURDATE() AND atp_lastdateapply NOT LIKE '0000%'
         ORDER BY atp_day1 ASC LIMIT 8"
    );
    if (!$rows) {
        return match ($lang) {
            'ta' => 'இப்போது விண்ணப்பிக்கும் பயிற்சி இல்லை.',
            'en' => 'No programme is open for applications right now.',
            default => 'දැන් අයදුම් කළ හැකි වැඩසටහනක් නැහැ.',
        };
    }
    $lines = [match ($lang) {
        'ta' => 'விண்ணப்பிக்கக்கூடிய பயிற்சிகள்:',
        'en' => 'Programmes still open for applications:',
        default => 'අයදුම් කළ හැකි වැඩසටහන්:',
    }];
    foreach ($rows as $row) {
        $lines[] = trim($row['atp_trname'] . ' — ' . substr((string) $row['atp_day1'], 0, 10) . ', ' . $row['atp_location'] . ', ' . substr((string) $row['atp_lastdateapply'], 0, 10));
    }
    return implode("\n", $lines);
}

function chat_blacklist(array $user, string $lang): string
{
    $today = date('Y-m-d');
    $sql = 'SELECT b.bl_name AS stf_Name, s.stf_desig, s.stf_office, b.bl_from, b.bl_until
         FROM cp_blacklist b
         LEFT JOIN cp_staff s ON s.stf_Nid = b.bl_nid
         WHERE b.bl_until >= ?';
    $types = 's';
    $params = [$today];
    if ($user['role'] === 'User') {
        $sql .= ' AND s.stf_office = ?';
        $types .= 's';
        $params[] = $user['office'];
    }
    $rows = rows($sql . ' ORDER BY b.bl_from DESC LIMIT 8', $types, $params);
    $title = match ($lang) {
        'ta' => 'தடைப் பட்டியல்:',
        'en' => 'Blacklist:',
        default => 'අසාදු ලේඛනය:',
    };
    if (!$rows) {
        $title = match ($lang) {
            'ta' => 'தடைப் பட்டியல் காலியாக உள்ளது.',
            'en' => 'The blacklist is empty.',
            default => 'අසාදු ලේඛනය හිස්ය.',
        };
    }
    $lines = [$title];
    foreach ($rows as $row) {
        $lines[] = trim($row['stf_Name'] . ' — ' . $row['stf_desig'] . ', ' . $row['stf_office']);
    }
    $lines[] = chat_scope_note($user, $lang);
    return implode("\n", $lines);
}

function chat_counts(array $user, string $lang): string
{
    [$officeSql, $officeType, $officeParams] = chat_office_sql($user, 'stf_office');
    $staff = rows('SELECT COUNT(*) AS n FROM cp_staff WHERE 1=1' . $officeSql, $officeType, $officeParams);
    [$appSql, $appType, $appParams] = chat_office_sql($user, 'tapp_office');
    $apps = rows('SELECT COUNT(*) AS n FROM cp_trainingapplications WHERE 1=1' . $appSql, $appType, $appParams);
    $programmes = rows("SELECT COUNT(*) AS n FROM cp_atp WHERE TRIM(atp_trname) <> '' AND atp_lastdateapply >= CURDATE()");
    $staffN = (int) ($staff[0]['n'] ?? 0);
    $appN = (int) ($apps[0]['n'] ?? 0);
    $openN = (int) ($programmes[0]['n'] ?? 0);
    $body = match ($lang) {
        'ta' => "அதிகாரிகள்: {$staffN}\nவிண்ணப்பங்கள்: {$appN}\nவிண்ணப்பிக்கும் பயிற்சிகள்: {$openN}",
        'en' => "Officers: {$staffN}\nApplications: {$appN}\nProgrammes open for applications: {$openN}",
        default => "නිලධාරීන්: {$staffN}\nඅයදුම්: {$appN}\nඅයදුම් කළ හැකි වැඩසටහන්: {$openN}",
    };
    return $body . "\n" . chat_scope_note($user, $lang);
}

function chat_scholars(array $user, string $lang): string
{
    if ($user['role'] === 'User' && $user['office'] === '') {
        $rows = [];
    } elseif ($user['role'] === 'User') {
        $rows = rows(
            'SELECT s.sch_name, s.sch_country, f.stf_Name, f.stf_office
             FROM cp_foriegnscholars s
             INNER JOIN cp_staff f ON f.stf_Nid = s.sch_nid
             WHERE f.stf_office = ?
             ORDER BY s.sch_id DESC LIMIT 8',
            's',
            [$user['office']]
        );
    } else {
        $rows = rows(
            'SELECT s.sch_name, s.sch_country, f.stf_Name, f.stf_office
             FROM cp_foriegnscholars s
             LEFT JOIN cp_staff f ON f.stf_Nid = s.sch_nid
             ORDER BY s.sch_id DESC LIMIT 8'
        );
    }
    $title = match ($lang) {
        'ta' => 'உதவித்தொகை பெற்ற அதிகாரிகள்:',
        'en' => 'Scholarship holders:',
        default => 'විදේශ ශිෂ්‍යත්ව සඳහා සහභාගී වූ නිලධාරීන්:',
    };
    if (!$rows) {
        $title = match ($lang) {
            'ta' => 'உதவித்தொகை பதிவு இல்லை.',
            'en' => 'No scholarship records.',
            default => 'ශිෂ්‍යත්ව වාර්තා නැහැ.',
        };
    }
    $lines = [$title];
    foreach ($rows as $row) {
        $who = trim((string) ($row['stf_Name'] ?? ''));
        $office = trim((string) ($row['stf_office'] ?? ''));
        $lines[] = trim(($who !== '' ? $who . ' — ' : '') . $row['sch_name'] . ', ' . $row['sch_country'] . ($office !== '' ? ', ' . $office : ''));
    }
    $lines[] = chat_scope_note($user, $lang);
    return implode("\n", $lines);
}
