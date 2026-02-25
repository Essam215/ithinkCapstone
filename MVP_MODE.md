# MVP Mode - Quick Start (No Database Required)

The application is now running in **MVP Mode** which allows you to test the system without setting up a database or PHP backend.

## Quick Login Credentials

### Admin Account
- **Email:** `admin@school.edu`
- **Password:** `admin123`
- **Role:** Admin (full access to all features)

### Student Account
- **Email:** `student@school.edu`
- **Password:** `student123`
- **Role:** Student (can submit tasks, apply to events)

### PHP Member Account
- **Email:** `php@school.edu`
- **Password:** `php123`
- **Role:** PHP (Peer Helper Program member)

## Features Available in MVP Mode

✅ Login/Register without database
✅ Browse dashboard
✅ View tasks and events
✅ Submit tasks (mock data)
✅ Apply to events (mock data)
✅ View leaderboard (mock data)
✅ Admin dashboard (mock data)
✅ All UI features and navigation

## How It Works

- Authentication is handled in memory (no database needed)
- Data is stored in localStorage
- New registrations are stored in memory during the session
- All API calls are mocked

## Switching to Real Backend

To use the real PHP backend:

1. Open `src/services/authService.ts`
2. Change `const MVP_MODE = true;` to `const MVP_MODE = false;`
3. Set up the database (see QUICK_START.md)
4. Start the PHP server

## Notes

- MVP mode is perfect for testing the UI and frontend features
- Data is not persisted between page refreshes (except user login)
- All features work but use mock data
- No backend setup required!






