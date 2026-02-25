<?php
require_once 'auth.php';
require_once 'utils.php';
require_once 'database.php';

global $db;
$method = $_SERVER['REQUEST_METHOD'];
$user = requireRole(['admin']); // Only admins
$adminId = $user['user_id'];

switch ($method) {
    case 'GET':
        $action = $_GET['action'] ?? '';
        
        if ($action === 'statistics') {
            // Get statistics
            $stats = [
                'totalUsers' => $db->fetchOne("SELECT COUNT(*) as count FROM users WHERE role IN ('student', 'php')")['count'],
                'totalAdmins' => $db->fetchOne("SELECT COUNT(*) as count FROM users WHERE role = 'admin'")['count'],
                'totalPHP' => $db->fetchOne("SELECT COUNT(*) as count FROM users WHERE role = 'php'")['count'],
                'pendingTasks' => $db->fetchOne("SELECT COUNT(*) as count FROM task_submissions WHERE status = 'pending'")['count'],
                'pendingEvents' => $db->fetchOne("SELECT COUNT(*) as count FROM event_applications WHERE status = 'pending'")['count'],
                'pendingPHPApplications' => $db->fetchOne("SELECT COUNT(*) as count FROM php_applications WHERE status = 'pending'")['count'],
                'totalTasks' => $db->fetchOne("SELECT COUNT(*) as count FROM tasks")['count'],
                'totalEvents' => $db->fetchOne("SELECT COUNT(*) as count FROM events")['count'],
                'totalPointsAwarded' => $db->fetchOne("SELECT SUM(points_awarded) as total FROM task_submissions WHERE status = 'approved'")['total'] ?? 0,
            ];
            
            echo json_encode(['success' => true, 'data' => $stats]);
        } elseif ($action === 'php_members') {
            // Get PHP members
            $members = $db->fetchAll(
                "SELECT id, email, first_name, last_name, points, rank, avatar, created_at
                 FROM users
                 WHERE role = 'php'
                 ORDER BY points DESC"
            );
            
            echo json_encode(['success' => true, 'data' => $members]);
        } elseif ($action === 'students') {
            // Get all students
            $students = $db->fetchAll(
                "SELECT id, email, first_name, last_name, points, rank, avatar, created_at
                 FROM users
                 WHERE role = 'student'
                 ORDER BY points DESC"
            );
            
            echo json_encode(['success' => true, 'data' => $students]);
        } else {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Invalid action']);
        }
        break;
        
    default:
        http_response_code(405);
        echo json_encode(['success' => false, 'message' => 'Method not allowed']);
}

