<?php
if (!function_exists('str_starts_with')) {
    function str_starts_with($haystack, $needle)
    {
        return $needle === '' || strncmp((string) $haystack, (string) $needle, strlen((string) $needle)) === 0;
    }
}
define('MDTU_ROOT', dirname(__DIR__));
define('MDTU_PUBLIC', __DIR__);

function install_statements(string $sql): array
{
    $sql = preg_replace('/^--.*$/m', '', $sql);
    $statements = [];
    $buffer = '';
    $quoted = false;
    $length = strlen($sql);
    for ($i = 0; $i < $length; $i++) {
        $char = $sql[$i];
        if ($char === "'") {
            $buffer .= $char;
            if ($quoted && ($sql[$i + 1] ?? '') === "'") {
                $buffer .= "'";
                $i++;
                continue;
            }
            $quoted = !$quoted;
            continue;
        }
        if ($char === ';' && !$quoted) {
            $statement = trim($buffer);
            if ($statement !== '') {
                $statements[] = $statement;
            }
            $buffer = '';
            continue;
        }
        $buffer .= $char;
    }
    $tail = trim($buffer);
    if ($tail !== '') {
        $statements[] = $tail;
    }
    return $statements;
}

function install_sql(PDO $pdo, string $file): void
{
    foreach (install_statements((string) file_get_contents($file)) as $statement) {
        $upper = strtoupper(ltrim($statement));
        if (str_starts_with($upper, 'CREATE DATABASE') || str_starts_with($upper, 'USE ')) {
            continue;
        }
        $pdo->exec($statement);
    }
}

$message = '';
$error = '';
if (($_SERVER['REQUEST_METHOD'] ?? 'GET') === 'POST') {
    $host = trim((string) ($_POST['host'] ?? 'localhost'));
    $name = trim((string) ($_POST['name'] ?? ''));
    $user = trim((string) ($_POST['user'] ?? ''));
    $pass = (string) ($_POST['pass'] ?? '');
    if ($name === '' || $user === '') {
        $error = 'Database name and username are required.';
    } else {
        try {
            $pdo = new PDO(
                'mysql:host=' . $host . ';dbname=' . $name . ';charset=utf8mb4',
                $user,
                $pass,
                [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]
            );
            $pdo->exec('SET NAMES utf8mb4');
            $pdo->exec('SET FOREIGN_KEY_CHECKS=0');
            foreach (['audit_log', 'media', 'programs', 'articles', 'magazines', 'categories', 'users'] as $table) {
                $pdo->exec('DROP TABLE IF EXISTS `' . $table . '`');
            }
            $pdo->exec('SET FOREIGN_KEY_CHECKS=1');
            install_sql($pdo, MDTU_ROOT . '/schema/mysql.sql');
            install_sql($pdo, MDTU_ROOT . '/schema/mdtu-data.sql');
            $mysql = var_export([
                'host' => $host,
                'name' => $name,
                'user' => $user,
                'pass' => $pass,
            ], true);
            $config = "<?php\nreturn [\n    'driver' => 'mysql',\n    'sqlite' => dirname(__DIR__) . '/data/retreat.db',\n    'mysql' => {$mysql},\n];\n";
            file_put_contents(MDTU_ROOT . '/php/config.php', $config);
            $message = 'MySQL is ready. Open the site home page. Then delete install.php from the server.';
        } catch (Throwable $problem) {
            $error = $problem->getMessage();
        }
    }
}

header('Content-Type: text/html; charset=utf-8');
$hostValue = htmlspecialchars($_POST['host'] ?? 'localhost', ENT_QUOTES, 'UTF-8');
$nameValue = htmlspecialchars($_POST['name'] ?? '', ENT_QUOTES, 'UTF-8');
$userValue = htmlspecialchars($_POST['user'] ?? '', ENT_QUOTES, 'UTF-8');
?>
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Install The Trainer</title>
  <style>
    body { font-family: Georgia, serif; background: #f6f1e7; color: #1c1915; margin: 0; }
    main { max-width: 640px; margin: 40px auto; padding: 28px; background: #fffdf8; border: 1px solid #e4d8c4; }
    label { display: block; margin: 14px 0 4px; font-size: 14px; }
    input { width: 100%; box-sizing: border-box; padding: 8px; }
    button { margin-top: 18px; padding: 10px 16px; }
    .ok { color: #1d6b3a; }
    .bad { color: #8d1d1d; }
    ol { line-height: 1.5; }
  </style>
</head>
<body>
<main>
  <h1>The Trainer on SLT</h1>
  <ol>
    <li>cPanel eken MySQL database ekak, user kenek, saha password ekak hadanna. User wa database ekata All Privileges denna.</li>
    <li>cPanel document root eka me project eke <b>public</b> folder eka karanna. Eka ba nam, mulu folder eka public_html ekata upload karanna.</li>
    <li>Me form eka fill karala tables saha magazine data eka copy karanna.</li>
    <li>Ita passe me <b>install.php</b> file eka server eken ain karanna.</li>
  </ol>
  <?php if ($message): ?><p class="ok"><?= htmlspecialchars($message, ENT_QUOTES, 'UTF-8') ?></p><?php endif; ?>
  <?php if ($error): ?><p class="bad"><?= htmlspecialchars($error, ENT_QUOTES, 'UTF-8') ?></p><?php endif; ?>
  <form method="post">
    <label>MySQL host</label>
    <input name="host" value="<?= $hostValue ?>" required>
    <label>Database name</label>
    <input name="name" value="<?= $nameValue ?>" required>
    <label>Database user</label>
    <input name="user" value="<?= $userValue ?>" required>
    <label>Database password</label>
    <input name="pass" type="password" autocomplete="new-password">
    <button type="submit">Create tables and copy the magazine</button>
  </form>
  <p>Local computer eke Node server eka ithin http://127.0.0.1:3000 wenama run wenawa. Me page eka SLT host ekata witharai.</p>
</main>
</body>
</html>
