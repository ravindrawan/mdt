<?php

if (!function_exists('str_starts_with')) {
    function str_starts_with($haystack, $needle)
    {
        return $needle === '' || strncmp((string) $haystack, (string) $needle, strlen((string) $needle)) === 0;
    }
}
if (!function_exists('str_ends_with')) {
    function str_ends_with($haystack, $needle)
    {
        $needle = (string) $needle;
        if ($needle === '') return true;
        return substr((string) $haystack, -strlen($needle)) === $needle;
    }
}

if (!defined('MDTU_ROOT')) {
    throw new RuntimeException('MDTU_ROOT is not set.');
}

require_once MDTU_ROOT . '/php/db.php';
require_once MDTU_ROOT . '/php/format.php';

header('X-Content-Type-Options: nosniff');
header('X-Frame-Options: SAMEORIGIN');
header('Referrer-Policy: same-origin');

if (session_status() !== PHP_SESSION_ACTIVE) {
    session_name('retreat_sid');
    session_set_cookie_params([
        'lifetime' => 60 * 60 * 8,
        'path' => '/',
        'httponly' => true,
        'samesite' => 'Lax',
    ]);
    session_start();
}

class HttpError extends Exception
{
}

function fail(int $status, string $message): void
{
    throw new HttpError($message, $status);
}

function clean($value, int $max): string
{
    $text = trim((string) ($value ?? ''));
    if (function_exists('mb_substr')) {
        return mb_substr($text, 0, $max);
    }
    return substr($text, 0, $max);
}

function json_out($data, int $status = 200): void
{
    http_response_code($status);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode($data, JSON_UNESCAPED_UNICODE);
    exit;
}

function request_body(): array
{
    if (!empty($_POST) || !empty($_FILES)) {
        return $_POST;
    }
    static $body;
    if ($body === null) {
        $raw = file_get_contents('php://input');
        $decoded = json_decode($raw ?: '{}', true);
        $body = is_array($decoded) ? $decoded : [];
    }
    return $body;
}

function mdtu_normalize_path(string $raw): string
{
    $path = rawurldecode((string) (parse_url($raw, PHP_URL_PATH) ?: '/'));
    if (str_starts_with($path, '/public/')) {
        $path = substr($path, 7) ?: '/';
    } elseif ($path === '/public') {
        $path = '/';
    }
    if ($path === '' || $path === '/index.php') {
        return '/';
    }
    return $path;
}

function mdtu_path(): string
{
    $candidates = [];
    foreach (['REDIRECT_URL', 'REDIRECT_URI', 'REQUEST_URI'] as $key) {
        if (!empty($_SERVER[$key])) {
            $candidates[] = mdtu_normalize_path((string) $_SERVER[$key]);
        }
    }
    foreach ($candidates as $path) {
        if (str_starts_with($path, '/api/') || str_starts_with($path, '/magazine/')) {
            return $path;
        }
    }
    return $candidates[0] ?? '/';
}

function audit($userId, string $action, string $entity, $entityId, string $detail = ''): void
{
    db_run(
        'INSERT INTO audit_log (user_id, action, entity, entity_id, detail, created_at) VALUES (?, ?, ?, ?, ?, ?)',
        [$userId ?: null, $action, $entity, $entityId ?: null, clean($detail, 500), now_iso()]
    );
}

function public_user(array $user): array
{
    return [
        'id' => (int) $user['id'],
        'username' => $user['username'],
        'email' => $user['email'],
        'full_name_en' => $user['full_name_en'],
        'full_name_si' => $user['full_name_si'],
        'role' => $user['role'],
        'designation_en' => $user['designation_en'],
        'designation_si' => $user['designation_si'],
        'phone' => $user['phone'],
        'avatar_path' => $user['avatar_path'],
        'active' => (bool) $user['active'],
    ];
}

function current_user(): ?array
{
    $id = $_SESSION['user']['id'] ?? null;
    if (!$id) {
        return null;
    }
    $user = db_get('SELECT * FROM users WHERE id = ?', [$id]);
    if (!$user || !(int) $user['active']) {
        $_SESSION = [];
        return null;
    }
    return $user;
}

function require_auth(): array
{
    $user = current_user();
    if (!$user) {
        json_out(['error' => 'Sign in required.'], 401);
    }
    return $user;
}

function require_admin(): array
{
    $user = require_auth();
    if ($user['role'] !== 'admin') {
        json_out(['error' => 'Administrators only.'], 403);
    }
    return $user;
}

function client_ip(): string
{
    return $_SERVER['REMOTE_ADDR'] ?? 'local';
}

function login_attempts(): array
{
    $file = MDTU_ROOT . '/data/login-attempts.json';
    $all = is_file($file) ? (json_decode((string) file_get_contents($file), true) ?: []) : [];
    $ip = client_ip();
    $attempt = $all[$ip] ?? ['n' => 0, 't' => time()];
    if (time() - (int) $attempt['t'] > 15 * 60) {
        $attempt = ['n' => 0, 't' => time()];
    }
    return [$file, $all, $ip, $attempt];
}

function login_blocked(): bool
{
    [, , , $attempt] = login_attempts();
    return (int) $attempt['n'] >= 8;
}

function login_failed(): void
{
    [$file, $all, $ip, $attempt] = login_attempts();
    $attempt['n'] = (int) $attempt['n'] + 1;
    $all[$ip] = $attempt;
    file_put_contents($file, json_encode($all));
}

function login_clear(): void
{
    [$file, $all, $ip] = login_attempts();
    unset($all[$ip]);
    file_put_contents($file, json_encode($all));
}

function mdtu_send_file(string $file): void
{
    $ext = strtolower(pathinfo($file, PATHINFO_EXTENSION));
    $types = [
        'html' => 'text/html; charset=utf-8',
        'css' => 'text/css; charset=utf-8',
        'js' => 'text/javascript; charset=utf-8',
        'json' => 'application/json; charset=utf-8',
        'svg' => 'image/svg+xml',
        'jpg' => 'image/jpeg',
        'jpeg' => 'image/jpeg',
        'png' => 'image/png',
        'webp' => 'image/webp',
        'gif' => 'image/gif',
        'pdf' => 'application/pdf',
        'ico' => 'image/x-icon',
        'woff2' => 'font/woff2',
    ];
    header('Content-Type: ' . ($types[$ext] ?? 'application/octet-stream'));
    readfile($file);
}
