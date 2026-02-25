<?php
require_once 'auth.php';
require_once 'database.php';

global $db;
$method = $_SERVER['REQUEST_METHOD'];
$user = requireAuth();

switch ($method) {
    case 'GET':
        $type = $_GET['type'] ?? 'task'; // 'task' or 'event'
        
        if ($type === 'event') {
            $categories = $db->fetchAll("SELECT * FROM event_categories ORDER BY name");
        } else {
            $categories = $db->fetchAll("SELECT * FROM task_categories ORDER BY name");
        }
        
        echo json_encode(['success' => true, 'data' => $categories]);
        break;
        
    case 'POST':
        // Admin creating category
        requireRole(['admin']);
        $data = json_decode(file_get_contents('php://input'), true);
        $type = $data['type'] ?? 'task';
        $name = $data['name'] ?? '';
        $description = $data['description'] ?? '';
        $color = $data['color'] ?? null;
        
        if (empty($name)) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Name is required']);
            exit();
        }
        
        if ($type === 'event') {
            $db->query(
                "INSERT INTO event_categories (name, description, color) VALUES (?, ?, ?)",
                [$name, $description, $color ?? '#3B82F6']
            );
        } else {
            $db->query(
                "INSERT INTO task_categories (name, description) VALUES (?, ?)",
                [$name, $description]
            );
        }
        
        echo json_encode(['success' => true, 'message' => 'Category created successfully']);
        break;
        
    default:
        http_response_code(405);
        echo json_encode(['success' => false, 'message' => 'Method not allowed']);
}

