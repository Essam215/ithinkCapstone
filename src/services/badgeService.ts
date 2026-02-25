import api from './api';
import type { Badge, UserBadge } from '../types';
import { mockBadges } from '../data/mockData';

// MVP Mode: Set to true to use mock data (no backend required)
const MVP_MODE = true;

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export const getBadges = async (): Promise<Badge[]> => {
  if (MVP_MODE) {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(mockBadges);
      }, 300);
    });
  }

  try {
    const response = await api.get<ApiResponse<Badge[]>>('/badges?action=all');
    return response.data.data || [];
  } catch (error) {
    return mockBadges;
  }
};

export const getUserBadges = async (userId: string): Promise<UserBadge[]> => {
  if (MVP_MODE) {
    // Return some mock badges for the user
    return [
      {
        badgeId: '1',
        userId: userId,
        earnedAt: new Date().toISOString(),
        badge: mockBadges[0]
      }
    ];
  }

  try {
    const response = await api.get<ApiResponse<UserBadge[]>>('/badges');
    return response.data.data || [];
  } catch (error) {
    return [];
  }
};

export const getMyBadges = async (): Promise<UserBadge[]> => {
  if (MVP_MODE) {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      const user = JSON.parse(userStr);
      return getUserBadges(user.id);
    }
    return [];
  }

  try {
    const response = await api.get<ApiResponse<UserBadge[]>>('/badges');
    return response.data.data || [];
  } catch (error) {
    return [];
  }
};

export const createBadge = async (badge: {
  name: string;
  description: string;
  icon: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  pointsRequired: number;
  conditionType: 'points' | 'tasks' | 'events' | 'custom';
  conditionValue: number;
}): Promise<void> => {
  if (MVP_MODE) {
    console.log('Badge created (mock mode):', badge);
    return;
  }

  await api.post('/badges', badge);
};
