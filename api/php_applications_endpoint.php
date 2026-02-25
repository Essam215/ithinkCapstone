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
        if ($userRole === 'admin') {
            // Admin viewing all applications
            $status = $_GET['status'] ?? 'pending';
            
            $applications = $db->fetchAll(
                "SELECT pa.*, u.id as user_id, u.email, u.first_name, u.last_name, u.points, u.avatar,
                        admin.first_name as reviewed_by_name, admin.last_name as reviewed_by_lastname
                 FROM php_applications pa
                 JOIN users u ON pa.user_id = u.id
                 LEFT JOIN users admin ON pa.reviewed_by = admin.id
                 WHERE pa.status = ?
                 ORDER BY pa.created_at DESC",
                [$status]
            );
            
            echo json_encode(['success' => true, 'data' => $applications]);
        } else {
            // User viewing their own application
            $application = $db->fetchOne(
                "SELECT * FROM php_applications WHERE user_id = ? ORDER BY created_at DESC LIMIT 1",
                [$userId]
            );
            
            echo json_encode(['success' => true, 'data' => $application]);
        }
        break;
        
    case 'POST':
        if ($userRole === 'admin') {
            // Admin approving/rejecting application
            $data = json_decode(file_get_contents('php://input'), true);
            $applicationId = $data['applicationId'] ?? null;
            $action = $data['action'] ?? ''; // 'approve' or 'reject'
            $rejectionReason = $data['rejectionReason'] ?? '';
            
            if (!$applicationId || !in_array($action, ['approve', 'reject'])) {
                http_response_code(400);
                echo json_encode(['success' => false, 'message' => 'Invalid request']);
                exit();
            }
            
            $application = $db->fetchOne(
                "SELECT * FROM php_applications WHERE id = ?",
                [$applicationId]
            );
            
            if (!$application) {
                http_response_code(404);
                echo json_encode(['success' => false, 'message' => 'Application not found']);
                exit();
            }
            
            if ($action === 'approve') {
                // Update application status
                $db->query(
                    "UPDATE php_applications SET status = 'approved', reviewed_by = ?, reviewed_at = NOW() WHERE id = ?",
                    [$userId, $applicationId]
                );
                
                // Update user role to PHP
                $db->query("UPDATE users SET role = 'php' WHERE id = ?", [$application['user_id']]);
                
                // Create notification
                Utils::createNotification(
                    $application['user_id'],
                    'PHP Application Approved',
                    "Congratulations! Your PHP application has been approved. You are now a Peer Helper Program member!",
                    'success',
                    '/profile'
                );
                
                // Send email
                $student = $db->fetchOne("SELECT email, first_name FROM users WHERE id = ?", [$application['user_id']]);
                if ($student) {
                    Utils::sendEmail(
                        $student['email'],
                        'PHP Application Approved',
                        "Hi {$student['first_name']},\n\nCongratulations! Your PHP application has been approved. You are now a Peer Helper Program member!"
                    );
                }
                
                echo json_encode(['success' => true, 'message' => 'Application approved successfully']);
            } else {
                // Reject
                $db->query(
                    "UPDATE php_applications SET status = 'rejected', reviewed_by = ?, reviewed_at = NOW(), rejection_reason = ? WHERE id = ?",
                    [$userId, $rejectionReason, $applicationId]
                );
                
                // Create notification
                Utils::createNotification(
                    $application['user_id'],
                    'PHP Application Rejected',
                    "Your PHP application has been rejected." . ($rejectionReason ? "\n\nReason: {$rejectionReason}" : ''),
                    'error',
                    '/profile'
                );
                
                // Send email
                $student = $db->fetchOne("SELECT email, first_name FROM users WHERE id = ?", [$application['user_id']]);
                if ($student) {
                    $emailBody = "Hi {$student['first_name']},\n\nYour PHP application has been rejected.";
                    if ($rejectionReason) {
                        $emailBody .= "\n\nReason: {$rejectionReason}";
                    }
                    Utils::sendEmail($student['email'], 'PHP Application Rejected', $emailBody);
                }
                
                echo json_encode(['success' => true, 'message' => 'Application rejected']);
            }
        } else {
            // Student/User applying to be PHP
            $data = json_decode(file_get_contents('php://input'), true);
            $applicationText = $data['applicationText'] ?? '';
            
            if (empty($applicationText)) {
                http_response_code(400);
                echo json_encode(['success' => false, 'message' => 'Application text is required']);
                exit();
            }
            
            // Check if user is already PHP
            $user = $db->fetchOne("SELECT role FROM users WHERE id = ?", [$userId]);
            if ($user['role'] === 'php') {
                http_response_code(400);
                echo json_encode(['success' => false, 'message' => 'You are already a PHP member']);
                exit();
            }
            
            // Check if there's a pending application
            $pending = $db->fetchOne(
                "SELECT id FROM php_applications WHERE user_id = ? AND status = 'pending'",
                [$userId]
            );
            
            if ($pending) {
                http_response_code(400);
                echo json_encode(['success' => false, 'message' => 'You already have a pending application']);
                exit();
            }
            
            // Create application
            $db->query(
                "INSERT INTO php_applications (user_id, application_text, status) VALUES (?, ?, 'pending')",
                [$userId, $applicationText]
            );
            
            // Notify admins
            $admins = $db->fetchAll("SELECT id FROM users WHERE role = 'admin'");
            foreach ($admins as $admin) {
                Utils::createNotification(
                    $admin['id'],
                    'New PHP Application',
                    "A new PHP application has been submitted and needs review.",
                    'info',
                    '/admin/php-applications'
                );
            }
            
            echo json_encode(['success' => true, 'message' => 'Application submitted successfully']);
        }
        break;
        
    default:
        http_response_code(405);
        echo json_encode(['success' => false, 'message' => 'Method not allowed']);
}

