<?php
// Simple setup checker - returns JSON with setup status
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

$results = [
    'php_version' => PHP_VERSION,
    'pdo_available' => extension_loaded('pdo'),
    'pdo_mysql_available' => extension_loaded('pdo_mysql'),
    'database' => [
        'connected' => false,
        'message' => '',
        'tables_exist' => false
    ]
];

// Check database connection
try {
    require_once 'config.php';
    require_once 'database.php';
    
    global $db;
    if ($db) {
        $results['database']['connected'] = true;
        $results['database']['message'] = 'Database connection successful';
        
        // Check if users table exists
        $table = $db->fetchOne("SHOW TABLES LIKE 'users'");
        if ($table) {
            $results['database']['tables_exist'] = true;
            $results['database']['message'] .= ' - Tables exist';
        } else {
            $results['database']['message'] .= ' - Tables do not exist. Please run database/schema.sql';
        }
    } else {
        $results['database']['message'] = 'Database connection failed';
    }
} catch (Exception $e) {
    $results['database']['message'] = 'Error: ' . $e->getMessage();
}

echo json_encode($results, JSON_PRETTY_PRINT);






