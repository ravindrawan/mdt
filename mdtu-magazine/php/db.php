<?php

function mdtu_config(): array
{
    static $config;
    if ($config === null) {
        $file = MDTU_ROOT . '/php/config.php';
        if (!is_file($file)) {
            throw new RuntimeException('php/config.php is missing.');
        }
        $config = require $file;
    }
    return $config;
}

function db(): PDO
{
    static $pdo;
    if ($pdo instanceof PDO) {
        return $pdo;
    }
    $config = mdtu_config();
    if (($config['driver'] ?? 'sqlite') === 'mysql') {
        $mysql = $config['mysql'];
        $dsn = 'mysql:host=' . $mysql['host'] . ';dbname=' . $mysql['name'] . ';charset=utf8mb4';
        $pdo = new PDO($dsn, $mysql['user'], $mysql['pass'], [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES => true,
        ]);
        return $pdo;
    }
    $file = $config['sqlite'];
    if (!is_file($file)) {
        throw new RuntimeException('The magazine database was not found. Open /install.php.');
    }
    $pdo = new PDO('sqlite:' . $file, null, null, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    ]);
    $pdo->exec('PRAGMA foreign_keys = ON');
    return $pdo;
}

function db_get(string $sql, array $params = [])
{
    $statement = db()->prepare($sql);
    $statement->execute(array_values($params));
    $row = $statement->fetch();
    return $row === false ? null : $row;
}

function db_all(string $sql, array $params = []): array
{
    $statement = db()->prepare($sql);
    $statement->execute(array_values($params));
    return $statement->fetchAll();
}

function db_run(string $sql, array $params = []): array
{
    $statement = db()->prepare($sql);
    $statement->execute(array_values($params));
    return [
        'id' => (int) db()->lastInsertId(),
        'changes' => $statement->rowCount(),
    ];
}

function db_tx(callable $fn)
{
    $pdo = db();
    $pdo->beginTransaction();
    try {
        $result = $fn();
        $pdo->commit();
        return $result;
    } catch (Throwable $error) {
        if ($pdo->inTransaction()) {
            $pdo->rollBack();
        }
        throw $error;
    }
}
