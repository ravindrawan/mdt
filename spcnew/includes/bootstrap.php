<?php
declare(strict_types=1);

date_default_timezone_set('Asia/Colombo');

if (session_status() !== PHP_SESSION_ACTIVE) {
    session_set_cookie_params([
        'lifetime' => 0,
        'path' => '/',
        'httponly' => true,
        'samesite' => 'Lax',
        'secure' => !empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off',
    ]);
    session_start();
}

header('X-Content-Type-Options: nosniff');
header('X-Frame-Options: SAMEORIGIN');
header('Referrer-Policy: same-origin');
header('Cache-Control: no-store, no-cache, must-revalidate');

function db(): PDO
{
    static $pdo = null;
    if ($pdo instanceof PDO) {
        return $pdo;
    }

    $dir = dirname(__DIR__) . DIRECTORY_SEPARATOR . 'data';
    if (!is_dir($dir) && !mkdir($dir, 0775, true) && !is_dir($dir)) {
        http_response_code(500);
        exit('දත්ත ෆෝල්ඩරය සෑදිය නොහැක.');
    }

    $pdo = new PDO('sqlite:' . $dir . DIRECTORY_SEPARATOR . 'spc.sqlite', null, null, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    ]);
    $pdo->exec('PRAGMA foreign_keys = ON');
    $pdo->exec('PRAGMA busy_timeout = 3000');
    $pdo->exec('PRAGMA journal_mode = WAL');

    $pdo->exec(<<<'SQL'
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_code TEXT NOT NULL UNIQUE COLLATE NOCASE,
    name TEXT NOT NULL,
    phone TEXT NOT NULL,
    password_hash TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'user',
    status TEXT NOT NULL DEFAULT 'active',
    height_cm REAL,
    created_at TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS readings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    recorded_on TEXT NOT NULL,
    sugar_mgdl REAL,
    sugar_type TEXT,
    systolic INTEGER,
    diastolic INTEGER,
    cholesterol_mgdl REAL,
    weight_kg REAL,
    height_cm REAL,
    bmi REAL,
    note TEXT,
    created_at TEXT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id)
);
CREATE TABLE IF NOT EXISTS habits (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    habit_date TEXT NOT NULL,
    water INTEGER NOT NULL DEFAULT 0,
    walk INTEGER NOT NULL DEFAULT 0,
    veg INTEGER NOT NULL DEFAULT 0,
    low_salt INTEGER NOT NULL DEFAULT 0,
    sleep INTEGER NOT NULL DEFAULT 0,
    UNIQUE(user_id, habit_date),
    FOREIGN KEY (user_id) REFERENCES users(id)
);
CREATE TABLE IF NOT EXISTS messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    sender TEXT NOT NULL,
    body TEXT NOT NULL,
    created_at TEXT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id)
);
CREATE INDEX IF NOT EXISTS idx_readings_user_date ON readings(user_id, recorded_on);
CREATE INDEX IF NOT EXISTS idx_messages_user ON messages(user_id, id);
SQL);

    $exists = $pdo->prepare("SELECT id FROM users WHERE user_code = 'admin' COLLATE NOCASE");
    $exists->execute();
    if (!$exists->fetch()) {
        $insert = $pdo->prepare('INSERT INTO users (user_code, name, phone, password_hash, role, status, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)');
        $insert->execute([
            'admin',
            'පද්ධති පරිපාලක',
            '0000000000',
            password_hash('123', PASSWORD_DEFAULT),
            'admin',
            'active',
            date('Y-m-d H:i:s'),
        ]);
    }

    return $pdo;
}

function e(mixed $value): string
{
    return htmlspecialchars((string) $value, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');
}

function base_path(): string
{
    static $base = null;
    if ($base !== null) {
        return $base;
    }
    $script = str_replace('\\', '/', $_SERVER['SCRIPT_NAME'] ?? '/index.php');
    if ($script === '' || $script[0] !== '/') {
        $script = '/' . ltrim($script, '/');
    }
    $dir = rtrim(str_replace('\\', '/', dirname($script)), '/');
    if (str_ends_with($dir, '/admin')) {
        $dir = rtrim(str_replace('\\', '/', dirname($dir)), '/');
    }
    $base = ($dir === '' || $dir === '/' || $dir === '.') ? '' : $dir;
    return $base;
}

function url(string $path): string
{
    return base_path() . '/' . ltrim($path, '/');
}

function redirect(string $path): never
{
    header('Location: ' . url($path));
    exit;
}

function csrf_token(): string
{
    if (empty($_SESSION['csrf']) || !is_string($_SESSION['csrf'])) {
        $_SESSION['csrf'] = bin2hex(random_bytes(16));
    }
    return $_SESSION['csrf'];
}

function csrf_field(): string
{
    return '<input type="hidden" name="csrf" value="' . e(csrf_token()) . '">';
}

function csrf_check(): void
{
    $sent = $_POST['csrf'] ?? '';
    $known = $_SESSION['csrf'] ?? '';
    if (!is_string($sent) || !is_string($known) || $known === '' || !hash_equals($known, $sent)) {
        http_response_code(400);
        exit('ඉල්ලීම වලංගු නැත. පිටුව නැවුම් කර නැවත උත්සාහ කරන්න.');
    }
}

function flash(?string $type = null, ?string $message = null): ?array
{
    if ($type !== null) {
        $_SESSION['flash'] = ['type' => $type, 'message' => $message ?? ''];
        return null;
    }
    if (empty($_SESSION['flash']) || !is_array($_SESSION['flash'])) {
        return null;
    }
    $item = $_SESSION['flash'];
    unset($_SESSION['flash']);
    return $item;
}

function current_user(): ?array
{
    if (empty($_SESSION['uid'])) {
        return null;
    }
    $stmt = db()->prepare('SELECT * FROM users WHERE id = ?');
    $stmt->execute([(int) $_SESSION['uid']]);
    $user = $stmt->fetch();
    if (!$user || ($user['status'] !== 'active' && $user['role'] !== 'admin')) {
        unset($_SESSION['uid']);
        return null;
    }
    return $user;
}

function require_user(): array
{
    $user = current_user();
    if (!$user) {
        flash('info', 'පළමුව පිවිසෙන්න.');
        redirect('login.php');
    }
    if ($user['role'] === 'admin') {
        redirect('admin/index.php');
    }
    return $user;
}

function require_admin(): array
{
    $user = current_user();
    if (!$user) {
        flash('info', 'පරිපාලක පිවිසීම අවශ්‍යයි.');
        redirect('login.php');
    }
    if ($user['role'] !== 'admin') {
        redirect('dashboard.php');
    }
    return $user;
}

function valid_code(string $code): bool
{
    return (bool) preg_match('/^[A-Za-z0-9][A-Za-z0-9._-]{2,29}$/', $code);
}

function normalize_phone(string $phone): ?string
{
    $digits = preg_replace('/\D+/', '', $phone) ?? '';
    if (str_starts_with($digits, '94') && strlen($digits) === 11) {
        $digits = '0' . substr($digits, 2);
    }
    if (strlen($digits) === 10 && $digits[0] === '0') {
        return $digits;
    }
    return null;
}

function format_phone(string $phone): string
{
    if (preg_match('/^0\d{9}$/', $phone)) {
        return substr($phone, 0, 3) . ' ' . substr($phone, 3, 3) . ' ' . substr($phone, 6);
    }
    return $phone;
}

function valid_name(string $name): bool
{
    $len = mb_strlen($name);
    if ($len < 2 || $len > 80) {
        return false;
    }
    return (bool) preg_match("/^[\\p{L}\\p{M}\\s.'-]{2,80}$/u", $name);
}

function fval(mixed $value): ?float
{
    if ($value === null || $value === '') {
        return null;
    }
    return (float) $value;
}

function parse_num(string $raw): array
{
    $raw = trim(str_replace(',', '.', $raw));
    if ($raw === '') {
        return ['ok' => true, 'value' => null];
    }
    if (!is_numeric($raw)) {
        return ['ok' => false, 'value' => null];
    }
    return ['ok' => true, 'value' => (float) $raw];
}

function num(mixed $value, int $forceDec = -1): string
{
    if ($value === null || $value === '') {
        return '—';
    }
    $number = (float) $value;
    if ($forceDec >= 0) {
        return number_format($number, $forceDec);
    }
    if (abs($number - round($number)) < 0.05) {
        return number_format($number, 0);
    }
    return number_format($number, 1);
}

function user_by_id(int $id): ?array
{
    $stmt = db()->prepare('SELECT * FROM users WHERE id = ?');
    $stmt->execute([$id]);
    $row = $stmt->fetch();
    return $row ?: null;
}

function code_taken(string $code, int $exceptId = 0): bool
{
    $stmt = db()->prepare('SELECT id FROM users WHERE user_code = ? COLLATE NOCASE AND id <> ?');
    $stmt->execute([$code, $exceptId]);
    return (bool) $stmt->fetch();
}

function delete_reading(array $actor, int $readingId): void
{
    $stmt = db()->prepare('SELECT user_id FROM readings WHERE id = ?');
    $stmt->execute([$readingId]);
    $row = $stmt->fetch();
    if (!$row) {
        flash('bad', 'මැනුම හමු නොවුණා.');
        return;
    }
    $owner = (int) $row['user_id'];
    if ($actor['role'] !== 'admin' && $owner !== (int) $actor['id']) {
        http_response_code(403);
        exit('අවසර නැත.');
    }
    $del = db()->prepare('DELETE FROM readings WHERE id = ?');
    $del->execute([$readingId]);
    flash('ok', 'මැනුම ඉවත් කළා.');
}

function today_habits(int $userId): array
{
    $stmt = db()->prepare('SELECT * FROM habits WHERE user_id = ? AND habit_date = ?');
    $stmt->execute([$userId, date('Y-m-d')]);
    $row = $stmt->fetch();
    if (!$row) {
        return ['water' => 0, 'walk' => 0, 'veg' => 0, 'low_salt' => 0, 'sleep' => 0];
    }
    return $row;
}

function toggle_habit(int $userId, string $key): void
{
    $allowed = ['water', 'walk', 'veg', 'low_salt', 'sleep'];
    if (!in_array($key, $allowed, true)) {
        return;
    }
    $today = date('Y-m-d');
    $pdo = db();
    $pdo->prepare('INSERT INTO habits (user_id, habit_date, water, walk, veg, low_salt, sleep) VALUES (?, ?, 0, 0, 0, 0, 0) ON CONFLICT(user_id, habit_date) DO NOTHING')
        ->execute([$userId, $today]);
    $pdo->prepare("UPDATE habits SET {$key} = CASE WHEN {$key} = 1 THEN 0 ELSE 1 END WHERE user_id = ? AND habit_date = ?")
        ->execute([$userId, $today]);
}

function activity_dates(int $userId): array
{
    $stmt = db()->prepare(<<<'SQL'
SELECT recorded_on AS d FROM readings WHERE user_id = ?
UNION
SELECT habit_date AS d FROM habits
WHERE user_id = ? AND (water = 1 OR walk = 1 OR veg = 1 OR low_salt = 1 OR sleep = 1)
SQL);
    $stmt->execute([$userId, $userId]);
    return array_column($stmt->fetchAll(), 'd');
}

function streak_count(array $dates): int
{
    $set = array_flip($dates);
    $cursor = new DateTime('today');
    $key = $cursor->format('Y-m-d');
    if (!isset($set[$key])) {
        $cursor->modify('-1 day');
        $key = $cursor->format('Y-m-d');
        if (!isset($set[$key])) {
            return 0;
        }
    }
    $count = 0;
    while (isset($set[$cursor->format('Y-m-d')])) {
        $count++;
        $cursor->modify('-1 day');
    }
    return $count;
}

function last_reading_date(int $userId): ?string
{
    $stmt = db()->prepare('SELECT MAX(recorded_on) FROM readings WHERE user_id = ?');
    $stmt->execute([$userId]);
    $value = $stmt->fetchColumn();
    return $value ? (string) $value : null;
}

function readings_between(int $userId, string $start, string $end): array
{
    $stmt = db()->prepare('SELECT * FROM readings WHERE user_id = ? AND recorded_on >= ? AND recorded_on < ? ORDER BY recorded_on ASC, id ASC');
    $stmt->execute([$userId, $start, $end]);
    return $stmt->fetchAll();
}

function month_bounds(string $ym): array
{
    $start = new DateTime($ym . '-01');
    $end = (clone $start)->modify('+1 month');
    return [$start->format('Y-m-d'), $end->format('Y-m-d')];
}

function shift_month(string $ym, int $delta): string
{
    $dt = new DateTime($ym . '-01');
    $dt->modify(($delta >= 0 ? '+' : '') . $delta . ' month');
    return $dt->format('Y-m');
}

function valid_month(string $ym): bool
{
    return (bool) preg_match('/^\d{4}-(0[1-9]|1[0-2])$/', $ym);
}
