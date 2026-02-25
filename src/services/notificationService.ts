import api from './api';
import type { Notification } from '../types';
import { mockNotifications } from '../data/mockData';

// MVP Mode: Set to true to use mock data (no backend required)
const MVP_MODE = true;

interface ApiResponse<T> {
  success: boolean;
  data: T;
  unreadCount?: number;
  message?: string;
}

export const getNotifications = async (unreadOnly: boolean = false, limit: number = 50): Promise<{ notifications: Notification[]; unreadCount: number }> => {
  // MVP Mode: Return mock data
  if (MVP_MODE) {
    return new Promise((resolve) => {
      setTimeout(() => {
        let notifications = [...mockNotifications];
        if (unreadOnly) {
          notifications = notifications.filter(n => !n.read);
        }
        const unreadCount = mockNotifications.filter(n => !n.read).length;
        resolve({
          notifications: notifications.slice(0, limit),
          unreadCount
        });
      }, 300);
    });
  }

  // Real API mode
  try {
    const params = new URLSearchParams();
    if (unreadOnly) params.append('unread', 'true');
    params.append('limit', limit.toString());
    
    const response = await api.get<ApiResponse<Notification[]>>(`/notifications?${params.toString()}`);
    return {
      notifications: response.data.data || [],
      unreadCount: response.data.unreadCount || 0
    };
  } catch (error) {
    console.warn('API failed, using mock data');
    return {
      notifications: mockNotifications.slice(0, limit),
      unreadCount: mockNotifications.filter(n => !n.read).length
    };
  }
};

export const markNotificationAsRead = async (notificationIds: string[]): Promise<void> => {
  if (MVP_MODE) {
    // In mock mode, just update the mock data
    notificationIds.forEach(id => {
      const notif = mockNotifications.find(n => n.id === id);
      if (notif) {
        notif.read = true;
      }
    });
    return;
  }

  await api.put('/notifications', {
    notificationIds
  });
};

export const markAllNotificationsAsRead = async (): Promise<void> => {
  const { notifications } = await getNotifications(false, 1000);
  const unreadIds = notifications.filter(n => !n.read).map(n => n.id);
  if (unreadIds.length > 0) {
    await markNotificationAsRead(unreadIds);
  }
};

export const deleteNotification = async (id: string): Promise<void> => {
  if (MVP_MODE) {
    const index = mockNotifications.findIndex(n => n.id === id);
    if (index !== -1) {
      mockNotifications.splice(index, 1);
    }
    return;
  }

  await api.delete(`/notifications?id=${id}`);
};
