<?php
require_once 'auth.php';
require_once 'utils.php';
require_once 'database.php';

global $db;
$method = $_SERVER['REQUEST_METHOD'];
$user = requireRole(['admin']); // Only admins can manage event applications
$adminId = $user['user_id'];

switch ($method) {
    case 'GET':
        // Get event applications
        $eventId = $_GET['eventId'] ?? null;
        $status = $_GET['status'] ?? 'pending';
        
        if ($eventId) {
            $applications = $db->fetchAll(
                "SELECT ea.*, u.id as user_id, u.first_name, u.last_name, u.email, u.avatar, u.points
                 FROM event_applications ea
                 JOIN users u ON ea.user_id = u.id
                 WHERE ea.event_id = ? AND ea.status = ?
                 ORDER BY ea.applied_at ASC",
                [$eventId, $status]
            );
        } else {
            $applications = $db->fetchAll(
                "SELECT ea.*, u.id as user_id, u.first_name, u.last_name, u.email, u.avatar,
                        e.title as event_title, e.event_date
                 FROM event_applications ea
                 JOIN users u ON ea.user_id = u.id
                 JOIN events e ON ea.event_id = e.id
                 WHERE ea.status = ?
                 ORDER BY ea.applied_at DESC",
                [$status]
            );
        }
        
        echo json_encode(['success' => true, 'data' => $applications]);
        break;
        
    case 'POST':
        // Approve or reject event applications
        $data = json_decode(file_get_contents('php://input'), true);
        $applicationIds = $data['applicationIds'] ?? [];
        $action = $data['action'] ?? ''; // 'approve' or 'reject'
        
        if (empty($applicationIds) || !in_array($action, ['approve', 'reject'])) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Invalid request']);
            exit();
        }
        
        foreach ($applicationIds as $appId) {
            $application = $db->fetchOne(
                "SELECT ea.*, e.title as event_title, e.points as event_points, e.max_participants,
                        (SELECT COUNT(*) FROM event_applications WHERE event_id = ea.event_id AND status = 'approved') as current_participants
                 FROM event_applications ea
                 JOIN events e ON ea.event_id = e.id
                 WHERE ea.id = ?",
                [$appId]
            );
            
            if (!$application) continue;
            
            if ($action === 'approve') {
                // Check if event is full
                if ($application['current_participants'] >= $application['max_participants']) {
                    continue; // Skip this application
                }
                
                // Update application
                $db->query(
                    "UPDATE event_applications SET status = 'approved', reviewed_by = ?, reviewed_at = NOW() WHERE id = ?",
                    [$adminId, $appId]
                );
                
                // Award points (if event is completed, points are awarded separately)
                // Create notification
                Utils::createNotification(
                    $application['user_id'],
                    'Event Application Approved',
                    "Your application to '{$application['event_title']}' has been approved!",
                    'success',
                    "/events/{$application['event_id']}"
                );
                
                // Send email
                $student = $db->fetchOne("SELECT email, first_name FROM users WHERE id = ?", [$application['user_id']]);
                if ($student) {
                    Utils::sendEmail(
                        $student['email'],
                        'Event Application Approved',
                        "Hi {$student['first_name']},\n\nYour application to '{$application['event_title']}' has been approved!"
                    );
                }
            } else {
                // Reject
                $db->query(
                    "UPDATE event_applications SET status = 'rejected', reviewed_by = ?, reviewed_at = NOW() WHERE id = ?",
                    [$adminId, $appId]
                );
                
                // Create notification
                Utils::createNotification(
                    $application['user_id'],
                    'Event Application Rejected',
                    "Your application to '{$application['event_title']}' has been rejected.",
                    'error',
                    "/events/{$application['event_id']}"
                );
                
                // Send email
                $student = $db->fetchOne("SELECT email, first_name FROM users WHERE id = ?", [$application['user_id']]);
                if ($student) {
                    Utils::sendEmail(
                        $student['email'],
                        'Event Application Rejected',
                        "Hi {$student['first_name']},\n\nYour application to '{$application['event_title']}' has been rejected."
                    );
                }
            }
        }
        
        echo json_encode(['success' => true, 'message' => "Applications {$action}d successfully"]);
        break;
        
    default:
        http_response_code(405);
        echo json_encode(['success' => false, 'message' => 'Method not allowed']);
}

