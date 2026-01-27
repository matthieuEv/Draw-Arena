<?php
declare(strict_types=1);

namespace DrawArena\Utils;

use PDO;
use PDOException;

class Database
{
    private static ?PDO $instance = null;

    private function __construct() {}

    public static function getInstance(): PDO
    {
        if (self::$instance === null) {
            self::$instance = self::createConnection();
        }
        return self::$instance;
    }

    private static function createConnection(): PDO
    {
        $host = getenv('DB_HOST');
        $name = getenv('DB_NAME');
        $user = getenv('DB_USER');
        $pass = getenv('DB_PASS');
        $port = getenv('DB_PORT') ?: 3306;

        try {
            $dsn = sprintf('mysql:host=%s;port=%s;dbname=%s;charset=utf8mb4', $host, $port, $name);

            // Azure MySQL Flexible Server requires SSL
            $options = [
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            ];

            // Enable SSL for Azure MySQL (when DB_HOST contains azure)
            if (strpos($host, '.mysql.database.azure.com') !== false) {
                $options[PDO::MYSQL_ATTR_SSL_VERIFY_SERVER_CERT] = false;
                $options[PDO::MYSQL_ATTR_SSL_CA] = true;
            }

            $pdo = new PDO($dsn, $user, $pass, $options);
            return $pdo;
        } catch (PDOException $e) {
            throw new PDOException('Database connection failed: ' . $e->getMessage());
        }
    }

    public static function prepare(string $sql): \PDOStatement
    {
        return self::getInstance()->prepare($sql);
    }

    public static function query(string $sql): \PDOStatement
    {
        return self::getInstance()->query($sql);
    }
}
