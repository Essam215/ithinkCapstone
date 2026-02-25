import { motion, AnimatePresence } from "framer-motion";
import { X, CheckCircle, AlertCircle, Info } from "lucide-react";
import { useEffect, useState } from "react";
import type { Notification } from "../types";
import {
  getNotifications,
  markNotificationAsRead,
} from "../services/notificationService";

interface NotificationPopupProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NotificationPopup = ({
  isOpen,
  onClose,
}: NotificationPopupProps) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadNotifications();
    }
  }, [isOpen]);

  const loadNotifications = async () => {
    setLoading(true);
    try {
      const { notifications } = await getNotifications(false, 10);
      setNotifications(notifications);
    } catch (error) {
      console.error("Error loading notifications:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (id: string) => {
    try {
      await markNotificationAsRead([id]);
      setNotifications(
        notifications.map((n) => (n.id === id ? { ...n, read: true } : n)),
      );
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "success":
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case "error":
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      case "warning":
        return <AlertCircle className="w-5 h-5 text-yellow-500" />;
      case "info":
      default:
        return <Info className="w-5 h-5 text-blue-500" />;
    }
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/30 z-40"
          />

          {/* Notification Popup */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -20 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="pointer-events-auto bg-[#f7f8fa] border border-[#e5e7eb] rounded-xl shadow-2xl max-w-md w-full max-h-96 overflow-hidden"
            >
              {/* Header */}
              <div className="bg-gradient-to-r from-[#1E3A8A] to-[#3B82F6] p-4 flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-[#3972a1]">
                    Notifications
                  </h2>
                  {unreadCount > 0 && (
                    <p className="text-sm text-blue-100">
                      {unreadCount} unread notification
                      {unreadCount !== 1 ? "s" : ""}
                    </p>
                  )}
                </div>
                <button
                  onClick={onClose}
                  className="p-1 hover:bg-white/20 rounded-lg transition-colors"
                  aria-label="Close notifications"
                >
                  <X className="w-5 h-5 text-[#19316d]" />
                </button>
              </div>

              {/* Content */}
              <div className="overflow-y-auto h-80">
                {loading ? (
                  <div className="flex items-center justify-center h-full">
                    <p className="text-gray-500">
                      Loading...
                    </p>
                  </div>
                ) : notifications.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-center p-6">
                    <Info className="w-12 h-12 text-gray-300 mb-2" />
                    <p className="text-gray-500">
                      No notifications yet
                    </p>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-200">
                    {notifications.map((notification) => (
                      <motion.div
                        key={notification.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{
                          type: "spring",
                          stiffness: 400,
                          damping: 40,
                        }}
                        className={`p-4 hover:bg-[#f0f2f5] transition-colors cursor-pointer ${
                          !notification.read
                            ? "bg-blue-50 border-l-4 border-blue-500"
                            : "bg-white"
                        }`}
                        onClick={() => {
                          if (!notification.read) {
                            handleMarkAsRead(notification.id);
                          }
                          if (notification.link) {
                            // Can be extended to navigate to link
                          }
                        }}
                        >
                        <div className="flex gap-3">
                          <div className="flex-shrink-0 mt-1">
                            {getNotificationIcon(notification.type)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                              <p className="font-semibold text-[#19316d] text-sm">
                                {notification.title}
                              </p>
                              <div className="flex items-center gap-2 flex-shrink-0">
                                {!notification.read && (
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleMarkAsRead(notification.id);
                                    }}
                                    className="p-1 rounded-full hover:bg-blue-100"
                                    aria-label="Mark notification as read"
                                  >
                                    <CheckCircle className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                                                                   <CheckCircle className="w-4 h-4 text-blue-600" />
                                  </button>
                                )}
                                {!notification.read && (
                                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-1.5" />
                                )}
                              </div>
                            </div>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">
                              <span className="text-[#b42940]">{notification.message}</span>
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
                              <span className="text-[#198a40]">{new Date(
                                notification.createdAt,
                              ).toLocaleDateString()} {new Date(
                                notification.createdAt,
                              ).toLocaleTimeString()}</span>
                            </p>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
};
