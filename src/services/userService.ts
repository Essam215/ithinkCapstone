import api from './api';
import type { User } from '../types';

// MVP Mode: Set to true to use mock data (no backend required)
const MVP_MODE = true;

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export const getUserProfile = async (id: string): Promise<User> => {
  if (MVP_MODE) {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      return JSON.parse(userStr);
    }
    throw new Error('User not found');
  }

  try {
    const response = await api.get<ApiResponse<User>>(`/users/${id}`);
    return response.data.data;
  } catch (error) {
    throw error;
  }
};

export const updateUserProfile = async (id: string, user: Partial<User>): Promise<User> => {
  if (MVP_MODE) {
    const currentUserStr = localStorage.getItem('user');
    if (currentUserStr) {
      const currentUser = JSON.parse(currentUserStr);
      const updatedUser = { ...currentUser, ...user };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      return updatedUser;
    }
    throw new Error('User not found');
  }

  const response = await api.put<ApiResponse<User>>(`/users/${id}`, user);
  return response.data.data;
};

export const updateMyProfile = async (user: Partial<User>): Promise<User> => {
  return updateUserProfile('current', user);
};

export const getPHPMembers = async (): Promise<User[]> => {
  if (MVP_MODE) {
    return [
      {
        id: '3',
        email: 'php@school.edu',
        firstName: 'Jane',
        lastName: 'PHP',
        role: 'php',
        points: 500,
        rank: 2,
        createdAt: new Date().toISOString(),
      }
    ];
  }

  try {
    const response = await api.get<ApiResponse<User[]>>('/admin?action=php_members');
    return response.data.data || [];
  } catch (error) {
    return [];
  }
};

export const getStudents = async (): Promise<User[]> => {
  if (MVP_MODE) {
    return [
      {
        id: '2',
        email: 'student@school.edu',
        firstName: 'John',
        lastName: 'Student',
        role: 'student',
        points: 150,
        rank: 5,
        createdAt: new Date().toISOString(),
      }
    ];
  }

  try {
    const response = await api.get<ApiResponse<User[]>>('/admin?action=students');
    return response.data.data || [];
  } catch (error) {
    return [];
  }
};

export const getStatistics = async (): Promise<any> => {
  if (MVP_MODE) {
    return {
      totalUsers: 10,
      totalAdmins: 1,
      totalPHP: 3,
      pendingTasks: 5,
      pendingEvents: 2,
      pendingPHPApplications: 1,
      totalTasks: 15,
      totalEvents: 8,
      totalPointsAwarded: 2500,
    };
  }

  try {
    const response = await api.get<ApiResponse<any>>('/admin?action=statistics');
    return response.data.data || {};
  } catch (error) {
    return {};
  }
};
