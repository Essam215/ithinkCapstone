<?php
require_once 'auth.php';
require_once 'database.php';

global $db;
$method = $_SERVER['REQUEST_METHOD'];
$user = requireAuth();
$userId = $user['user_id'];

switch ($method) {
    case 'GET':
        // Get badges
        $action = $_GET['action'] ?? 'user';
        
        if ($action === 'all') {
            // Get all available badges
            $badges = $db->fetchAll("SELECT * FROM badges ORDER BY points_required ASC");
            echo json_encode(['success' => true, 'data' => $badges]);
        } else {
            // Get user's badges
            $userBadges = $db->fetchAll(
                "SELECT ub.*, b.name, b.description, b.icon, b.rarity, b.points_required
                 FROM user_badges ub
                 JOIN badges b ON ub.badge_id = b.id
                 WHERE ub.user_id = ?
                 ORDER BY ub.earned_at DESC",
                [$userId]
            );
            
            echo json_encode(['success' => true, 'data' => $userBadges]);
        }
        break;
        
    case 'POST':
        // Admin creating a new badge
        requireRole(['admin']);
        $data = json_decode(file_get_contents('php://input'), true);
        $name = $data['name'] ?? '';
        $description = $data['description'] ?? '';
        $icon = $data['icon'] ?? '🏆';
        $rarity = $data['rarity'] ?? 'common';
        $pointsRequired = $data['pointsRequired'] ?? 0;
        $conditionType = $data['conditionType'] ?? 'points';
        $conditionValue = $data['conditionValue'] ?? 0;
        
        if (empty($name) || empty($description)) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Name and description are required']);
            exit();
        }
        
        $db->query(
            "INSERT INTO badges (name, description, icon, rarity, points_required, condition_type, condition_value) 
             VALUES (?, ?, ?, ?, ?, ?, ?)",
            [$name, $description, $icon, $rarity, $pointsRequired, $conditionType, $conditionValue]
        );
        
        echo json_encode(['success' => true, 'message' => 'Badge created successfully']);
        break;
        
    default:
        http_response_code(405);
        echo json_encode(['success' => false, 'message' => 'Method not allowed']);
}

