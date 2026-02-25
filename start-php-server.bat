@echo off
echo Starting PHP Backend Server...
echo.
echo Make sure you have:
echo 1. PHP installed and in your PATH
echo 2. MySQL running
echo 3. Database 'peer_helpers_program' created
echo 4. Tables imported from database/schema.sql
echo.
cd api
echo Server will be available at: http://localhost:8000
echo.
php -S localhost:8000 router.php
pause

