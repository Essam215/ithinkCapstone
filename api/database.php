<?php
require_once 'config.php';

class Database {
    private $conn;
    private static $instance = null;
    
    public function __construct() {
        try {
            $this->conn = new PDO(
                "mysql:host=" . DB_HOST . ";dbname=" . DB_NAME . ";charset=utf8mb4",
                DB_USER,
                DB_PASS,
                [
                    PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                    PDO::ATTR_EMULATE_PREPARES => false
                ]
            );
        } catch (PDOException $e) {
            error_log("Database Connection Error: " . $e->getMessage());
            throw new Exception("Database connection failed: " . $e->getMessage());
        }
    }
    
    public static function getInstance() {
        if (self::$instance === null) {
            self::$instance = new self();
        }
        return self::$instance;
    }
    
    public function getConnection() {
        return $this->conn;
    }
    
    public function query($sql, $params = []) {
        try {
            $stmt = $this->conn->prepare($sql);
            if (!$stmt) {
                error_log("Database Prepare Error: " . implode(", ", $this->conn->errorInfo()));
                return false;
            }
            $result = $stmt->execute($params);
            if (!$result) {
                error_log("Database Execute Error: " . implode(", ", $stmt->errorInfo()));
                return false;
            }
            return $stmt;
        } catch (PDOException $e) {
            error_log("Database Query Error: " . $e->getMessage());
            error_log("SQL: " . $sql);
            error_log("Params: " . print_r($params, true));
            return false;
        }
    }
    
    public function fetchAll($sql, $params = []) {
        $stmt = $this->query($sql, $params);
        return $stmt ? $stmt->fetchAll() : [];
    }
    
    public function fetchOne($sql, $params = []) {
        $stmt = $this->query($sql, $params);
        return $stmt ? $stmt->fetch() : null;
    }
    
    public function lastInsertId() {
        return $this->conn->lastInsertId();
    }
}

// Initialize database connection
try {
    $db = new Database();
} catch (Exception $e) {
    // Database connection will be handled by error handler
    // But we need to set $db to null so other code can check
    $db = null;
    error_log("Failed to initialize database: " . $e->getMessage());
}

