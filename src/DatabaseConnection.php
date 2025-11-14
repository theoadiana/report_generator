<?php
namespace Theob\ReportGenerator;
use PDO, PDOException;

class DatabaseConnection {
    private string $host;
    private string $dbname;
    private string $username;
    private string $password;
    private ?PDO $connection = null;

    public function __construct(string $host, string $dbname, string $username, string $password)
    {
        $this->host = $host;
        $this->dbname = $dbname;
        $this->username = $username;
        $this->password = $password;
    }

    public function connect(): ?PDO
    {
        if ($this->connection === null) {
            try {
                $dsn = "mysql:host={$this->host};dbname={$this->dbname};charset=utf8mb4";
                $this->connection = new PDO($dsn, $this->username, $this->password);
                $this->connection->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
            } catch (PDOException $e) {
                echo "Connection failed: " . $e->getMessage();
                return null;
            }
        }
        return $this->connection;
    }

    public function disconnect(): void
    {
        $this->connection = null;
    }
}


