<?php
// Router for PHP built-in server
// This file handles routing when using: php -S localhost:8000 router.php

$requestUri = $_SERVER['REQUEST_URI'];
$path = parse_url($requestUri, PHP_URL_PATH);

// Remove leading slash
$path = ltrim($path, '/');

// If it's a direct file request (like check_setup.php, test_connection.php), serve it
if ($path && file_exists(__DIR__ . '/' . $path) && is_file(__DIR__ . '/' . $path) && !is_dir(__DIR__ . '/' . $path)) {
    // Check if it's a PHP file
    if (pathinfo($path, PATHINFO_EXTENSION) === 'php') {
        require __DIR__ . '/' . $path;
        return true;
    }
    return false; // Let PHP serve static files
}

// Route all other requests through index.php
// Remove 'api' prefix if present (for consistency with Vite proxy)
$originalPath = $path;
$path = str_replace('api/', '', $path);
$path = str_replace('api', '', $path);
$path = trim($path, '/');

// If path is empty, default to auth
if (empty($path)) {
    $path = 'auth';
}

// Set the path for index.php to handle (it expects /api/endpoint format)
$_SERVER['REQUEST_URI'] = '/api/' . $path;

// Route through index.php
require __DIR__ . '/index.php';
return true;

