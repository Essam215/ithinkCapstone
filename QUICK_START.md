# Quick Start Guide

## Step 1: Set Up Database

1. **Make sure MySQL is running**

2. **Create the database:**

   ```sql
   mysql -u root -p
   CREATE DATABASE peer_helpers_program;
   ```

3. **Import the schema:**

   ```bash
   mysql -u root -p peer_helpers_program < database/schema.sql
   ```

4. **Update database credentials in `api/config.php`:**
   ```php
   define('DB_USER', 'root');  // Your MySQL username
   define('DB_PASS', '');      // Your MySQL password
   ```

## Step 2: Start PHP Backend Server

### Option A: Using PowerShell (Recommended for Windows)

```powershell
.\start-php-server.ps1
```

### Option B: Using Batch File

```cmd
start-php-server.bat
```

### Option C: Manual Start

```bash
cd api
php -S localhost:8000
```

The PHP server should now be running on `http://localhost:8000`

## Step 3: Start Frontend

In a **new terminal window**:

```bash
npm run dev
```

The frontend should now be running on `http://localhost:5173`

## Step 4: Test the Setup

1. **Test PHP Backend:**
   Open in browser: `http://localhost:8000/check_setup.php`

   You should see JSON with database connection status.

2. **Test Registration:**
   - Go to `http://localhost:5173/register`
   - Fill in the registration form
   - Submit

## Troubleshooting

### "Connection Refused" Error

- Make sure PHP server is running on port 8000
- Check if port 8000 is already in use
- Verify `vite.config.ts` has the correct proxy target

### "Database Connection Failed"

- Check if MySQL is running
- Verify database credentials in `api/config.php`
- Make sure database `peer_helpers_program` exists
- Make sure tables are imported

### "Tables Don't Exist"

- Run: `mysql -u root -p peer_helpers_program < database/schema.sql`

### Port Already in Use

- Change port in `start-php-server.ps1` to a different port (e.g., 8001)
- Update `vite.config.ts` proxy target to match

## Default Admin Login

After importing the database:

- Email: `admin@school.edu`
- Password: `admin123`

**Change this password immediately!**
