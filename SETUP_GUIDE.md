# Peer Helpers Program - Setup Guide

This guide will help you set up the Peer Helpers Program website with PHP backend.

## Prerequisites

- PHP 7.4 or higher
- MySQL 5.7 or higher
- Node.js 16 or higher
- npm or yarn
- Web server (Apache/Nginx) or PHP built-in server

## Step 1: Database Setup

1. Create a MySQL database:
```bash
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

## Step 2: Backend Setup

1. Create uploads directory:
```bash
mkdir -p uploads/task_attachments
mkdir -p uploads/event_attachments
chmod 777 uploads -R  # On Linux/Mac
```

2. Update configuration in `api/config.php`:
   - Database credentials
   - JWT secret (change in production!)
   - Email settings (SMTP)
   - File upload settings

3. Test PHP backend:
```bash
cd api
php -S localhost:8000
```

Visit `http://localhost:8000` to test if the API is working.

## Step 3: Frontend Setup

1. Install dependencies:
```bash
npm install
```

2. Update API URL in `.env` file (create if it doesn't exist):
```
VITE_API_URL=http://localhost/api
```

3. Start development server:
```bash
npm run dev
```

## Step 4: Default Login

After importing the database, you can login with:
- Email: `admin@school.edu`
- Password: `admin123`

**Important**: Change the default password immediately!

## Step 5: Email Setup (Optional)

1. Update SMTP settings in `api/config.php`

2. Set up cron job to process email queue:
```bash
# Linux/Mac - Add to crontab
*/5 * * * * cd /path/to/project/api && php send_emails.php

# Windows - Use Task Scheduler
```

## Step 6: Production Deployment

1. Build frontend:
```bash
npm run build
```

2. Configure web server:
   - Point document root to `dist` folder (frontend)
   - Point `/api` to `api` folder (backend)
   - Enable mod_rewrite (Apache) or configure Nginx

3. Set proper file permissions:
```bash
chmod 755 uploads -R
chmod 644 api/*.php
```

4. Update security settings:
   - Change JWT_SECRET
   - Change default admin password
   - Enable HTTPS
   - Configure CORS properly

## Features Overview

### Student Features
- ✅ Task upload with file attachments
- ✅ View admin feedback
- ✅ Approved tasks earn points
- ✅ Event applications
- ✅ Notification system
- ✅ Leaderboard
- ✅ Badges

### Admin Features
- ✅ View PHP members and applications
- ✅ Statistics dashboard
- ✅ Task review and approval
- ✅ Event management
- ✅ PHP application management
- ✅ Messaging system
- ✅ Badge management
- ✅ Calendar view

## Troubleshooting

### Database Connection Error
- Check database credentials in `api/config.php`
- Ensure MySQL is running
- Verify database exists

### File Upload Errors
- Check uploads directory permissions
- Verify `upload_max_filesize` in php.ini
- Check file type restrictions

### CORS Errors
- Update CORS settings in `api/config.php`
- Check web server configuration

### API Not Working
- Check PHP error logs
- Verify .htaccess is working
- Test API endpoints directly

## Support

For issues or questions, please refer to the main README or contact the development team.

