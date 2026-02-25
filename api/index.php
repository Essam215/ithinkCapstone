<?php
// API Router
require_once 'config.php';

try {
    $requestUri = $_SERVER['REQUEST_URI'];
    $requestMethod = $_SERVER['REQUEST_METHOD'];

    // Remove query string
    $path = parse_url($requestUri, PHP_URL_PATH);
    $path = str_replace('/api', '', $path);
    $path = trim($path, '/');

    // Route to appropriate endpoint
    $routes = [
        'auth' => 'auth_endpoint.php',
        'tasks' => 'tasks_endpoint.php',
        'task-review' => 'task_review_endpoint.php',
        'events' => 'events_endpoint.php',
        'event-applications' => 'event_applications_endpoint.php',
        'admin' => 'admin_endpoint.php',
        'php-applications' => 'php_applications_endpoint.php',
        'notifications' => 'notifications_endpoint.php',
        'messages' => 'messages_endpoint.php',
        'badges' => 'badges_endpoint.php',
        'leaderboard' => 'leaderboard_endpoint.php',
        'categories' => 'categories_endpoint.php',
        'calendar' => 'calendar_endpoint.php',
    ];

    $routeParts = explode('/', $path);
    $route = $routeParts[0] ?? '';

    if (empty($route) || !isset($routes[$route])) {
        http_response_code(404);
        echo json_encode(['success' => false, 'message' => 'Endpoint not found']);
        exit();
    }

    if (!file_exists(__DIR__ . '/' . $routes[$route])) {
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => 'Endpoint file not found: ' . $routes[$route]]);
        exit();
    }

    require_once $routes[$route];
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Server error: ' . $e->getMessage()]);
    error_log("API Router Error: " . $e->getMessage());
}

