<<<<<<< HEAD
# Peer Helpers Program (PHP) - Frontend

A modern, responsive React frontend for a school Peer Helpers Program built with **React + Vite**, **TailwindCSS**, **React Router**, and **Framer Motion**.

## 🚀 Features

- **Modern UI/UX**: Elegant design with creamy white background and blue accent theme
- **PHP Members Directory**: Browse and search PHP members with badge filtering (Senior/Junior/Wheeler)
- **Task Management**: View all tasks, manage your tasks, and create new tasks
- **Dark Mode**: Toggle between light and dark themes with localStorage persistence
- **Responsive Design**: Fully responsive across all device sizes with mobile navigation
- **Framer Motion Animations**: Smooth page transitions, hover effects, and animated components
- **TypeScript**: Fully typed for better development experience
- **Backend-Ready**: Service layer with TODO comments for .NET backend integration
- **Header Navigation**: Clean header with navigation links and leaderboard button

## 📁 Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── Button.tsx
│   ├── Card.tsx
│   ├── Layout.tsx
│   ├── Modal.tsx
│   ├── ProtectedRoute.tsx
│   └── Table.tsx
├── context/             # React Context providers
│   ├── AuthContext.tsx
│   └── ThemeContext.tsx
├── data/                # Mock data
│   └── mockData.ts
├── pages/               # Page components
│   ├── Admin.tsx
│   ├── Dashboard.tsx
│   ├── Events.tsx
│   ├── Leaderboard.tsx
│   ├── Login.tsx
│   ├── Profile.tsx
│   ├── Register.tsx
│   ├── Tasks.tsx
│   ├── MyTasks.tsx
│   └── AddTask.tsx
├── services/            # API service layer
│   ├── api.ts           # Axios configuration
│   ├── authService.ts
│   ├── badgeService.ts
│   ├── eventService.ts
│   ├── leaderboardService.ts
│   ├── notificationService.ts
│   ├── taskService.ts
│   └── userService.ts
├── types/               # TypeScript interfaces
│   └── index.ts
├── App.tsx              # Main app component with routing
├── main.tsx             # Entry point
└── index.css            # Global styles
```

## 🛠️ Installation

1. **Install dependencies:**

   ```bash
   npm install
   ```

2. **Start development server:**

   ```bash
   npm run dev
   ```

3. **Build for production:**

   ```bash
   npm run build
   ```

4. **Preview production build:**
   ```bash
   npm run preview
   ```

## 📌 Pages

- **`/login`** - Login page with client-side validation
- **`/register`** - Registration form with validation
- **`/dashboard`** - PHP Members directory with search and filter capabilities
- **`/tasks`** - Browse all PHP tasks
- **`/my-tasks`** - View and manage your assigned tasks
- **`/add-task`** - Create new tasks (admin/PHP members)
- **`/events`** - Browse and apply to events
- **`/leaderboard`** - Animated leaderboard with rankings
- **`/profile`** - View and edit profile, view badges
- **`/admin`** - Admin dashboard for managing PHP members, tasks, and events

## 🔌 Backend Integration

All API calls are set up in the `/services` folder with TODO comments. To integrate with your .NET backend:

1. Update the base URL in `src/services/api.ts` if needed
2. Replace mock implementations in service files with actual API calls
3. Update the proxy configuration in `vite.config.ts` to match your backend URL

Example service integration:

```typescript
// In src/services/taskService.ts
export const getTasks = async (): Promise<Task[]> => {
  // Replace this with:
  return api.get<Task[]>("/tasks").then((res) => res.data);
};
```

## 🎨 Styling

- **TailwindCSS** for utility-first styling
- **Dark mode** support via `dark:` classes
- **Custom colors** defined in `tailwind.config.js`
- **Responsive breakpoints**: sm, md, lg, xl

## 🎭 Animations

Framer Motion is used for:

- Page fade-in transitions
- Button hover/tap effects
- Modal slide-in animations
- Leaderboard entry animations
- Sidebar slide-out on mobile

## 🔐 Authentication

- Auth state managed via Context API
- Tokens stored in localStorage
- Protected routes using `ProtectedRoute` component
- Mock authentication for development (replace with real backend)

## 📝 TypeScript Types

All types are defined in `src/types/index.ts`:

- `User`, `Task`, `Event`, `Badge`, `Notification`, `LeaderboardEntry`
- API response types

## 🚧 Development Notes

- Currently uses mock data from `src/data/mockData.ts`
- All service functions have TODO comments for backend integration
- Authentication is mocked - replace with real backend calls
- Dark mode preference is saved in localStorage

## 📦 Dependencies

- **react** ^18.2.0
- **react-dom** ^18.2.0
- **react-router-dom** ^6.20.0
- **framer-motion** ^10.16.4
- **axios** ^1.6.2
- **lucide-react** ^0.294.0 (icons)
- **tailwindcss** ^3.3.5
- **typescript** ^5.2.2
- **vite** ^5.0.0

## 🎯 Next Steps

1. Connect services to .NET backend API
2. Implement real authentication flow
3. Add form validation libraries if needed
4. Add error boundaries
5. Implement loading states
6. Add unit tests
7. Set up CI/CD pipeline

## 📄 License

This project is part of a Capstone project.
