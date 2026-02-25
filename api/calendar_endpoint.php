<?php
require_once 'auth.php';
require_once 'database.php';

global $db;
$method = $_SERVER['REQUEST_METHOD'];
$user = requireAuth();

switch ($method) {
    case 'GET':
        // Get events for calendar
        $month = $_GET['month'] ?? date('m');
        $year = $_GET['year'] ?? date('Y');
        
        $events = $db->fetchAll(
            "SELECT e.id, e.title, e.event_date, e.location, e.status, ec.name as category_name, ec.color as category_color,
                    (SELECT COUNT(*) FROM event_applications WHERE event_id = e.id AND status = 'approved') as current_participants,
                    e.max_participants
             FROM events e
             LEFT JOIN event_categories ec ON e.category_id = ec.id
             WHERE MONTH(e.event_date) = ? AND YEAR(e.event_date) = ?
             ORDER BY e.event_date ASC",
            [$month, $year]
        );
        
        // Format events for calendar
        $calendarEvents = [];
        foreach ($events as $event) {
            $date = date('Y-m-d', strtotime($event['event_date']));
            if (!isset($calendarEvents[$date])) {
                $calendarEvents[$date] = [];
            }
            $calendarEvents[$date][] = $event;
        }
        
        echo json_encode(['success' => true, 'data' => $calendarEvents]);
        break;
        
    default:
        http_response_code(405);
        echo json_encode(['success' => false, 'message' => 'Method not allowed']);
}

