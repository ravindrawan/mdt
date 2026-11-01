<?php

require_once MDTU_ROOT . '/php/render.php';

function series_of(array $magazine): array
{
    $rows = db_all('SELECT id, year, month FROM magazines');
    return issue_series($rows)[(int) $magazine['id']] ?? ['volume' => 1, 'number' => 1];
}

function articles_for_magazine($id): array
{
    return db_all(
        'SELECT a.*, c.slug AS category_slug, p.participants
         FROM articles a
         JOIN categories c ON c.id = a.category_id
         LEFT JOIN programs p ON p.article_id = a.id
         WHERE a.magazine_id = ?',
        [$id]
    );
}

function magazine_card(array $magazine, array $articles): array
{
    $series = series_of($magazine);
    return [
        'id' => (int) $magazine['id'],
        'slug' => $magazine['slug'],
        'month' => (int) $magazine['month'],
        'year' => (int) $magazine['year'],
        'volume' => $series['volume'],
        'number' => $series['number'],
        'title_en' => $magazine['title_en'],
        'title_si' => $magazine['title_si'],
        'summary_en' => $magazine['summary_en'],
        'summary_si' => $magazine['summary_si'],
        'highlights' => parse_json($magazine['highlights_json'], []),
        'cover_path' => $magazine['cover_path'],
        'status' => $magazine['status'],
        'label_en' => month_name($magazine['month'], 'en') . ' ' . $magazine['year'],
        'label_si' => month_name($magazine['month'], 'si') . ' ' . $magazine['year'],
        'stats' => issue_stats($articles),
    ];
}

function hydrate_article(?array $article): ?array
{
    if (!$article) return null;
    $program = db_get('SELECT * FROM programs WHERE article_id = ?', [$article['id']]);
    $media = db_all('SELECT id, path, mime, caption_en, caption_si, created_at FROM media WHERE article_id = ? ORDER BY id', [$article['id']]);
    $category = db_get('SELECT slug, name_en, name_si FROM categories WHERE id = ?', [$article['category_id']]);
    $article['category_slug'] = $category['slug'] ?? '';
    $article['category_en'] = $category['name_en'] ?? '';
    $article['category_si'] = $category['name_si'] ?? '';
    $article['program'] = $program ? $program + ['metrics' => parse_json($program['metrics_json'], [])] : null;
    $article['media'] = $media;
    return $article;
}

function read_article_input(array $body): array
{
    $titleEn = clean($body['title_en'] ?? '', 220);
    $titleSi = clean($body['title_si'] ?? '', 220);
    $bodyEn = clean($body['body_en'] ?? '', 8000);
    $bodySi = clean($body['body_si'] ?? '', 8000);
    if (strlen($titleEn) < 3 || (function_exists('mb_strlen') ? mb_strlen($titleSi) : strlen($titleSi)) < 2) {
        fail(400, 'Titles are required in both English and Sinhala.');
    }
    if (strlen($bodyEn) < 10 || (function_exists('mb_strlen') ? mb_strlen($bodySi) : strlen($bodySi)) < 5) {
        fail(400, 'Write the piece in both English and Sinhala.');
    }
    $month = (int) ($body['target_month'] ?? 0);
    $year = (int) ($body['target_year'] ?? 0);
    if ($month < 1 || $month > 12 || $year < 2024 || $year > 2100) fail(400, 'Choose the issue month and year.');
    $category = db_get('SELECT * FROM categories WHERE id = ? OR slug = ?', [(int) ($body['category_id'] ?? 0), clean($body['category'] ?? '', 40)]);
    if (!$category) fail(400, 'Choose a contribution stream.');
    $participants = ($body['participants'] ?? '') === '' || ($body['participants'] ?? null) === null
        ? null
        : max(0, (int) $body['participants']);
    return [
        'category' => $category,
        'title_en' => $titleEn,
        'title_si' => $titleSi,
        'body_en' => $bodyEn,
        'body_si' => $bodySi,
        'excerpt_en' => clean($body['excerpt_en'] ?? '', 300),
        'excerpt_si' => clean($body['excerpt_si'] ?? '', 300),
        'byline_en' => clean($body['byline_en'] ?? '', 160),
        'byline_si' => clean($body['byline_si'] ?? '', 160),
        'target_month' => $month,
        'target_year' => $year,
        'program' => [
            'start_date' => clean($body['start_date'] ?? '', 10) ?: null,
            'end_date' => clean($body['end_date'] ?? '', 10) ?: null,
            'target_group_en' => clean($body['target_group_en'] ?? '', 220),
            'target_group_si' => clean($body['target_group_si'] ?? '', 220),
            'venue_en' => clean($body['venue_en'] ?? '', 220),
            'venue_si' => clean($body['venue_si'] ?? '', 220),
            'participants' => $participants,
            'outcomes_en' => clean($body['outcomes_en'] ?? '', 2000),
            'outcomes_si' => clean($body['outcomes_si'] ?? '', 2000),
            'metrics' => [
                'sessions' => (int) ($body['sessions'] ?? 0),
                'hours' => (int) ($body['hours'] ?? 0),
                'satisfaction' => (int) ($body['satisfaction'] ?? 0),
            ],
        ],
    ];
}

function save_program($articleId, array $program): void
{
    $existing = db_get('SELECT id FROM programs WHERE article_id = ?', [$articleId]);
    $params = [
        $program['start_date'], $program['end_date'], $program['target_group_en'], $program['target_group_si'],
        $program['venue_en'], $program['venue_si'], $program['participants'], $program['outcomes_en'],
        $program['outcomes_si'], json_encode($program['metrics'] ?? []),
    ];
    if ($existing) {
        db_run(
            'UPDATE programs SET start_date=?, end_date=?, target_group_en=?, target_group_si=?, venue_en=?, venue_si=?, participants=?, outcomes_en=?, outcomes_si=?, metrics_json=? WHERE article_id=?',
            array_merge($params, [$articleId])
        );
    } else {
        db_run(
            'INSERT INTO programs (article_id, start_date, end_date, target_group_en, target_group_si, venue_en, venue_si, participants, outcomes_en, outcomes_si, metrics_json) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
            array_merge([$articleId], $params)
        );
    }
}

function save_upload(string $field = 'file'): ?array
{
    if (empty($_FILES[$field]) || ($_FILES[$field]['error'] ?? UPLOAD_ERR_NO_FILE) === UPLOAD_ERR_NO_FILE) {
        return null;
    }
    $file = $_FILES[$field];
    if (($file['error'] ?? 0) !== UPLOAD_ERR_OK) fail(400, 'Upload failed.');
    if (($file['size'] ?? 0) > 8 * 1024 * 1024) fail(400, 'Upload failed.');
    $mime = mime_content_type($file['tmp_name']) ?: '';
    $map = ['image/jpeg' => '.jpg', 'image/png' => '.png', 'image/webp' => '.webp', 'image/gif' => '.gif'];
    if (!isset($map[$mime])) fail(400, 'Only JPG, PNG, WEBP or GIF images are accepted.');
    $name = (string) round(microtime(true) * 1000) . '-' . bin2hex(random_bytes(4)) . $map[$mime];
    $dir = MDTU_PUBLIC . '/uploads';
    if (!is_dir($dir) && !mkdir($dir, 0755, true)) fail(400, 'Upload failed.');
    if (!move_uploaded_file($file['tmp_name'], $dir . DIRECTORY_SEPARATOR . $name)) fail(400, 'Upload failed.');
    return ['filename' => $name, 'path' => '/uploads/' . $name, 'mime' => $mime];
}

function username_of($value): string
{
    return strtolower(clean($value, 32));
}

function valid_username(string $value): bool
{
    return (bool) preg_match('/^[a-z0-9][a-z0-9._-]{2,31}$/', $value);
}

function lang_query(): string
{
    $lang = $_GET['lang'] ?? 'en';
    return $lang === 'si' || $lang === 'ta' ? $lang : 'en';
}

function pdf_fallback(string $slug, string $lang, bool $auto): void
{
    $suffix = $auto ? '&autoprint=1' : '';
    json_out([
        'error' => 'This host opens the print view so the browser can save the PDF.',
        'fallback' => "/mdtu-magazine/{$slug}/print?lang={$lang}{$suffix}",
    ], 503);
}

function mdtu_api(string $method, string $path): void
{
    $params = [];
    $is = function (string $verb, string $pattern) use ($method, $path, &$params): bool {
        if ($method !== $verb) return false;
        $regex = '#^' . preg_replace('#:([A-Za-z_]+)#', '(?P<$1>[^/]+)', $pattern) . '$#';
        if (!preg_match($regex, $path, $found)) return false;
        $params = [];
        foreach ($found as $key => $value) {
            if (is_string($key)) $params[$key] = $value;
        }
        return true;
    };

if ($is('GET', '/mdtu-magazine/') || $is('GET', '/mdtu-magazine')) {
            // මුල් පිටුවට අදාළ හෝ සඟරා ලැයිස්තුව පෙන්වන කේතය (හෝ journal.html වෙත යොමු කිරීම)
            header('Content-Type: text/html; charset=utf-8');
            readfile(MDTU_PUBLIC . '/journal.html');
            exit;
        }




    
    $body = request_body();
    try {
        if ($is('GET', '/api/health')) json_out(['ok' => true, 'service' => 'retreat']);

        if ($is('GET', '/api/public/home')) {
            $magazines = db_all("SELECT * FROM magazines WHERE status = 'published' ORDER BY year DESC, month DESC");
            $cards = array_map(fn($magazine) => magazine_card($magazine, articles_for_magazine($magazine['id'])), $magazines);
            json_out(['featured' => $cards[0] ?? null, 'archive' => array_slice($cards, 1)]);
        }

        if ($is('GET', '/api/public/magazines/:slug')) {
            $magazine = db_get("SELECT * FROM magazines WHERE slug = ? AND status = 'published'", [$params['slug']]);
            if (!$magazine) json_out(['error' => 'That issue is not published.'], 404);
            json_out(magazine_card($magazine, articles_for_magazine($magazine['id'])));
        }

        if ($is('GET', '/api/public/magazines/:slug/pages')) {
            $bundle = load_bundle($params['slug']);
            if (!$bundle || $bundle['magazine']['status'] !== 'published') json_out(['error' => 'That issue is not published.'], 404);
            $lang = lang_query();
            json_out([
                'slug' => $bundle['magazine']['slug'],
                'lang' => $lang,
                'title_en' => $bundle['magazine']['title_en'],
                'title_si' => $bundle['magazine']['title_si'],
                'pages' => render_pages($bundle, $lang),
            ]);
        }

        if ($is('GET', '/mdtu-magazine/:slug/print')) {
            $bundle = load_bundle($params['slug']);
            if (!$bundle) {
                http_response_code(404);
                header('Content-Type: text/plain; charset=utf-8');
                echo 'Issue not found';
                exit;
            }
            $admin = (($_SESSION['user']['role'] ?? '') === 'admin');
            if ($bundle['magazine']['status'] !== 'published' && !$admin) {
                http_response_code(404);
                header('Content-Type: text/plain; charset=utf-8');
                echo 'Issue not found';
                exit;
            }
            header('Content-Type: text/html; charset=utf-8');
            echo render_issue_document($bundle, lang_query(), ['autoprint' => ($_GET['autoprint'] ?? '') === '1']);
            exit;
        }

        if ($is('GET', '/api/public/magazines/:slug/pdf')) {
            $magazine = db_get("SELECT * FROM magazines WHERE slug = ? AND status = 'published'", [$params['slug']]);
            if (!$magazine) json_out(['error' => 'That issue is not published.'], 404);
            pdf_fallback($magazine['slug'], lang_query(), true);
        }

        if ($is('POST', '/api/auth/login')) {
            if (login_blocked()) json_out(['error' => 'Too many sign-in attempts. Wait a few minutes.'], 429);
            $loginName = strtolower(clean($body['email'] ?? '', 190));
            $password = (string) ($body['password'] ?? '');
            $user = db_get('SELECT * FROM users WHERE username = ? OR email = ?', [$loginName, $loginName]);
            if (!$user || !password_verify($password, $user['password_hash'])) {
                login_failed();
                json_out(['error' => 'Username or password is incorrect.'], 401);
            }
            if (!(int) $user['active']) json_out(['error' => 'This account has been deactivated.'], 403);
            login_clear();
            session_regenerate_id(true);
            $_SESSION['user'] = ['id' => (int) $user['id'], 'role' => $user['role'], 'email' => $user['email']];
            audit($user['id'], 'login', 'user', $user['id'], $loginName);
            json_out(['user' => public_user($user)]);
        }

        if ($is('POST', '/api/auth/logout')) {
            $_SESSION = [];
            if (ini_get('session.use_cookies')) {
                $cookie = session_get_cookie_params();
                setcookie(session_name(), '', time() - 42000, $cookie['path'] ?? '/');
            }
            session_destroy();
            json_out(['ok' => true]);
        }

        if ($is('GET', '/api/auth/me')) json_out(['user' => public_user(require_auth())]);

        if ($is('PUT', '/api/auth/profile')) {
            $user = require_auth();
            $nameEn = clean($body['full_name_en'] ?? '', 160);
            $nameSi = clean($body['full_name_si'] ?? '', 160);
            if (strlen($nameEn) < 3 || (function_exists('mb_strlen') ? mb_strlen($nameSi) : strlen($nameSi)) < 2) {
                json_out(['error' => 'Give your name in both languages.'], 400);
            }
            db_run(
                'UPDATE users SET full_name_en=?, full_name_si=?, designation_en=?, designation_si=?, phone=?, updated_at=? WHERE id=?',
                [$nameEn, $nameSi, clean($body['designation_en'] ?? '', 160), clean($body['designation_si'] ?? '', 160), clean($body['phone'] ?? '', 40), now_iso(), $user['id']]
            );
            json_out(['user' => public_user(db_get('SELECT * FROM users WHERE id = ?', [$user['id']]))]);
        }

        if ($is('PUT', '/api/auth/password')) {
            $user = require_auth();
            $next = (string) ($body['password'] ?? '');
            $current = (string) ($body['current_password'] ?? '');
            if (!password_verify($current, $user['password_hash'])) json_out(['error' => 'Current password is incorrect.'], 400);
            if (strlen($next) < 8) json_out(['error' => 'Use at least 8 characters.'], 400);
            db_run('UPDATE users SET password_hash=?, updated_at=? WHERE id=?', [password_hash($next, PASSWORD_BCRYPT), now_iso(), $user['id']]);
            audit($user['id'], 'password', 'user', $user['id'], 'self');
            json_out(['ok' => true]);
        }

        if ($is('GET', '/api/categories')) {
            $user = require_auth();
            $rows = db_all('SELECT * FROM categories ORDER BY sort_order');
            if ($user['role'] !== 'admin') {
                $rows = array_values(array_filter($rows, fn($row) => $row['slug'] !== 'editorial'));
            }
            json_out(['categories' => $rows]);
        }

        if ($is('GET', '/api/articles')) {
            $user = require_auth();
            $own = $user['role'] !== 'admin' || ($_GET['mine'] ?? '') === '1';
            $rows = $own
                ? db_all('SELECT * FROM articles WHERE user_id = ? ORDER BY updated_at DESC', [$user['id']])
                : db_all('SELECT * FROM articles ORDER BY updated_at DESC');
            json_out(['articles' => array_map('hydrate_article', $rows)]);
        }

        if ($is('POST', '/api/articles')) {
            $user = require_auth();
            if (($body['category'] ?? '') === 'editorial' && $user['role'] !== 'admin') {
                json_out(['error' => 'Leadership messages are filed by the editor.'], 403);
            }
            $input = read_article_input($body);
            $now = now_iso();
            $result = db_run(
                "INSERT INTO articles (user_id, category_id, magazine_id, title_en, title_si, body_en, body_si, excerpt_en, excerpt_si, byline_en, byline_si, status, featured, page_number, sort_order, target_month, target_year, reviewer_notes, submitted_at, reviewed_at, created_at, updated_at) VALUES (?, ?, NULL, ?, ?, ?, ?, ?, ?, ?, ?, 'draft', 0, NULL, 0, ?, ?, '', NULL, NULL, ?, ?)",
                [$user['id'], $input['category']['id'], $input['title_en'], $input['title_si'], $input['body_en'], $input['body_si'], $input['excerpt_en'], $input['excerpt_si'], $input['byline_en'], $input['byline_si'], $input['target_month'], $input['target_year'], $now, $now]
            );
            save_program($result['id'], $input['program']);
            audit($user['id'], 'create', 'article', $result['id'], $input['title_en']);
            json_out(['article' => hydrate_article(db_get('SELECT * FROM articles WHERE id = ?', [$result['id']]))], 201);
        }

        if ($is('PUT', '/api/articles/:id')) {
            $user = require_auth();
            $article = db_get('SELECT * FROM articles WHERE id = ?', [$params['id']]);
            if (!$article) json_out(['error' => 'Piece not found.'], 404);
            $admin = $user['role'] === 'admin';
            if (!$admin && (int) $article['user_id'] !== (int) $user['id']) json_out(['error' => 'You can edit only your own drafts.'], 403);
            if (!$admin && !in_array($article['status'], ['draft', 'rejected'], true)) json_out(['error' => 'This piece is already with the editor.'], 409);
            if ($article['status'] === 'published' && !$admin) json_out(['error' => 'Published pieces stay with the issue.'], 409);
            $input = read_article_input($body);
            db_run(
                'UPDATE articles SET category_id=?, title_en=?, title_si=?, body_en=?, body_si=?, excerpt_en=?, excerpt_si=?, byline_en=?, byline_si=?, target_month=?, target_year=?, updated_at=? WHERE id=?',
                [$input['category']['id'], $input['title_en'], $input['title_si'], $input['body_en'], $input['body_si'], $input['excerpt_en'], $input['excerpt_si'], $input['byline_en'], $input['byline_si'], $input['target_month'], $input['target_year'], now_iso(), $article['id']]
            );
            save_program($article['id'], $input['program']);
            json_out(['article' => hydrate_article(db_get('SELECT * FROM articles WHERE id = ?', [$article['id']]))]);
        }

        if ($is('POST', '/api/articles/:id/submit')) {
            $user = require_auth();
            $article = db_get('SELECT * FROM articles WHERE id = ?', [$params['id']]);
            if (!$article || ((int) $article['user_id'] !== (int) $user['id'] && $user['role'] !== 'admin')) json_out(['error' => 'Piece not found.'], 404);
            if (!in_array($article['status'], ['draft', 'rejected'], true)) json_out(['error' => 'Only a draft or a returned piece can be submitted.'], 409);
            $now = now_iso();
            db_run("UPDATE articles SET status='submitted', reviewer_notes='', submitted_at=?, updated_at=? WHERE id=?", [$now, $now, $article['id']]);
            audit($user['id'], 'submit', 'article', $article['id'], $article['title_en']);
            json_out(['article' => hydrate_article(db_get('SELECT * FROM articles WHERE id = ?', [$article['id']]))]);
        }

        if ($is('POST', '/api/articles/:id/publish')) {
            $user = require_admin();
            $article = db_get('SELECT * FROM articles WHERE id = ?', [$params['id']]);
            if (!$article) json_out(['error' => 'Piece not found.'], 404);
            $category = db_get('SELECT slug FROM categories WHERE id = ?', [$article['category_id']]);
            $magazine = db_get('SELECT * FROM magazines WHERE year = ? AND month = ?', [$article['target_year'], $article['target_month']]);
            $now = now_iso();
            if (!$magazine) {
                db_run("UPDATE articles SET status='approved', updated_at=? WHERE id=?", [$now, $article['id']]);
                audit($user['id'], 'approve', 'article', $article['id'], $article['title_en']);
                json_out(['article' => hydrate_article(db_get('SELECT * FROM articles WHERE id = ?', [$article['id']])), 'placed' => false]);
            }
            $live = $magazine['status'] === 'published' ? 'published' : 'approved';
            if ($category && $category['slug'] === 'editorial') {
                $others = db_all(
                    "SELECT a.id, a.page_number FROM articles a JOIN categories c ON c.id = a.category_id WHERE a.magazine_id = ? AND c.slug = 'editorial' AND a.id != ? ORDER BY a.page_number, a.sort_order",
                    [$magazine['id'], $article['id']]
                );
                $room = page_size('editorial');
                $page = 2;
                $sort = 0;
                $onTwo = array_values(array_filter($others, fn($row) => (int) $row['page_number'] === 2));
                if (count($onTwo) < $room) {
                    db_run('UPDATE articles SET sort_order = sort_order + 1, updated_at = ? WHERE magazine_id = ? AND page_number = 2 AND id != ?', [$now, $magazine['id'], $article['id']]);
                } else {
                    $lastPage = 2;
                    foreach ($others as $row) $lastPage = max($lastPage, (int) ($row['page_number'] ?? 2));
                    $onLast = array_values(array_filter($others, fn($row) => (int) $row['page_number'] === $lastPage));
                    if (count($onLast) < $room) {
                        $page = $lastPage;
                        $sort = count($onLast);
                    } else {
                        $maxPage = (int) db_get('SELECT COALESCE(MAX(page_number), 1) AS n FROM articles WHERE magazine_id = ?', [$magazine['id']])['n'];
                        $page = max(2, $maxPage + 1);
                    }
                }
                db_run('UPDATE articles SET magazine_id=?, page_number=?, sort_order=?, status=?, updated_at=? WHERE id=?', [$magazine['id'], $page, $sort, $live, $now, $article['id']]);
            } else {
                db_run("UPDATE articles SET status='approved', updated_at=? WHERE id=?", [$now, $article['id']]);
            }
            audit($user['id'], 'publish-piece', 'article', $article['id'], $article['title_en']);
            json_out([
                'article' => hydrate_article(db_get('SELECT * FROM articles WHERE id = ?', [$article['id']])),
                'placed' => (bool) ($category && $category['slug'] === 'editorial'),
                'issue' => $magazine['slug'],
            ]);
        }

        if ($is('POST', '/api/articles/:id/media')) {
            $user = require_auth();
            $file = save_upload('file');
            $article = db_get('SELECT * FROM articles WHERE id = ?', [$params['id']]);
            if (!$article) json_out(['error' => 'Piece not found.'], 404);
            if ((int) $article['user_id'] !== (int) $user['id'] && $user['role'] !== 'admin') json_out(['error' => 'Not your piece.'], 403);
            if (!$file) json_out(['error' => 'Choose an image.'], 400);
            $result = db_run(
                'INSERT INTO media (article_id, magazine_id, user_id, filename, path, mime, caption_en, caption_si, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
                [$article['id'], $article['magazine_id'], $user['id'], $file['filename'], $file['path'], $file['mime'], clean($body['caption_en'] ?? '', 255), clean($body['caption_si'] ?? '', 255), now_iso()]
            );
            json_out(['media' => db_get('SELECT * FROM media WHERE id = ?', [$result['id']])], 201);
        }

        if ($is('DELETE', '/api/media/:id')) {
            $user = require_auth();
            $media = db_get('SELECT * FROM media WHERE id = ?', [$params['id']]);
            if (!$media) json_out(['error' => 'Image not found.'], 404);
            $article = $media['article_id'] ? db_get('SELECT * FROM articles WHERE id = ?', [$media['article_id']]) : null;
            $owns = $article && (int) $article['user_id'] === (int) $user['id'];
            if (!$owns && $user['role'] !== 'admin') json_out(['error' => 'Not your image.'], 403);
            if ($article && $user['role'] !== 'admin' && !in_array($article['status'], ['draft', 'rejected'], true)) {
                json_out(['error' => 'Images on a submitted piece stay until the editor returns it.'], 409);
            }
            if (str_starts_with($media['path'], '/uploads/')) {
                $full = MDTU_PUBLIC . $media['path'];
                if (is_file($full)) @unlink($full);
            }
            db_run('DELETE FROM media WHERE id = ?', [$media['id']]);
            json_out(['ok' => true]);
        }

        if ($is('GET', '/api/admin/stats')) {
            require_admin();
            $count = fn($sql) => (int) db_get($sql)['n'];
            json_out([
                'users' => $count('SELECT COUNT(*) AS n FROM users'),
                'active_users' => $count('SELECT COUNT(*) AS n FROM users WHERE active = 1'),
                'pending' => $count("SELECT COUNT(*) AS n FROM articles WHERE status = 'submitted'"),
                'drafts' => $count("SELECT COUNT(*) AS n FROM articles WHERE status = 'draft'"),
                'published_issues' => $count("SELECT COUNT(*) AS n FROM magazines WHERE status = 'published'"),
                'draft_issues' => $count("SELECT COUNT(*) AS n FROM magazines WHERE status = 'draft'"),
                'audit' => db_all('SELECT a.*, u.full_name_en FROM audit_log a LEFT JOIN users u ON u.id = a.user_id ORDER BY a.id DESC LIMIT 8'),
            ]);
        }

        if ($is('GET', '/api/admin/users')) {
            require_admin();
            $page = max(1, (int) ($_GET['page'] ?? 1));
            $size = 8;
            $q = '%' . clean($_GET['q'] ?? '', 80) . '%';
            $filters = ['(full_name_en LIKE ? OR full_name_si LIKE ? OR email LIKE ? OR username LIKE ?)'];
            $sqlParams = [$q, $q, $q, $q];
            $role = clean($_GET['role'] ?? '', 20);
            if ($role === 'admin' || $role === 'contributor') {
                $filters[] = 'role = ?';
                $sqlParams[] = $role;
            }
            if (($_GET['active'] ?? '') === '0' || ($_GET['active'] ?? '') === '1') {
                $filters[] = 'active = ?';
                $sqlParams[] = (int) $_GET['active'];
            }
            $where = 'WHERE ' . implode(' AND ', $filters);
            $total = (int) db_get("SELECT COUNT(*) AS n FROM users {$where}", $sqlParams)['n'];
            $users = array_map('public_user', db_all(
                "SELECT * FROM users {$where} ORDER BY active DESC, full_name_en LIMIT ? OFFSET ?",
                array_merge($sqlParams, [$size, ($page - 1) * $size])
            ));
            json_out(['users' => $users, 'page' => $page, 'pages' => max(1, (int) ceil($total / $size)), 'total' => $total]);
        }

        if ($is('POST', '/api/admin/users')) {
            $actor = require_admin();
            $username = username_of($body['username'] ?? '');
            $email = strtolower(clean($body['email'] ?? '', 190));
            $nameEn = clean($body['full_name_en'] ?? '', 160);
            $nameSi = clean($body['full_name_si'] ?? '', 160);
            $role = ($body['role'] ?? '') === 'admin' ? 'admin' : 'contributor';
            if (!valid_username($username)) json_out(['error' => 'Username must be 3–32 letters or numbers.'], 400);
            if (!preg_match('/^[^\s@]+@[^\s@]+\.[^\s@]+$/', $email)) json_out(['error' => 'Enter a valid email.'], 400);
            if (strlen($nameEn) < 3 || (function_exists('mb_strlen') ? mb_strlen($nameSi) : strlen($nameSi)) < 2) json_out(['error' => 'Name is required in both languages.'], 400);
            if (db_get('SELECT id FROM users WHERE username = ?', [$username])) json_out(['error' => 'That username is already in use.'], 409);
            if (db_get('SELECT id FROM users WHERE email = ?', [$email])) json_out(['error' => 'That email is already in use.'], 409);
            $temporary = clean($body['password'] ?? '', 80) ?: ('Rt' . bin2hex(random_bytes(4)) . '#1');
            if (strlen($temporary) < 8) json_out(['error' => 'Password must be at least 8 characters.'], 400);
            $now = now_iso();
            $result = db_run(
                "INSERT INTO users (username, email, password_hash, full_name_en, full_name_si, role, designation_en, designation_si, phone, avatar_path, active, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, '', 1, ?, ?)",
                [$username, $email, password_hash($temporary, PASSWORD_BCRYPT), $nameEn, $nameSi, $role, clean($body['designation_en'] ?? '', 160), clean($body['designation_si'] ?? '', 160), clean($body['phone'] ?? '', 40), $now, $now]
            );
            audit($actor['id'], 'create', 'user', $result['id'], $username);
            json_out(['user' => public_user(db_get('SELECT * FROM users WHERE id = ?', [$result['id']])), 'temporary_password' => $temporary], 201);
        }

        if ($is('PUT', '/api/admin/users/:id')) {
            $actor = require_admin();
            $user = db_get('SELECT * FROM users WHERE id = ?', [$params['id']]);
            if (!$user) json_out(['error' => 'Account not found.'], 404);
            if ((int) $user['id'] === (int) $actor['id'] && ($body['active'] ?? null) === false) json_out(['error' => 'You cannot deactivate your own account.'], 400);
            if ((int) $user['id'] === (int) $actor['id'] && isset($body['role']) && $body['role'] !== 'admin') json_out(['error' => 'You cannot remove your own admin role.'], 400);
            $role = in_array($body['role'] ?? '', ['admin', 'contributor'], true) ? $body['role'] : $user['role'];
            $active = (($body['active'] ?? null) === false || ($body['active'] ?? null) === 0) ? 0 : 1;
            $username = username_of($body['username'] ?? '') ?: $user['username'];
            if (!valid_username($username)) json_out(['error' => 'Username must be 3–32 letters or numbers.'], 400);
            if (db_get('SELECT id FROM users WHERE username = ? AND id <> ?', [$username, $user['id']])) json_out(['error' => 'That username is already in use.'], 409);
            db_run(
                'UPDATE users SET username=?, full_name_en=?, full_name_si=?, role=?, designation_en=?, designation_si=?, phone=?, active=?, updated_at=? WHERE id=?',
                [$username, clean($body['full_name_en'] ?? '', 160) ?: $user['full_name_en'], clean($body['full_name_si'] ?? '', 160) ?: $user['full_name_si'], $role, clean($body['designation_en'] ?? '', 160), clean($body['designation_si'] ?? '', 160), clean($body['phone'] ?? '', 40), $active, now_iso(), $user['id']]
            );
            audit($actor['id'], $active ? 'update' : 'deactivate', 'user', $user['id'], $user['email']);
            json_out(['user' => public_user(db_get('SELECT * FROM users WHERE id = ?', [$user['id']]))]);
        }

        if ($is('POST', '/api/admin/users/:id/reset-password')) {
            $actor = require_admin();
            $user = db_get('SELECT * FROM users WHERE id = ?', [$params['id']]);
            if (!$user) json_out(['error' => 'Account not found.'], 404);
            $temporary = 'Rt' . bin2hex(random_bytes(4)) . '#1';
            db_run('UPDATE users SET password_hash=?, updated_at=? WHERE id=?', [password_hash($temporary, PASSWORD_BCRYPT), now_iso(), $user['id']]);
            audit($actor['id'], 'reset-password', 'user', $user['id'], $user['email']);
            json_out(['temporary_password' => $temporary]);
        }

        if ($is('DELETE', '/api/admin/users/:id')) {
            $actor = require_admin();
            $user = db_get('SELECT * FROM users WHERE id = ?', [$params['id']]);
            if (!$user) json_out(['error' => 'Account not found.'], 404);
            if ((int) $user['id'] === (int) $actor['id']) json_out(['error' => 'You cannot delete your own account.'], 400);
            $writings = (int) db_get('SELECT COUNT(*) AS n FROM articles WHERE user_id = ?', [$user['id']])['n'];
            if ($writings) json_out(['error' => 'This account has submissions. Deactivate it instead of deleting it.'], 409);
            db_run('DELETE FROM users WHERE id = ?', [$user['id']]);
            audit($actor['id'], 'delete', 'user', $user['id'], $user['email']);
            json_out(['ok' => true]);
        }

        if ($is('GET', '/api/admin/articles')) {
            require_admin();
            $status = clean($_GET['status'] ?? '', 20);
            $category = clean($_GET['category'] ?? '', 40);
            $q = '%' . clean($_GET['q'] ?? '', 80) . '%';
            $filters = ['(a.title_en LIKE ? OR a.title_si LIKE ?)'];
            $sqlParams = [$q, $q];
            if (in_array($status, ['draft', 'submitted', 'approved', 'rejected', 'published'], true)) {
                $filters[] = 'a.status = ?';
                $sqlParams[] = $status;
            }
            if ($category) {
                $filters[] = 'c.slug = ?';
                $sqlParams[] = $category;
            }
            $where = 'WHERE ' . implode(' AND ', $filters);
            $rows = db_all(
                "SELECT a.* FROM articles a JOIN categories c ON c.id = a.category_id {$where} ORDER BY a.updated_at DESC",
                $sqlParams
            );
            json_out(['articles' => array_map('hydrate_article', $rows)]);
        }

        if ($is('POST', '/api/admin/articles/:id/reject')) {
            $user = require_admin();
            $article = db_get('SELECT * FROM articles WHERE id = ?', [$params['id']]);
            if (!$article) json_out(['error' => 'Piece not found.'], 404);
            $notes = clean($body['reviewer_notes'] ?? '', 2000);
            if (strlen($notes) < 3) json_out(['error' => 'Provide a note explaining what needs revision.'], 400);
            $now = now_iso();
            db_run("UPDATE articles SET status='rejected', reviewer_notes=?, reviewed_at=?, updated_at=? WHERE id=?", [$notes, $now, $now, $article['id']]);
            audit($user['id'], 'reject', 'article', $article['id'], $article['title_en']);
            json_out(['article' => hydrate_article(db_get('SELECT * FROM articles WHERE id = ?', [$article['id']]))]);
        }

        if ($is('GET', '/api/admin/magazines')) {
            require_admin();
            $rows = db_all('SELECT * FROM magazines ORDER BY year DESC, month DESC');
            json_out(['magazines' => array_map(fn($m) => magazine_card($m, articles_for_magazine($m['id'])), $rows)]);
        }

        if ($is('POST', '/api/admin/magazines')) {
            $actor = require_admin();
            $month = (int) ($body['target_month'] ?? 0);
            $year = (int) ($body['target_year'] ?? 0);
            if ($month < 1 || $month > 12 || $year < 2024 || $year > 2100) json_out(['error' => 'Choose a valid month and year.'], 400);
            if (db_get('SELECT id FROM magazines WHERE year = ? AND month = ?', [$year, $month])) {
                json_out(['error' => 'An issue for this month already exists.'], 409);
            }
            $slug = sprintf('%04d-%02d', $year, $month);
            $titleEn = clean($body['title_en'] ?? '', 220) ?: (month_name($month, 'en') . ' ' . $year . ' Issue');
            $titleSi = clean($body['title_si'] ?? '', 220) ?: (month_name($month, 'si') . ' ' . $year . ' සංස්කරණය');
            $summaryEn = clean($body['summary_en'] ?? '', 1000);
            $summarySi = clean($body['summary_si'] ?? '', 1000);
            $highlights = parse_json($body['highlights_json'] ?? '[]', []);
            $now = now_iso();
            $result = db_run(
                'INSERT INTO magazines (slug, year, month, title_en, title_si, summary_en, summary_si, highlights_json, cover_path, status, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
                [$slug, $year, $month, $titleEn, $titleSi, $summaryEn, $summarySi, json_encode($highlights), '', 'draft', $now, $now]
            );
            audit($actor['id'], 'create', 'magazine', $result['id'], $slug);
            $magazine = db_get('SELECT * FROM magazines WHERE id = ?', [$result['id']]);
            json_out(['magazine' => magazine_card($magazine, [])], 201);
        }

        if ($is('PUT', '/api/admin/magazines/:id')) {
            $actor = require_admin();
            $magazine = db_get('SELECT * FROM magazines WHERE id = ?', [$params['id']]);
            if (!$magazine) json_out(['error' => 'Issue not found.'], 404);
            $titleEn = clean($body['title_en'] ?? '', 220) ?: $magazine['title_en'];
            $titleSi = clean($body['title_si'] ?? '', 220) ?: $magazine['title_si'];
            $summaryEn = clean($body['summary_en'] ?? '', 1000);
            $summarySi = clean($body['summary_si'] ?? '', 1000);
            $highlights = parse_json($body['highlights_json'] ?? '[]', []);
            db_run(
                'UPDATE magazines SET title_en=?, title_si=?, summary_en=?, summary_si=?, highlights_json=?, updated_at=? WHERE id=?',
                [$titleEn, $titleSi, $summaryEn, $summarySi, json_encode($highlights), now_iso(), $magazine['id']]
            );
            audit($actor['id'], 'update', 'magazine', $magazine['id'], $magazine['slug']);
            $magazine = db_get('SELECT * FROM magazines WHERE id = ?', [$magazine['id']]);
            json_out(['magazine' => magazine_card($magazine, articles_for_magazine($magazine['id']))]);
        }

        if ($is('POST', '/api/admin/magazines/:id/publish')) {
            $actor = require_admin();
            $magazine = db_get('SELECT * FROM magazines WHERE id = ?', [$params['id']]);
            if (!$magazine) json_out(['error' => 'Issue not found.'], 404);
            $now = now_iso();
            db_run("UPDATE magazines SET status='published', updated_at=? WHERE id=?", [$now, $magazine['id']]);
            db_run("UPDATE articles SET status='published', updated_at=? WHERE magazine_id = ? AND status = 'approved'", [$now, $magazine['id']]);
            audit($actor['id'], 'publish', 'magazine', $magazine['id'], $magazine['slug']);
            $magazine = db_get('SELECT * FROM magazines WHERE id = ?', [$magazine['id']]);
            json_out(['magazine' => magazine_card($magazine, articles_for_magazine($magazine['id']))]);
        }

        if ($is('POST', '/api/admin/magazines/:id/unpublish')) {
            $actor = require_admin();
            $magazine = db_get('SELECT * FROM magazines WHERE id = ?', [$params['id']]);
            if (!$magazine) json_out(['error' => 'Issue not found.'], 404);
            $now = now_iso();
            db_run("UPDATE magazines SET status='draft', updated_at=? WHERE id=?", [$now, $magazine['id']]);
            db_run("UPDATE articles SET status='approved', updated_at=? WHERE magazine_id = ? AND status = 'published'", [$now, $magazine['id']]);
            audit($actor['id'], 'unpublish', 'magazine', $magazine['id'], $magazine['slug']);
            $magazine = db_get('SELECT * FROM magazines WHERE id = ?', [$magazine['id']]);
            json_out(['magazine' => magazine_card($magazine, articles_for_magazine($magazine['id']))]);
        }

        if ($is('POST', '/api/admin/magazines/:id/cover')) {
            $actor = require_admin();
            $magazine = db_get('SELECT * FROM magazines WHERE id = ?', [$params['id']]);
            if (!$magazine) json_out(['error' => 'Issue not found.'], 404);
            $file = save_upload('file');
            if (!$file) json_out(['error' => 'Choose a cover image.'], 400);
            if ($magazine['cover_path'] && str_starts_with($magazine['cover_path'], '/uploads/')) {
                $old = MDTU_PUBLIC . $magazine['cover_path'];
                if (is_file($old)) @unlink($old);
            }
            db_run('UPDATE magazines SET cover_path = ?, updated_at = ? WHERE id = ?', [$file['path'], now_iso(), $magazine['id']]);
            audit($actor['id'], 'cover', 'magazine', $magazine['id'], $magazine['slug']);
            $magazine = db_get('SELECT * FROM magazines WHERE id = ?', [$magazine['id']]);
            json_out(['magazine' => magazine_card($magazine, articles_for_magazine($magazine['id']))]);
        }

        if ($is('DELETE', '/api/admin/magazines/:id')) {
            $actor = require_admin();
            $magazine = db_get('SELECT * FROM magazines WHERE id = ?', [$params['id']]);
            if (!$magazine) json_out(['error' => 'Issue not found.'], 404);
            $count = (int) db_get('SELECT COUNT(*) AS n FROM articles WHERE magazine_id = ?', [$magazine['id']])['n'];
            if ($count) json_out(['error' => 'Remove assigned pieces before deleting the issue.'], 409);
            if ($magazine['cover_path'] && str_starts_with($magazine['cover_path'], '/uploads/')) {
                $old = MDTU_PUBLIC . $magazine['cover_path'];
                if (is_file($old)) @unlink($old);
            }
            db_run('DELETE FROM magazines WHERE id = ?', [$magazine['id']]);
            audit($actor['id'], 'delete', 'magazine', $magazine['id'], $magazine['slug']);
            json_out(['ok' => true]);
        }

        fail(404, 'Not found.');
    } catch (Throwable $e) {
        fail(500, 'Server error: ' . $e->getMessage());
    }
}
