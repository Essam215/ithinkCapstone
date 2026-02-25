<?php
require_once 'auth.php';
require_once 'utils.php';
require_once 'database.php';

global $db;
$method = $_SERVER['REQUEST_METHOD'];
$user = requireAuth();
$userId = $user['user_id'];
$userRole = $user['role'];

switch ($method) {
    case 'GET':
        // Get messages
        if ($userRole === 'admin') {
            // Admin viewing sent messages
            $messages = $db->fetchAll(
                "SELECT m.*, 
                        u1.first_name as recipient_first_name, u1.last_name as recipient_last_name,
                        u2.first_name as sender_first_name, u2.last_name as sender_last_name
                 FROM messages m
                 LEFT JOIN users u1 ON m.recipient_id = u1.id
                 LEFT JOIN users u2 ON m.sender_id = u2.id
                 WHERE m.sender_id = ?
                 ORDER BY m.created_at DESC",
                [$userId]
            );
        } else {
            // User viewing received messages (announcements and personal)
            $messages = $db->fetchAll(
                "SELECT m.*, 
                        u.first_name as sender_first_name, u.last_name as sender_last_name
                 FROM messages m
                 LEFT JOIN users u ON m.sender_id = u.id
                 WHERE (m.recipient_id = ? OR (m.is_announcement = 1 AND m.created_at >= (SELECT created_at FROM users WHERE id = ?)))
                 ORDER BY m.created_at DESC",
                [$userId, $userId]
            );
        }
        
        echo json_encode(['success' => true, 'data' => $messages]);
        break;
        
    case 'POST':
        // Send message (admin only for announcements, anyone for individual messages)
        $data = json_decode(file_get_contents('php://input'), true);
        $subject = $data['subject'] ?? '';
        $message = $data['message'] ?? '';
        $recipientIds = $data['recipientIds'] ?? [];
        $isAnnouncement = $data['isAnnouncement'] ?? false;
        
        if (empty($subject) || empty($message)) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Subject and message are required']);
            exit();
        }
        
        if ($isAnnouncement) {
            // Only admins can send announcements
            if ($userRole !== 'admin') {
                http_response_code(403);
                echo json_encode(['success' => false, 'message' => 'Only admins can send announcements']);
                exit();
            }
            
            // Send to all PHP members
            $phpMembers = $db->fetchAll("SELECT id, email, first_name FROM users WHERE role = 'php'");
            
            foreach ($phpMembers as $member) {
                $db->query(
                    "INSERT INTO messages (sender_id, recipient_id, subject, message, is_announcement) VALUES (?, ?, ?, ?, 1)",
                    [$userId, $member['id'], $subject, $message]
                );
                
                // Create notification
                Utils::createNotification(
                    $member['id'],
                    'New Announcement',
                    $subject,
                    'info',
                    '/messages'
                );
                
                // Send email
                Utils::sendEmail(
                    $member['email'],
                    "Announcement: $subject",
                    "Hi {$member['first_name']},\n\n$message"
                );
            }
            
            echo json_encode(['success' => true, 'message' => 'Announcement sent to all PHP members']);
        } else {
            // Individual messages
            if (empty($recipientIds)) {
                http_response_code(400);
                echo json_encode(['success' => false, 'message' => 'Recipients are required']);
                exit();
            }
            
            foreach ($recipientIds as $recipientId) {
                $db->query(
                    "INSERT INTO messages (sender_id, recipient_id, subject, message, is_announcement) VALUES (?, ?, ?, ?, 0)",
                    [$userId, $recipientId, $subject, $message]
                );
                
                // Create notification
                Utils::createNotification(
                    $recipientId,
                    'New Message',
                    $subject,
                    'info',
                    '/messages'
                );
                
                // Send email
                $recipient = $db->fetchOne("SELECT email, first_name FROM users WHERE id = ?", [$recipientId]);
                if ($recipient) {
                    Utils::sendEmail(
                        $recipient['email'],
                        $subject,
                        "Hi {$recipient['first_name']},\n\n$message"
                    );
                }
            }
            
            echo json_encode(['success' => true, 'message' => 'Messages sent successfully']);
        }
        break;
        
    case 'PUT':
        // Mark message as read
        $data = json_decode(file_get_contents('php://input'), true);
        $messageId = $data['messageId'] ?? null;
        
        if (!$messageId) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Message ID is required']);
            exit();
        }
        
        $db->query(
            "UPDATE messages SET is_read = 1 WHERE id = ? AND recipient_id = ?",
            [$messageId, $userId]
        );
        
        echo json_encode(['success' => true, 'message' => 'Message marked as read']);
        break;
        
    default:
        http_response_code(405);
        echo json_encode(['success' => false, 'message' => 'Method not allowed']);
}

