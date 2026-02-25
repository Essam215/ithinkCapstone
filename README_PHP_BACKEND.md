# Peer Helpers Program - PHP Backend

This is the PHP backend API for the Peer Helpers Program website.

## Features

### Student Features
- Task upload with file attachments (PDF/images)
- View admin feedback on tasks
- Approved tasks earn points (admin-controlled)
- Event applications
- Notification system (in-app and email)
- View leaderboard
- Earn badges for achievements

### Admin Features
- View PHP members and pending applications
- Statistics dashboard
- Approve/reject tasks and events
- Task review with feedback and points control
- Choose attending students (PHP) in events
- Manage new PHP applications
- Send announcements or individual messages
- Event categories management
- Events calendar
- Badge management
- Edit uploaded tasks
- Email notifications

## Setup Instructions

### 1. Database Setup

1. Create a MySQL database:
```sql
mysql -u root -p
CREATE DATABASE peer_helpers_program;
```

2. Import the database schema:
```bash
mysql -u root -p peer_helpers_program < database/schema.sql
```

3. Update database credentials in `api/config.php`:
```php
define('DB_HOST', 'localhost');
define('DB_USER', 'your_username');
define('DB_PASS', 'your_password');
define('DB_NAME', 'peer_helpers_program');
```

### 2. File Uploads

1. Create the uploads directory:
```bash
mkdir -p uploads/task_attachments
mkdir -p uploads/event_attachments
chmod 777 uploads -R
```

### 3. Configuration

Update `api/config.php` with your settings:
- Database credentials
- JWT secret key (change in production!)
- Email configuration (SMTP settings)
- File upload settings

### 4. Web Server Setup

#### Apache
1. Enable mod_rewrite
2. Ensure `.htaccess` files are allowed
3. Point document root to the project directory

#### Nginx
Add this configuration:
```nginx
location /api {
    try_files $uri $uri/ /api/index.php?$query_string;
}
```

### 5. Email Setup

For email notifications to work:
1. Update SMTP settings in `api/config.php`
2. Set up a cron job to process email queue:
```bash
# Run every 5 minutes
*/5 * * * * cd /path/to/project/api && php send_emails.php
```

Or use a task scheduler on Windows.

### 6. Default Admin Account

After importing the database, you can login with:
- Email: `admin@school.edu`
- Password: `admin123` (change this immediately!)

To change the password, update it in the database:
```sql
UPDATE users SET password = '$2y$10$...' WHERE email = 'admin@school.edu';
```

Use PHP's `password_hash()` function to generate the hash.

## API Endpoints

### Authentication
- `POST /api/auth` - Login/Register
- `GET /api/auth` - Get current user

### Tasks
- `GET /api/tasks` - Get all tasks
- `GET /api/tasks?id={id}` - Get task by ID
- `POST /api/tasks` - Create task (admin) or submit task (student)
- `PUT /api/tasks` - Update task (admin)

### Task Review (Admin)
- `GET /api/task-review?status={status}` - Get task submissions
- `POST /api/task-review` - Approve/reject task submission

### Events
- `GET /api/events` - Get all events
- `GET /api/events?id={id}` - Get event by ID
- `POST /api/events` - Create event (admin) or apply to event (student)
- `PUT /api/events` - Update event (admin)

### Event Applications (Admin)
- `GET /api/event-applications?eventId={id}&status={status}` - Get event applications
- `POST /api/event-applications` - Approve/reject event applications

### Admin
- `GET /api/admin?action=statistics` - Get statistics
- `GET /api/admin?action=php_members` - Get PHP members
- `GET /api/admin?action=students` - Get all students

### PHP Applications
- `GET /api/php-applications` - Get PHP applications
- `POST /api/php-applications` - Apply to be PHP or approve/reject (admin)

### Notifications
- `GET /api/notifications` - Get user notifications
- `PUT /api/notifications` - Mark notifications as read
- `DELETE /api/notifications?id={id}` - Delete notification

### Messages
- `GET /api/messages` - Get messages
- `POST /api/messages` - Send message/announcement

### Badges
- `GET /api/badges` - Get user badges
- `GET /api/badges?action=all` - Get all badges
- `POST /api/badges` - Create badge (admin)

### Leaderboard
- `GET /api/leaderboard` - Get leaderboard

### Categories
- `GET /api/categories?type={task|event}` - Get categories
- `POST /api/categories` - Create category (admin)

### Calendar
- `GET /api/calendar?month={month}&year={year}` - Get calendar events

## Authentication

All endpoints except `/api/auth` require authentication. Include the JWT token in the Authorization header:

```
Authorization: Bearer {token}
```

## File Uploads

Task and event file uploads support:
- Images: JPEG, PNG, GIF, WebP
- Documents: PDF, DOC, DOCX
- Max file size: 10MB (configurable in `config.php`)

## Security Notes

1. **Change JWT_SECRET** in production
2. **Change default admin password**
3. **Use HTTPS** in production
4. **Validate file uploads** (already implemented)
5. **Use prepared statements** (already implemented)
6. **Set up proper file permissions** for uploads directory
7. **Configure CORS** properly for production

## Troubleshooting

### Database Connection Error
- Check database credentials in `config.php`
- Ensure MySQL is running
- Verify database exists

### File Upload Errors
- Check uploads directory permissions
- Verify `upload_max_filesize` and `post_max_size` in php.ini
- Check file type restrictions

### Email Not Sending
- Verify SMTP settings
- Check if email queue processor is running
- Check server logs for errors

## Development

For development, you can use PHP's built-in server:
```bash
cd api
php -S localhost:8000
```

Then update the frontend API URL to `http://localhost:8000`.

## Production Deployment

1. Set `error_reporting(0)` and `ini_set('display_errors', 0)` in `config.php`
2. Use a production web server (Apache/Nginx)
3. Set up SSL/HTTPS
4. Configure proper file permissions
5. Set up cron job for email processing
6. Use a proper email service (SendGrid, Mailgun, etc.)
7. Implement proper logging
8. Set up database backups

