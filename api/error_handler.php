<?php
// Set headers first before any output
if (!headers_sent()) {
    header('Content-Type: application/json');
    header('Access-Control-Allow-Origin: *');
    header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
    header('Access-Control-Allow-Headers: Content-Type, Authorization');
}

// Custom error handler to return JSON errors
function handleError($errno, $errstr, $errfile, $errline) {
    if (!(error_reporting() & $errno)) {
        return false;
    }
    
    // Don't handle errors if headers already sent
    if (headers_sent()) {
        return false;
    }
    
    http_response_code(500);
    
    $error = [
        'success' => false,
        'message' => $errstr,
        'error' => $errstr,
        'file' => basename($errfile),
        'line' => $errline
    ];
    
    echo json_encode($error);
    error_log("PHP Error [$errno]: $errstr in $errfile on line $errline");
    exit();
}

function handleException($exception) {
    // Don't handle if headers already sent
    if (headers_sent()) {
        return;
    }
    
    http_response_code(500);
    
    $error = [
        'success' => false,
        'message' => $exception->getMessage(),
        'error' => $exception->getMessage()
    ];
    
    echo json_encode($error);
    error_log("Uncaught Exception: " . $exception->getMessage() . " in " . $exception->getFile() . " on line " . $exception->getLine());
    exit();
}

set_error_handler('handleError', E_ALL);
set_exception_handler('handleException');

