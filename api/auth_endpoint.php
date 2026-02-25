<?php
require_once 'auth.php';
require_once 'utils.php';

try {
    $method = $_SERVER['REQUEST_METHOD'];
    $auth = new Auth();
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Initialization failed: ' . $e->getMessage()]);
    exit();
}

switch ($method) {
    case 'POST':
        $data = json_decode(file_get_contents('php://input'), true);
        $action = $data['action'] ?? '';
        
        if ($action === 'register') {
            try {
                $email = $data['email'] ?? '';
                $password = $data['password'] ?? '';
                $firstName = $data['firstName'] ?? '';
                $lastName = $data['lastName'] ?? '';
                $role = $data['role'] ?? 'student';
                
                if (empty($email) || empty($password) || empty($firstName) || empty($lastName)) {
                    http_response_code(400);
                    echo json_encode(['success' => false, 'message' => 'All fields are required']);
                    exit();
                }
                
                $result = $auth->register($email, $password, $firstName, $lastName, $role);
                
                if (!$result['success']) {
                    http_response_code(400);
                }
                
                echo json_encode($result);
            } catch (Exception $e) {
                http_response_code(500);
                error_log("Registration endpoint error: " . $e->getMessage());
                echo json_encode(['success' => false, 'message' => 'Registration failed: ' . $e->getMessage()]);
            }
        } elseif ($action === 'login') {
            $email = $data['email'] ?? '';
            $password = $data['password'] ?? '';
            
            if (empty($email) || empty($password)) {
                http_response_code(400);
                echo json_encode(['success' => false, 'message' => 'Email and password are required']);
                exit();
            }
            
            $result = $auth->login($email, $password);
            echo json_encode($result);
        } else {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Invalid action']);
        }
        break;
        
    case 'GET':
        // Get current user
        $user = requireAuth();
        $currentUser = $auth->getCurrentUser($user['user_id']);
        
        if ($currentUser) {
            echo json_encode(['success' => true, 'user' => $currentUser]);
        } else {
            http_response_code(404);
            echo json_encode(['success' => false, 'message' => 'User not found']);
        }
        break;
        
    default:
        http_response_code(405);
        echo json_encode(['success' => false, 'message' => 'Method not allowed']);
}

