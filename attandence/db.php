<?php
// OpenShift MySQL Service Name and Port
$host    = getenv('MYSQL_HOST') ?: 'mdtunwgo-mdtu-db';
$port    = getenv('MYSQL_PORT') ?: '3306';
$db      = getenv('MYSQL_DATABASE') ?: 'mdtunwgo_mdtu';
$user    = getenv('MYSQL_USER') ?: 'mdtunwgo_dbuser';
$pass    = getenv('MYSQL_PASSWORD') ?: 'LsHnaTiuBg2Ih1A&';
$charset = 'utf8mb4';

$dsn = "mysql:host=$host;port=$port;dbname=$db;charset=$charset";
$options = [
    PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    PDO::ATTR_EMULATE_PREPARES   => false,
];

try {
    $pdo = new PDO($dsn, $user, $pass, $options);
} catch (\PDOException $e) {
    throw new \PDOException($e->getMessage(), (int)$e->getCode());
}
