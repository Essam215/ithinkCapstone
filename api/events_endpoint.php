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
        // Get all events or specific event
        $eventId = $_GET['id'] ?? null;
        $month = $_GET['month'] ?? null;
        $year = $_GET['year'] ?? null;
        
        if ($eventId) {
            // Get single event
            $event = $db->fetchOne(
                "SELECT e.*, ec.name as category_name, ec.color as category_color,
                        u.first_name as created_by_name, u.last_name as created_by_lastname,
                        (SELECT COUNT(*) FROM event_applications WHERE event_id = e.id AND status = 'approved') as current_participants
                 FROM events e
                 LEFT JOIN event_categories ec ON e.category_id = ec.id
                 LEFT JOIN users u ON e.created_by = u.id
                 WHERE e.id = ?",
                [$eventId]
            );
            
            if (!$event) {
                http_response_code(404);
                echo json_encode(['success' => false, 'message' => 'Event not found']);
                exit();
            }
            
            // Get attachments
            $attachments = $db->fetchAll(
                "SELECT * FROM event_attachments WHERE event_id = ?",
                [$eventId]
            );
            
            // Get user's application if exists
            $application = $db->fetchOne(
                "SELECT * FROM event_applications WHERE event_id = ? AND user_id = ?",
                [$eventId, $userId]
            );
            
            // Get approved participants
            $participants = $db->fetchAll(
                "SELECT u.id, u.first_name, u.last_name, u.email, u.avatar
                 FROM event_applications ea
                 JOIN users u ON ea.user_id = u.id
                 WHERE ea.event_id = ? AND ea.status = 'approved'",
                [$eventId]
            );
            
            $event['attachments'] = $attachments;
            $event['application'] = $application;
            $event['participants'] = $participants;
            
            echo json_encode(['success' => true, 'data' => $event]);
        } else {
            // Get all events
            $status = $_GET['status'] ?? null;
            $category = $_GET['category'] ?? null;
            
            $sql = "SELECT e.*, ec.name as category_name, ec.color as category_color,
                           (SELECT COUNT(*) FROM event_applications WHERE event_id = e.id AND status = 'approved') as current_participants
                    FROM events e
                    LEFT JOIN event_categories ec ON e.category_id = ec.id
                    WHERE 1=1";
            $params = [];
            
            if ($status) {
                $sql .= " AND e.status = ?";
                $params[] = $status;
            }
            
            if ($category) {
                $sql .= " AND ec.name = ?";
                $params[] = $category;
            }
            
            if ($month && $year) {
                $sql .= " AND MONTH(e.event_date) = ? AND YEAR(e.event_date) = ?";
                $params[] = $month;
                $params[] = $year;
            }
            
            $sql .= " ORDER BY e.event_date ASC";
            
            $events = $db->fetchAll($sql, $params);
            echo json_encode(['success' => true, 'data' => $events]);
        }
        break;
        
    case 'POST':
        // Create event (admin) or apply to event (student/php)
        $data = json_decode(file_get_contents('php://input'), true);
        
        if ($userRole === 'student' || $userRole === 'php') {
            // Student applying to event
            $eventId = $data['eventId'] ?? null;
            
            if (!$eventId) {
                http_response_code(400);
                echo json_encode(['success' => false, 'message' => 'Event ID is required']);
                exit();
            }
            
            // Check if event exists and has space
            $event = $db->fetchOne(
                "SELECT id, max_participants FROM events WHERE id = ?",
                [$eventId]
            );
            
            if (!$event) {
                http_response_code(404);
                echo json_encode(['success' => false, 'message' => 'Event not found']);
                exit();
            }
            
            // Check if already applied
            $existing = $db->fetchOne(
                "SELECT id FROM event_applications WHERE event_id = ? AND user_id = ?",
                [$eventId, $userId]
            );
            
            if ($existing) {
                http_response_code(400);
                echo json_encode(['success' => false, 'message' => 'You have already applied to this event']);
                exit();
            }
            
            // Create application (pending for admin approval)
            $db->query(
                "INSERT INTO event_applications (event_id, user_id, status) VALUES (?, ?, 'pending')",
                [$eventId, $userId]
            );
            
            // Create notification for admins
            $admins = $db->fetchAll("SELECT id FROM users WHERE role = 'admin'");
            foreach ($admins as $admin) {
                Utils::createNotification(
                    $admin['id'],
                    'New Event Application',
                    "A new event application has been submitted and needs review.",
                    'info',
                    "/admin/events/$eventId"
                );
            }
            
            // Create notification for user
            Utils::createNotification(
                $userId,
                'Event Application Submitted',
                "Your event application has been submitted and is pending approval.",
                'info',
                "/events/$eventId"
            );
            
            echo json_encode(['success' => true, 'message' => 'Event application submitted successfully']);
        } elseif ($userRole === 'admin') {
            // Admin creating an event
            $title = $data['title'] ?? '';
            $description = $data['description'] ?? '';
            $categoryId = $data['categoryId'] ?? null;
            $eventDate = $data['eventDate'] ?? null;
            $location = $data['location'] ?? '';
            $maxParticipants = $data['maxParticipants'] ?? 0;
            $points = $data['points'] ?? 0;
            
            if (empty($title) || empty($description) || !$categoryId || !$eventDate || empty($location)) {
                http_response_code(400);
                echo json_encode(['success' => false, 'message' => 'All required fields must be filled']);
                exit();
            }
            
            $db->query(
                "INSERT INTO events (title, description, category_id, event_date, location, max_participants, points, created_by, status) 
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'upcoming')",
                [$title, $description, $categoryId, $eventDate, $location, $maxParticipants, $points, $userId]
            );
            
            $eventId = $db->lastInsertId();
            
            echo json_encode(['success' => true, 'message' => 'Event created successfully', 'eventId' => $eventId]);
        }
        break;
        
    case 'PUT':
        // Update event (admin only)
        requireRole(['admin']);
        $data = json_decode(file_get_contents('php://input'), true);
        $eventId = $data['eventId'] ?? null;
        
        if (!$eventId) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Event ID is required']);
            exit();
        }
        
        $title = $data['title'] ?? null;
        $description = $data['description'] ?? null;
        $categoryId = $data['categoryId'] ?? null;
        $eventDate = $data['eventDate'] ?? null;
        $location = $data['location'] ?? null;
        $maxParticipants = $data['maxParticipants'] ?? null;
        $points = $data['points'] ?? null;
        $status = $data['status'] ?? null;
        
        $updates = [];
        $params = [];
        
        if ($title !== null) {
            $updates[] = "title = ?";
            $params[] = $title;
        }
        if ($description !== null) {
            $updates[] = "description = ?";
            $params[] = $description;
        }
        if ($categoryId !== null) {
            $updates[] = "category_id = ?";
            $params[] = $categoryId;
        }
        if ($eventDate !== null) {
            $updates[] = "event_date = ?";
            $params[] = $eventDate;
        }
        if ($location !== null) {
            $updates[] = "location = ?";
            $params[] = $location;
        }
        if ($maxParticipants !== null) {
            $updates[] = "max_participants = ?";
            $params[] = $maxParticipants;
        }
        if ($points !== null) {
            $updates[] = "points = ?";
            $params[] = $points;
        }
        if ($status !== null) {
            $updates[] = "status = ?";
            $params[] = $status;
        }
        
        if (empty($updates)) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'No fields to update']);
            exit();
        }
        
        $params[] = $eventId;
        $sql = "UPDATE events SET " . implode(', ', $updates) . " WHERE id = ?";
        $db->query($sql, $params);
        
        echo json_encode(['success' => true, 'message' => 'Event updated successfully']);
        break;
        
    default:
        http_response_code(405);
        echo json_encode(['success' => false, 'message' => 'Method not allowed']);
}

