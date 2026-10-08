<?php
declare(strict_types=1);

$uri = urldecode(parse_url($_SERVER['REQUEST_URI'] ?? '/', PHP_URL_PATH) ?? '/');
$uri = str_replace('\\', '/', $uri);

if (str_contains($uri, '..') || str_starts_with($uri, '/data')) {
    http_response_code(403);
    echo 'Forbidden';
    return true;
}

$file = __DIR__ . str_replace('/', DIRECTORY_SEPARATOR, $uri);
if ($uri !== '/' && is_file($file)) {
    return false;
}

if (is_dir($file)) {
    $index = rtrim($file, '/\\') . DIRECTORY_SEPARATOR . 'index.php';
    if (is_file($index)) {
        require $index;
        return true;
    }
}

http_response_code(404);
echo 'Not found';
return true;
