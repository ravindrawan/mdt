<?php
define('MDTU_ROOT', dirname(__DIR__));
define('MDTU_PUBLIC', __DIR__);
require MDTU_ROOT . '/php/boot.php';

$path = mdtu_path();
$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';

if (str_starts_with($path, '/api/') || str_starts_with($path, '/magazine/')) {
    require MDTU_ROOT . '/php/api.php';
    mdtu_api($method, $path);
    exit;
}

$redirects = ['/index.html', '/about.html', '/programmes.html', '/courses.html', '/scholarships.html', '/downloads.html', '/contact.html'];
if (in_array($path, $redirects, true)) {
    header('Location: /', true, 302);
    exit;
}

if ($path === '/') {
    header('Content-Type: text/html; charset=utf-8');
    readfile(MDTU_PUBLIC . '/journal.html');
    exit;
}

$full = MDTU_PUBLIC . str_replace(["\0"], '', $path);
$real = realpath($full);
$root = realpath(MDTU_PUBLIC);
if ($real && $root && strncmp($real, $root, strlen($root)) === 0 && is_file($real) && !str_ends_with(strtolower($real), '.php')) {
    mdtu_send_file($real);
    exit;
}

http_response_code(404);
header('Content-Type: text/plain; charset=utf-8');
echo 'Not found';
