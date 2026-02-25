<?php
require_once 'auth.php';
require_once 'utils.php';
require_once 'database.php';

global $db;
$method = $_SERVER['REQUEST_METHOD'];
$user = requireRole(['admin']); // Only admins can review tasks
$adminId = $user['user_id'];

switch ($method) {
    case 'GET':
        // Get pending task submissions
        $status = $_GET['status'] ?? 'pending';
        
        $submissions = $db->fetchAll(
            "SELECT ts.*, t.title as task_title, t.points as task_points,
                    u.first_name, u.last_name, u.email,
                    admin.first_name as reviewed_by_name
             FROM task_submissions ts
             JOIN tasks t ON ts.task_id = t.id
             JOIN users u ON ts.user_id = u.id
             LEFT JOIN users admin ON ts.reviewed_by = admin.id
             WHERE ts.status = ?
             ORDER BY ts.created_at DESC",
            [$status]
        );
        
        // Get attachments for each submission
        foreach ($submissions as &$submission) {
            $submission['attachments'] = $db->fetchAll(
                "SELECT * FROM task_attachments WHERE task_submission_id = ?",
                [$submission['id']]
            );
        }
        
        echo json_encode(['success' => true, 'data' => $submissions]);
        break;
        
    case 'POST':
        // Approve or reject task submission
        $data = json_decode(file_get_contents('php://input'), true);
        $submissionId = $data['submissionId'] ?? null;
        $action = $data['action'] ?? ''; // 'approve' or 'reject'
        $feedback = $data['feedback'] ?? '';
        $pointsAwarded = $data['pointsAwarded'] ?? null;
        
        if (!$submissionId || !in_array($action, ['approve', 'reject'])) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Invalid request']);
            exit();
        }
        
        // Get submission
        $submission = $db->fetchOne(
            "SELECT * FROM task_submissions WHERE id = ?",
            [$submissionId]
        );
        
        if (!$submission) {
            http_response_code(404);
            echo json_encode(['success' => false, 'message' => 'Submission not found']);
            exit();
        }
        
        if ($action === 'approve') {
            // If points not specified, use task default points
            if ($pointsAwarded === null) {
                $task = $db->fetchOne("SELECT points FROM tasks WHERE id = ?", [$submission['task_id']]);
                $pointsAwarded = $task['points'];
            }
            
            // Update submission
            $db->query(
                "UPDATE task_submissions SET status = 'approved', feedback = ?, points_awarded = ?, reviewed_by = ?, reviewed_at = NOW() WHERE id = ?",
                [$feedback, $pointsAwarded, $adminId, $submissionId]
            );
            
            // Update user points
            $db->query(
                "UPDATE users SET points = points + ? WHERE id = ?",
                [$pointsAwarded, $submission['user_id']]
            );
            
            // Update user rank
            Utils::updateUserRank($submission['user_id']);
            
            // Check and award badges
            Utils::checkAndAwardBadges($submission['user_id']);
            
            // Update task status
            $db->query("UPDATE tasks SET status = 'approved' WHERE id = ?", [$submission['task_id']]);
            
            // Create notification
            Utils::createNotification(
                $submission['user_id'],
                'Task Approved',
                "Your task submission has been approved! You earned {$pointsAwarded} points." . ($feedback ? "\n\nFeedback: {$feedback}" : ''),
                'success',
                "/tasks/{$submission['task_id']}"
            );
            
            // Send email notification
            $student = $db->fetchOne("SELECT email, first_name FROM users WHERE id = ?", [$submission['user_id']]);
            if ($student) {
                $emailBody = "Hi {$student['first_name']},\n\nYour task submission has been approved! You earned {$pointsAwarded} points.";
                if ($feedback) {
                    $emailBody .= "\n\nFeedback: {$feedback}";
                }
                Utils::sendEmail($student['email'], 'Task Approved', $emailBody);
            }
            
            echo json_encode(['success' => true, 'message' => 'Task approved successfully']);
        } else {
            // Reject
            $db->query(
                "UPDATE task_submissions SET status = 'rejected', feedback = ?, reviewed_by = ?, reviewed_at = NOW() WHERE id = ?",
                [$feedback, $adminId, $submissionId]
            );
            
            // Update task status
            $db->query("UPDATE tasks SET status = 'rejected' WHERE id = ?", [$submission['task_id']]);
            
            // Create notification
            Utils::createNotification(
                $submission['user_id'],
                'Task Rejected',
                "Your task submission has been rejected." . ($feedback ? "\n\nFeedback: {$feedback}" : ''),
                'error',
                "/tasks/{$submission['task_id']}"
            );
            
            // Send email notification
            $student = $db->fetchOne("SELECT email, first_name FROM users WHERE id = ?", [$submission['user_id']]);
            if ($student) {
                $emailBody = "Hi {$student['first_name']},\n\nYour task submission has been rejected.";
                if ($feedback) {
                    $emailBody .= "\n\nFeedback: {$feedback}";
                }
                Utils::sendEmail($student['email'], 'Task Rejected', $emailBody);
            }
            
            echo json_encode(['success' => true, 'message' => 'Task rejected']);
        }
        break;
        
    default:
        http_response_code(405);
        echo json_encode(['success' => false, 'message' => 'Method not allowed']);
}

