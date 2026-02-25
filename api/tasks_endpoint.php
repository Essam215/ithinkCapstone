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
        // Get all tasks or specific task
        $taskId = $_GET['id'] ?? null;
        
        if ($taskId) {
            // Get single task with submissions
            $task = $db->fetchOne(
                "SELECT t.*, tc.name as category_name, 
                        u1.first_name as created_by_name, u1.last_name as created_by_lastname,
                        u2.first_name as assigned_to_name, u2.last_name as assigned_to_lastname
                 FROM tasks t
                 LEFT JOIN task_categories tc ON t.category_id = tc.id
                 LEFT JOIN users u1 ON t.created_by = u1.id
                 LEFT JOIN users u2 ON t.assigned_to = u2.id
                 WHERE t.id = ?",
                [$taskId]
            );
            
            if (!$task) {
                http_response_code(404);
                echo json_encode(['success' => false, 'message' => 'Task not found']);
                exit();
            }
            
            // Get attachments
            $attachments = $db->fetchAll(
                "SELECT * FROM task_attachments WHERE task_id = ?",
                [$taskId]
            );
            
            // Get user's submission if exists
            $submission = $db->fetchOne(
                "SELECT * FROM task_submissions WHERE task_id = ? AND user_id = ?",
                [$taskId, $userId]
            );
            
            $task['attachments'] = $attachments;
            $task['submission'] = $submission;
            
            echo json_encode(['success' => true, 'data' => $task]);
        } else {
            // Get all tasks
            $status = $_GET['status'] ?? null;
            $category = $_GET['category'] ?? null;
            
            $sql = "SELECT t.*, tc.name as category_name,
                           u1.first_name as created_by_name, u1.last_name as created_by_lastname
                    FROM tasks t
                    LEFT JOIN task_categories tc ON t.category_id = tc.id
                    LEFT JOIN users u1 ON t.created_by = u1.id
                    WHERE 1=1";
            $params = [];
            
            if ($status) {
                $sql .= " AND t.status = ?";
                $params[] = $status;
            }
            
            if ($category) {
                $sql .= " AND tc.name = ?";
                $params[] = $category;
            }
            
            $sql .= " ORDER BY t.created_at DESC";
            
            $tasks = $db->fetchAll($sql, $params);
            echo json_encode(['success' => true, 'data' => $tasks]);
        }
        break;
        
    case 'POST':
        // Check if this is a file upload (multipart/form-data) or JSON
        $contentType = $_SERVER['CONTENT_TYPE'] ?? '';
        $isMultipart = strpos($contentType, 'multipart/form-data') !== false;
        
        if ($isMultipart) {
            // Handle file upload (task submission)
            if ($userRole === 'student' || $userRole === 'php') {
                $taskId = $_POST['taskId'] ?? null;
                $submissionText = $_POST['submissionText'] ?? '';
                
                if (!$taskId || empty($submissionText)) {
                    http_response_code(400);
                    echo json_encode(['success' => false, 'message' => 'Task ID and submission text are required']);
                    exit();
                }
                
                // Check if task exists
                $task = $db->fetchOne("SELECT id FROM tasks WHERE id = ?", [$taskId]);
                if (!$task) {
                    http_response_code(404);
                    echo json_encode(['success' => false, 'message' => 'Task not found']);
                    exit();
                }
                
                // Create submission
                $db->query(
                    "INSERT INTO task_submissions (task_id, user_id, submission_text, status) VALUES (?, ?, ?, 'pending')",
                    [$taskId, $userId, $submissionText]
                );
                
                $submissionId = $db->lastInsertId();
                
                // Handle file uploads
                if (isset($_FILES['attachments'])) {
                    $files = $_FILES['attachments'];
                    if (is_array($files['name'])) {
                        foreach ($files['name'] as $key => $name) {
                            if ($files['error'][$key] === UPLOAD_ERR_OK) {
                                $file = [
                                    'name' => $files['name'][$key],
                                    'type' => $files['type'][$key],
                                    'tmp_name' => $files['tmp_name'][$key],
                                    'error' => $files['error'][$key],
                                    'size' => $files['size'][$key]
                                ];
                                
                                $uploadResult = Utils::uploadFile($file, 'task_attachments/');
                                if ($uploadResult['success']) {
                                    $db->query(
                                        "INSERT INTO task_attachments (task_submission_id, file_name, file_path, file_type, file_size, uploaded_by) 
                                         VALUES (?, ?, ?, ?, ?, ?)",
                                        [$submissionId, $uploadResult['file_name'], $uploadResult['file_path'], 
                                         $uploadResult['file_type'], $uploadResult['file_size'], $userId]
                                    );
                                }
                            }
                        }
                    } elseif ($files['error'] === UPLOAD_ERR_OK) {
                        $uploadResult = Utils::uploadFile($files, 'task_attachments/');
                        if ($uploadResult['success']) {
                            $db->query(
                                "INSERT INTO task_attachments (task_submission_id, file_name, file_path, file_type, file_size, uploaded_by) 
                                 VALUES (?, ?, ?, ?, ?, ?)",
                                [$submissionId, $uploadResult['file_name'], $uploadResult['file_path'], 
                                 $uploadResult['file_type'], $uploadResult['file_size'], $userId]
                            );
                        }
                    }
                }
                
                // Update task status
                $db->query("UPDATE tasks SET status = 'in-progress', assigned_to = ? WHERE id = ?", [$userId, $taskId]);
                
                // Create notification for admins
                $admins = $db->fetchAll("SELECT id FROM users WHERE role = 'admin'");
                foreach ($admins as $admin) {
                    Utils::createNotification(
                        $admin['id'],
                        'New Task Submission',
                        "A new task submission has been submitted and needs review.",
                        'info',
                        "/admin/tasks/$taskId"
                    );
                }
                
                echo json_encode(['success' => true, 'message' => 'Task submitted successfully']);
            } else {
                http_response_code(403);
                echo json_encode(['success' => false, 'message' => 'Forbidden']);
            }
        } else {
            // Handle JSON request
            $data = json_decode(file_get_contents('php://input'), true);
            
            if ($userRole === 'admin') {
                // Admin creating a task
                $title = $data['title'] ?? '';
                $description = $data['description'] ?? '';
                $categoryId = $data['categoryId'] ?? null;
                $points = $data['points'] ?? 0;
                $dueDate = $data['dueDate'] ?? null;
                
                if (empty($title) || empty($description) || !$categoryId) {
                    http_response_code(400);
                    echo json_encode(['success' => false, 'message' => 'Title, description, and category are required']);
                    exit();
                }
                
                $db->query(
                    "INSERT INTO tasks (title, description, category_id, points, due_date, created_by, status) 
                     VALUES (?, ?, ?, ?, ?, ?, 'pending')",
                    [$title, $description, $categoryId, $points, $dueDate, $userId]
                );
                
                $taskId = $db->lastInsertId();
                
                echo json_encode(['success' => true, 'message' => 'Task created successfully', 'data' => ['taskId' => $taskId]]);
            } else {
                http_response_code(403);
                echo json_encode(['success' => false, 'message' => 'Forbidden']);
            }
        }
        break;
        
    case 'PUT':
        // Update task (admin only for editing, students for their submissions)
        requireRole(['admin']);
        $data = json_decode(file_get_contents('php://input'), true);
        $taskId = $data['taskId'] ?? null;
        
        if (!$taskId) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Task ID is required']);
            exit();
        }
        
        $title = $data['title'] ?? null;
        $description = $data['description'] ?? null;
        $categoryId = $data['categoryId'] ?? null;
        $points = $data['points'] ?? null;
        $dueDate = $data['dueDate'] ?? null;
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
        if ($points !== null) {
            $updates[] = "points = ?";
            $params[] = $points;
        }
        if ($dueDate !== null) {
            $updates[] = "due_date = ?";
            $params[] = $dueDate;
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
        
        $params[] = $taskId;
        $sql = "UPDATE tasks SET " . implode(', ', $updates) . " WHERE id = ?";
        $db->query($sql, $params);
        
        echo json_encode(['success' => true, 'message' => 'Task updated successfully']);
        break;
        
    default:
        http_response_code(405);
        echo json_encode(['success' => false, 'message' => 'Method not allowed']);
}

