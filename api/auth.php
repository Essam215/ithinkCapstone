<?php
require_once 'database.php';
require_once 'jwt.php';

class Auth {
    private $db;
    
    public function __construct() {
        global $db;
        if (!$db) {
            throw new Exception("Database connection not available");
        }
        $this->db = $db;
    }
    
    public function register($email, $password, $firstName, $lastName, $role = 'student') {
        try {
            // Check if user exists
            $existing = $this->db->fetchOne(
                "SELECT id FROM users WHERE email = ?",
                [$email]
            );
            
            if ($existing) {
                return ['success' => false, 'message' => 'Email already registered'];
            }
            
            // Hash password
            $hashedPassword = password_hash($password, PASSWORD_DEFAULT);
            
            if (!$hashedPassword) {
                return ['success' => false, 'message' => 'Failed to hash password'];
            }
            
            // Insert user
            $result = $this->db->query(
                "INSERT INTO users (email, password, first_name, last_name, role) VALUES (?, ?, ?, ?, ?)",
                [$email, $hashedPassword, $firstName, $lastName, $role]
            );
            
            if ($result === false) {
                return ['success' => false, 'message' => 'Failed to create user account. Please check database connection.'];
            }
            
            $userId = $this->db->lastInsertId();
            
            if (!$userId) {
                return ['success' => false, 'message' => 'Failed to create user account'];
            }
            
            // Get user data
            $user = $this->db->fetchOne(
                "SELECT id, email, first_name, last_name, role, points, rank, avatar, created_at FROM users WHERE id = ?",
                [$userId]
            );
            
            if (!$user) {
                return ['success' => false, 'message' => 'User created but failed to retrieve user data'];
            }
            
            // Generate token
            $token = JWT::encode(['user_id' => $userId, 'email' => $email, 'role' => $role]);
            
            return [
                'success' => true,
                'token' => $token,
                'user' => [
                    'id' => (string)$user['id'],
                    'email' => $user['email'],
                    'firstName' => $user['first_name'],
                    'lastName' => $user['last_name'],
                    'role' => $user['role'],
                    'points' => (int)$user['points'],
                    'rank' => (int)$user['rank'],
                    'avatar' => $user['avatar'],
                    'createdAt' => $user['created_at']
                ]
            ];
        } catch (Exception $e) {
            error_log("Registration error: " . $e->getMessage());
            return ['success' => false, 'message' => 'Registration failed: ' . $e->getMessage()];
        }
    }
    
    public function login($email, $password) {
        $user = $this->db->fetchOne(
            "SELECT id, email, password, first_name, last_name, role, points, rank, avatar, is_active, created_at FROM users WHERE email = ?",
            [$email]
        );
        
        if (!$user) {
            return ['success' => false, 'message' => 'Invalid email or password'];
        }
        
        if (!$user['is_active']) {
            return ['success' => false, 'message' => 'Account is inactive'];
        }
        
        if (!password_verify($password, $user['password'])) {
            return ['success' => false, 'message' => 'Invalid email or password'];
        }
        
        // Generate token
        $token = JWT::encode(['user_id' => $user['id'], 'email' => $user['email'], 'role' => $user['role']]);
        
        return [
            'success' => true,
            'token' => $token,
            'user' => [
                'id' => (string)$user['id'],
                'email' => $user['email'],
                'firstName' => $user['first_name'],
                'lastName' => $user['last_name'],
                'role' => $user['role'],
                'points' => (int)$user['points'],
                'rank' => (int)$user['rank'],
                'avatar' => $user['avatar'],
                'createdAt' => $user['created_at']
            ]
        ];
    }
    
    public function verifyToken($token) {
        try {
            $decoded = JWT::decode($token);
            return $decoded;
        } catch (Exception $e) {
            return null;
        }
    }
    
    public function getCurrentUser($userId) {
        $user = $this->db->fetchOne(
            "SELECT id, email, first_name, last_name, role, points, rank, avatar, created_at FROM users WHERE id = ? AND is_active = 1",
            [$userId]
        );
        
        if (!$user) {
            return null;
        }
        
        return [
            'id' => (string)$user['id'],
            'email' => $user['email'],
            'firstName' => $user['first_name'],
            'lastName' => $user['last_name'],
            'role' => $user['role'],
            'points' => (int)$user['points'],
            'rank' => (int)$user['rank'],
            'avatar' => $user['avatar'],
            'createdAt' => $user['created_at']
        ];
    }
}

// Middleware function to check authentication
function requireAuth() {
    $headers = getallheaders();
    $authHeader = $headers['Authorization'] ?? $headers['authorization'] ?? '';
    
    if (empty($authHeader) || !preg_match('/Bearer\s+(.*)$/i', $authHeader, $matches)) {
        http_response_code(401);
        echo json_encode(['success' => false, 'message' => 'Unauthorized']);
        exit();
    }
    
    $token = $matches[1];
    $auth = new Auth();
    $decoded = $auth->verifyToken($token);
    
    if (!$decoded) {
        http_response_code(401);
        echo json_encode(['success' => false, 'message' => 'Invalid token']);
        exit();
    }
    
    return $decoded;
}

function requireRole($allowedRoles) {
    $user = requireAuth();
    
    if (!in_array($user['role'], $allowedRoles)) {
        http_response_code(403);
        echo json_encode(['success' => false, 'message' => 'Forbidden']);
        exit();
    }
    
    return $user;
}

