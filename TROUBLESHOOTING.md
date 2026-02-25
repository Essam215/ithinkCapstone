# Troubleshooting Registration Issues

If registration is always failing, follow these steps:

## Step 1: Check if PHP Backend is Running

1. **Start PHP server** (if not using Apache/Nginx):
   ```bash
   cd api
   php -S localhost:8000
   ```

2. **Test the API connection**:
   Open your browser and go to:
   ```
   http://localhost/api/test_connection.php
   ```
   
   Or if using PHP built-in server:
   ```
   http://localhost:8000/test_connection.php
   ```

   You should see a JSON response indicating if the database connection is working.

## Step 2: Check Database Setup

1. **Verify database exists**:
   ```sql
   mysql -u root -p
   SHOW DATABASES;
   ```

2. **Check if tables exist**:
   ```sql
   USE peer_helpers_program;
   SHOW TABLES;
   ```

3. **If tables don't exist, import the schema**:
   ```bash
   mysql -u root -p peer_helpers_program < database/schema.sql
   ```

## Step 3: Check Database Credentials

Edit `api/config.php` and verify:
```php
define('DB_HOST', 'localhost');
define('DB_USER', 'root');        // Your MySQL username
define('DB_PASS', '');            // Your MySQL password
define('DB_NAME', 'peer_helpers_program');
```

## Step 4: Check Browser Console

1. Open browser Developer Tools (F12)
2. Go to Console tab
3. Try to register again
4. Look for error messages in the console
5. Check the Network tab to see the API request/response

## Step 5: Check PHP Error Logs

Check your PHP error log for detailed error messages. Common locations:
- Windows: `C:\xampp\php\logs\php_error_log` or `C:\wamp\logs\php_error_log`
- Linux: `/var/log/php_errors.log` or `/var/log/apache2/error.log`
- Mac: Check your PHP installation directory

## Step 6: Test API Endpoint Directly

Use a tool like Postman or curl to test the API:

```bash
curl -X POST http://localhost/api/auth \
  -H "Content-Type: application/json" \
  -d '{
    "action": "register",
    "email": "test@example.com",
    "password": "test123",
    "firstName": "Test",
    "lastName": "User"
  }'
```

## Step 7: Common Issues and Solutions

### Issue: "Database connection failed"
**Solution**: 
- Check MySQL is running
- Verify database credentials in `api/config.php`
- Make sure database `peer_helpers_program` exists

### Issue: "Users table does not exist"
**Solution**: 
- Import the database schema: `mysql -u root -p peer_helpers_program < database/schema.sql`

### Issue: CORS errors in browser console
**Solution**: 
- Make sure CORS headers are set in `api/config.php`
- Check if PHP server is running
- Verify API URL in frontend matches backend URL

### Issue: "Network Error" or "Failed to fetch"
**Solution**:
- Check if PHP server is running
- Verify API URL in `src/services/api.ts`
- Check Vite proxy configuration in `vite.config.ts`
- Make sure ports don't conflict

### Issue: API returns 404
**Solution**:
- Check if `api/index.php` exists
- Verify `.htaccess` file is present (for Apache)
- Check web server configuration

## Step 8: Enable Detailed Error Messages

Temporarily enable detailed errors in `api/config.php`:
```php
error_reporting(E_ALL);
ini_set('display_errors', 1);
```

**Important**: Disable this in production!

## Step 9: Check File Permissions

Make sure PHP can write to error logs:
```bash
# Linux/Mac
chmod 755 api
chmod 644 api/*.php

# Windows - Check folder permissions in Properties > Security
```

## Step 10: Verify API Route

Check if the API router is working:
1. Visit `http://localhost/api/test_connection.php` directly
2. If it works, the API is accessible
3. If it doesn't, check your web server configuration

## Still Having Issues?

1. **Check the browser console** for detailed error messages
2. **Check PHP error logs** for server-side errors
3. **Test the API directly** with Postman or curl
4. **Verify database connection** using `test_connection.php`
5. **Check network requests** in browser Developer Tools > Network tab

## Quick Debug Checklist

- [ ] PHP server is running
- [ ] Database is running
- [ ] Database `peer_helpers_program` exists
- [ ] Tables are imported (run `schema.sql`)
- [ ] Database credentials are correct in `api/config.php`
- [ ] API is accessible (test with `test_connection.php`)
- [ ] CORS headers are set
- [ ] Browser console shows detailed errors
- [ ] Network tab shows API request/response






