<?php
require_once 'config.php';
require_once 'database.php';

class Utils {
    
    public static function updateUserRank($userId) {
        global $db;
        
        // Get user's points
        $user = $db->fetchOne("SELECT points FROM users WHERE id = ?", [$userId]);
        if (!$user) return;
        
        // Count how many users have more points
        $rank = $db->fetchOne(
            "SELECT COUNT(*) + 1 as rank FROM users WHERE points > ? AND role IN ('student', 'php')",
            [$user['points']]
        );
        
        // Update user's rank
        $db->query("UPDATE users SET rank = ? WHERE id = ?", [$rank['rank'], $userId]);
    }
    
    public static function checkAndAwardBadges($userId) {
        global $db;
        
        // Get user data
        $user = $db->fetchOne(
            "SELECT points FROM users WHERE id = ?",
            [$userId]
        );
        
        if (!$user) return;
        
        // Get user's completed tasks count
        $completedTasks = $db->fetchOne(
            "SELECT COUNT(*) as count FROM task_submissions WHERE user_id = ? AND status = 'approved'",
            [$userId]
        )['count'];
        
        // Get user's attended events count
        $attendedEvents = $db->fetchOne(
            "SELECT COUNT(*) as count FROM event_applications WHERE user_id = ? AND status = 'approved'",
            [$userId]
        )['count'];
        
        // Get all badges
        $badges = $db->fetchAll("SELECT * FROM badges");
        
        foreach ($badges as $badge) {
            // Check if user already has this badge
            $hasBadge = $db->fetchOne(
                "SELECT id FROM user_badges WHERE user_id = ? AND badge_id = ?",
                [$userId, $badge['id']]
            );
            
            if ($hasBadge) continue;
            
            // Check if user meets badge criteria
            $meetsCriteria = false;
            
            switch ($badge['condition_type']) {
                case 'points':
                    $meetsCriteria = $user['points'] >= $badge['condition_value'];
                    break;
                case 'tasks':
                    $meetsCriteria = $completedTasks >= $badge['condition_value'];
                    break;
                case 'events':
                    $meetsCriteria = $attendedEvents >= $badge['condition_value'];
                    break;
            }
            
            if ($meetsCriteria) {
                // Award badge
                $db->query(
                    "INSERT INTO user_badges (user_id, badge_id) VALUES (?, ?)",
                    [$userId, $badge['id']]
                );
                
                // Create notification
                self::createNotification(
                    $userId,
                    'Badge Earned!',
                    "Congratulations! You earned the '{$badge['name']}' badge.",
                    'success',
                    '/profile'
                );
            }
        }
    }
    
    public static function createNotification($userId, $title, $message, $type = 'info', $link = null) {
        global $db;
        
        $db->query(
            "INSERT INTO notifications (user_id, title, message, type, link) VALUES (?, ?, ?, ?, ?)",
            [$userId, $title, $message, $type, $link]
        );
        
        return $db->lastInsertId();
    }
    
    public static function validateFileUpload($file, $allowedTypes = null, $maxSize = null) {
        if (!isset($file['error']) || $file['error'] !== UPLOAD_ERR_OK) {
            return ['success' => false, 'message' => 'File upload error'];
        }
        
        $maxSize = $maxSize ?? MAX_FILE_SIZE;
        if ($file['size'] > $maxSize) {
            return ['success' => false, 'message' => 'File size exceeds maximum allowed size'];
        }
        
        $fileType = $file['type'];
        $allowedTypes = $allowedTypes ?? array_merge(ALLOWED_IMAGE_TYPES, ALLOWED_DOCUMENT_TYPES);
        
        if (!in_array($fileType, $allowedTypes)) {
            return ['success' => false, 'message' => 'File type not allowed'];
        }
        
        return ['success' => true];
    }
    
    public static function uploadFile($file, $subdirectory = '') {
        $validation = self::validateFileUpload($file);
        if (!$validation['success']) {
            return $validation;
        }
        
        $uploadPath = UPLOAD_DIR . $subdirectory;
        if (!file_exists($uploadPath)) {
            mkdir($uploadPath, 0777, true);
        }
        
        $extension = pathinfo($file['name'], PATHINFO_EXTENSION);
        $fileName = uniqid() . '_' . time() . '.' . $extension;
        $filePath = $uploadPath . $fileName;
        
        if (move_uploaded_file($file['tmp_name'], $filePath)) {
            return [
                'success' => true,
                'file_name' => $file['name'],
                'file_path' => $subdirectory . $fileName,
                'file_type' => $file['type'],
                'file_size' => $file['size']
            ];
        }
        
        return ['success' => false, 'message' => 'Failed to upload file'];
    }
    
    public static function queueEmail($recipientEmail, $subject, $body) {
        global $db;
        
        $db->query(
            "INSERT INTO email_queue (recipient_email, subject, body) VALUES (?, ?, ?)",
            [$recipientEmail, $subject, $body]
        );
        
        return $db->lastInsertId();
    }
    
    public static function sendEmail($recipientEmail, $subject, $body) {
        // In production, use PHPMailer or similar library
        // For now, just queue it
        return self::queueEmail($recipientEmail, $subject, $body);
    }
}

