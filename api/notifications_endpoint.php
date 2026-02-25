<?php
require_once 'auth.php';
require_once 'database.php';

global $db;
$method = $_SERVER['REQUEST_METHOD'];
$user = requireAuth();
$userId = $user['user_id'];

switch ($method) {
    case 'GET':
        // Get user notifications
        $unreadOnly = $_GET['unread'] ?? false;
        $limit = $_GET['limit'] ?? 50;
        
        $sql = "SELECT * FROM notifications WHERE user_id = ?";
        $params = [$userId];
        
        if ($unreadOnly) {
            $sql .= " AND is_read = 0";
        }
        
        $sql .= " ORDER BY created_at DESC LIMIT ?";
        $params[] = (int)$limit;
        
        $notifications = $db->fetchAll($sql, $params);
        
        // Get unread count
        $unreadCount = $db->fetchOne(
            "SELECT COUNT(*) as count FROM notifications WHERE user_id = ? AND is_read = 0",
            [$userId]
        )['count'];
        
        echo json_encode([
            'success' => true,
            'data' => $notifications,
            'unreadCount' => (int)$unreadCount
        ]);
        break;
        
    case 'PUT':
        // Mark notifications as read
        $data = json_decode(file_get_contents('php://input'), true);
        $notificationIds = $data['notificationIds'] ?? [];
        
        if (empty($notificationIds)) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Notification IDs are required']);
            exit();
        }
        
        $placeholders = implode(',', array_fill(0, count($notificationIds), '?'));
        $db->query(
            "UPDATE notifications SET is_read = 1 WHERE id IN ($placeholders) AND user_id = ?",
            array_merge($notificationIds, [$userId])
        );
        
        echo json_encode(['success' => true, 'message' => 'Notifications marked as read']);
        break;
        
    case 'DELETE':
        // Delete notification
        $notificationId = $_GET['id'] ?? null;
        
        if (!$notificationId) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Notification ID is required']);
            exit();
        }
        
        $db->query("DELETE FROM notifications WHERE id = ? AND user_id = ?", [$notificationId, $userId]);
        
        echo json_encode(['success' => true, 'message' => 'Notification deleted']);
        break;
        
    default:
        http_response_code(405);
        echo json_encode(['success' => false, 'message' => 'Method not allowed']);
}

