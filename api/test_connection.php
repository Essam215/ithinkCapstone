<?php
// Test database connection and API setup
require_once 'config.php';
require_once 'database.php';

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

$results = [
    'database' => false,
    'database_message' => '',
    'api' => true,
    'api_message' => 'API is accessible'
];

try {
    global $db;
    $test = $db->fetchOne("SELECT 1 as test");
    if ($test && $test['test'] == 1) {
        $results['database'] = true;
        $results['database_message'] = 'Database connection successful';
    } else {
        $results['database_message'] = 'Database query failed';
    }
} catch (Exception $e) {
    $results['database_message'] = 'Database error: ' . $e->getMessage();
}

// Test if users table exists
try {
    global $db;
    $table = $db->fetchOne("SHOW TABLES LIKE 'users'");
    if ($table) {
        $results['users_table'] = true;
        $results['users_table_message'] = 'Users table exists';
    } else {
        $results['users_table'] = false;
        $results['users_table_message'] = 'Users table does not exist. Please run database/schema.sql';
    }
} catch (Exception $e) {
    $results['users_table'] = false;
    $results['users_table_message'] = 'Error checking users table: ' . $e->getMessage();
}

echo json_encode($results, JSON_PRETTY_PRINT);






