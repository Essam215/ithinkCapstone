<?php
require_once 'auth.php';
require_once 'database.php';

global $db;
$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {
    case 'GET':
        // Get leaderboard
        $limit = $_GET['limit'] ?? 100;
        
        $leaderboard = $db->fetchAll(
            "SELECT u.id as user_id, u.email, u.first_name, u.last_name, u.points, u.rank, u.avatar,
                    (SELECT COUNT(*) FROM user_badges WHERE user_id = u.id) as badges_count
             FROM users u
             WHERE u.role IN ('student', 'php')
             ORDER BY u.points DESC, u.rank ASC
             LIMIT ?",
            [(int)$limit]
        );
        
        echo json_encode(['success' => true, 'data' => $leaderboard]);
        break;
        
    default:
        http_response_code(405);
        echo json_encode(['success' => false, 'message' => 'Method not allowed']);
}

