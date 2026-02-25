# MVP Mode - Quick Start (No Setup Required!)

🎉 **The application is now in MVP Mode** - you can use it immediately without any database or backend setup!

## 🚀 Quick Login

Just go to the login page and use one of these demo accounts:

### Admin Account
- **Email:** `admin@school.edu`
- **Password:** `admin123`
- **Access:** Full admin dashboard, task review, event management

### Student Account  
- **Email:** `student@school.edu`
- **Password:** `student123`
- **Access:** Submit tasks, apply to events, view leaderboard

### PHP Member Account
- **Email:** `php@school.edu`
- **Password:** `php123`
- **Access:** PHP member features

## ✨ What Works in MVP Mode

✅ **Login/Register** - No database needed!
✅ **Dashboard** - View stats and activities
✅ **Tasks** - Browse, view, and submit tasks
✅ **Events** - Browse and apply to events
✅ **Leaderboard** - View rankings
✅ **Notifications** - See notifications
✅ **Admin Dashboard** - Full admin interface
✅ **Profile** - View and edit profile
✅ **Dark Mode** - Toggle theme
✅ **Responsive Design** - Works on all devices

## 🎯 How to Use

1. **Start the frontend:**
   ```bash
   npm run dev
   ```

2. **Go to:** `http://localhost:5173`

3. **Login** with one of the demo accounts above

4. **That's it!** No database, no PHP server, no setup needed!

## 📝 Registration

You can also register new accounts - they'll work for the current session. New users are created as students by default.

## 🔄 Switching to Real Backend

When you're ready to use the real PHP backend:

1. Set up the database (see `QUICK_START.md`)
2. Start PHP server (see `QUICK_START.md`)
3. Open `src/services/authService.ts`
4. Change `const MVP_MODE = true;` to `const MVP_MODE = false;`
5. Do the same in other service files

## 🎨 Features Available

- **Tasks:** Submit tasks with file uploads (mock mode)
- **Events:** Apply to events (mock mode)
- **Admin:** View statistics, manage tasks/events (mock data)
- **Notifications:** See notifications
- **Leaderboard:** View rankings
- **Badges:** View badges
- **Profile:** Edit profile

Everything works, but uses mock data that doesn't persist between page refreshes (except user login which is stored in localStorage).

## 💡 Tips

- Login persists in localStorage
- Mock data resets on page refresh
- All UI features are fully functional
- Perfect for demos and testing!

Enjoy testing your MVP! 🚀






