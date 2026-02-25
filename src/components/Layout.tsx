import { ReactNode, useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Modal } from "./Modal";
import { NotificationPopup } from "./NotificationPopup";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import {
  Home,
  ClipboardList,
  UserCircle,
  LogOut,
  Moon,
  Sun,
  Bell,
  Plus,
  Trophy,
  Shield,
  Users,
} from "lucide-react";
import { getNotifications } from "../services/notificationService";

interface LayoutProps {
  children: ReactNode;
}

export const Layout = ({ children }: LayoutProps) => {
  const { user, logout, isAuthenticated } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const [logoutModalOpen, setLogoutModalOpen] = useState(false);
  const [notificationPopupOpen, setNotificationPopupOpen] = useState(false);
  const [unreadNotifications, setUnreadNotifications] = useState(0);

  useEffect(() => {
    if (isAuthenticated) {
      fetchUnreadCount();
    }
  }, [isAuthenticated]);

  const fetchUnreadCount = async () => {
    try {
      const { unreadCount } = await getNotifications(true, 1);
      setUnreadNotifications(unreadCount);
    } catch (error) {
      console.error("Error fetching unread notifications:", error);
    }
  };

  const navItems = [
    { path: "/dashboard", label: "Home", icon: Home },
    { path: "/tasks", label: "All Tasks", icon: ClipboardList },
    {
      path: "/my-tasks",
      label: user?.role === "admin" ? "Admin Tasks" : "My Tasks",
      icon: UserCircle,
    },
    { path: "/add-task", label: "Add Task", icon: Plus },
    { path: "/php-members", label: "PHP Members", icon: Users },
    ...(user?.role === "admin"
      ? [{ path: "/admin", label: "Admin", icon: Shield }]
      : []),
  ];

  if (!isAuthenticated) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-white relative overflow-x-hidden">
      {/* Animated Waves Background */}
      <div className="fixed inset-0 -z-10 pointer-events-none select-none">
        {[...Array(7)].map((_, i) => {
          // 5 theme colors
          const colors = [
            "#19316d",
            "#3972a1",
            "#f8d32d",
            "#b42940",
            "#198a40",
          ];
          const color = colors[Math.floor(Math.random() * colors.length)];
          const duration = 18 + Math.random() * 10;
          const delay = Math.random() * 10;
          const height = 60 + Math.random() * 80;
          const opacity = 0.1 + Math.random() * 0.12;
          const y = 60 + Math.random() * 200;
          return (
            <svg
              key={i}
              width="100%"
              height={height}
              style={{
                position: "absolute",
                left: 0,
                top: `${y}px`,
                zIndex: -10,
                animation: `wave-move-${i} ${duration}s linear ${delay}s infinite`,
              }}
              viewBox="0 0 1440 320"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fill={color}
                fillOpacity={opacity}
                d="M0,160L60,154.7C120,149,240,139,360,154.7C480,171,600,213,720,197.3C840,181,960,107,1080,101.3C1200,96,1320,160,1380,192L1440,224L1440,320L1380,320C1320,320,1200,320,1080,320C960,320,840,320,720,320C600,320,480,320,360,320C240,320,120,320,60,320L0,320Z"
              />
              <style>{`
                @keyframes wave-move-${i} {
                  0% { transform: translateX(-20vw); }
                  100% { transform: translateX(100vw); }
                }
              `}</style>
            </svg>
          );
        })}
      </div>
      {/* Top Bar */}
      <header className="sticky top-0 z-30 bg-gradient-to-r from-[#19316d] to-[#3972a1] shadow-lg">
        <div className="flex items-center justify-between px-4 py-3 lg:px-8">
          {/* Logo */}
          <div className="flex items-center gap-8">
            <Link to="/dashboard" className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                <span className="text-white font-bold text-lg">PHP</span>
              </div>
              <h1 className="text-xl font-bold text-white font-sans tracking-wide">
                Directory
              </h1>
            </Link>

            {/* Navigation Links */}
            <nav className="hidden md:flex items-center gap-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`relative flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 font-sans ${
                      isActive
                        ? "bg-[#f8d32d]/20 text-[#f8d32d] border border-[#f8d32d]/30"
                        : "text-white/90 hover:bg-white/10 hover:text-white"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="font-medium">{item.label}</span>
                    {isActive && (
                      <motion.div
                        className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#f8d32d]"
                        layoutId="navbar-indicator"
                        transition={{
                          type: "spring",
                          stiffness: 380,
                          damping: 30,
                        }}
                      />
                    )}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center gap-2">
            {/* Leaderboard Button */}
            <Link
              to="/leaderboard"
              className="flex items-center gap-2 px-4 py-2 bg-[#198a40]/20 hover:bg-[#198a40]/30 text-white rounded-lg transition-colors font-medium font-sans border border-[#198a40]/30"
            >
              <Trophy className="w-4 h-4 text-[#198a40]" />
              <span className="hidden sm:inline">Leaderboard</span>
            </Link>

            {/* Notifications */}
            <button
              onClick={() => setNotificationPopupOpen(true)}
              className="p-2 rounded-lg hover:bg-[#b42940]/20 relative transition-colors border border-white/20"
              aria-label="Notifications"
              title="Notifications"
            >
              <Bell className="w-5 h-5 text-white" />
              {unreadNotifications > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-[#b42940] rounded-full flex items-center justify-center text-xs font-bold text-white border-2 border-white">
                  {unreadNotifications > 9 ? "9+" : unreadNotifications}
                </span>
              )}
            </button>

            {/* Logout */}
            <button
              onClick={() => setLogoutModalOpen(true)}
              className="p-2 rounded-lg hover:bg-[#b42940]/20 transition-colors border border-white/20"
              aria-label="Logout"
              title="Logout"
            >
              <LogOut className="w-5 h-5 text-white" />
            </button>

            {/* User Profile */}
            <div className="flex items-center gap-2 pl-2 border-l border-white/30">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#f8d32d] to-[#198a40] flex items-center justify-center text-white text-sm font-semibold border-2 border-white/30">
                {user?.firstName?.[0]}
                {user?.lastName?.[0]}
              </div>
              <span className="hidden lg:block font-medium text-white font-sans">
                {user?.firstName} {user?.lastName}
              </span>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className="md:hidden border-t border-white/30 px-4 py-2 bg-black/10">
          <nav className="flex items-center gap-1 overflow-x-auto">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm transition-colors font-sans whitespace-nowrap ${
                    isActive
                      ? "bg-[#f8d32d]/20 text-[#f8d32d] border border-[#f8d32d]/30"
                      : "text-white/90 hover:bg-white/10"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>
      </header>

      {/* Page Content */}
      <main className="flex-1 p-4 lg:p-8">
        <div className="box bg-white shadow-md rounded-md p-4">{children}</div>
      </main>
      {/* Notification Popup */}
      <NotificationPopup
        isOpen={notificationPopupOpen}
        onClose={() => {
          setNotificationPopupOpen(false);
          fetchUnreadCount(); // Refresh count after closing
        }}
      />
      {/* Logout confirmation modal */}
      <Modal
        isOpen={logoutModalOpen}
        onClose={() => setLogoutModalOpen(false)}
        title="Confirm Logout"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-gray-700 dark:text-gray-300">
            Are you sure you want to log out?
          </p>
          <div className="flex gap-2 justify-end">
            <button
              onClick={() => setLogoutModalOpen(false)}
              className="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded-lg"
            >
              Cancel
            </button>
            <button
              onClick={async () => {
                setLogoutModalOpen(false);
                await handleLogout();
              }}
              className="px-4 py-2 bg-red-600 text-white rounded-lg"
            >
              Logout
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

const renderBoxes = () => {
  const leftBoxColors = ["#19316d", "#3972a1", "#f8d32d", "#b42940", "#198a40"];
  const rightBoxColors = [
    "#198a40",
    "#b42940",
    "#f8d32d",
    "#3972a1",
    "#19316d",
  ];

  const leftBoxColor =
    leftBoxColors[Math.floor(Math.random() * leftBoxColors.length)];
  const rightBoxColor =
    rightBoxColors[Math.floor(Math.random() * rightBoxColors.length)];

  return (
    <div className="flex flex-col lg:flex-row gap-4">
      <div
        className="flex-1 p-4 rounded-md shadow-md"
        style={{ backgroundColor: leftBoxColor }}
      >
        <h2 className="text-white font-bold">Left Box</h2>
        <p className="text-white/80">This is the left box content.</p>
      </div>
      <div
        className="flex-1 p-4 rounded-md shadow-md"
        style={{ backgroundColor: rightBoxColor }}
      >
        <h2 className="text-white font-bold">Right Box</h2>
        <p className="text-white/80">This is the right box content.</p>
      </div>
    </div>
  );
};

// Call renderBoxes inside the Layout component or wherever appropriate.
