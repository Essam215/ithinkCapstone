import api from './api';
import type { LeaderboardEntry } from '../types';
import { mockLeaderboard } from '../data/mockData';

// MVP Mode: Set to true to use mock data (no backend required)
const MVP_MODE = true;

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export const getLeaderboard = async (limit: number = 100): Promise<LeaderboardEntry[]> => {
  // MVP Mode: Return mock data
  if (MVP_MODE) {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(mockLeaderboard.slice(0, limit));
      }, 300);
    });
  }

  // Real API mode
  try {
    const response = await api.get<ApiResponse<LeaderboardEntry[]>>(`/leaderboard?limit=${limit}`);
    return response.data.data || [];
  } catch (error) {
    console.warn('API failed, using mock data');
    return mockLeaderboard.slice(0, limit);
  }
};

export const getLeaderboardByCategory = async (_category: string): Promise<LeaderboardEntry[]> => {
  // For now, return all leaderboard entries
  // Category filtering can be added later if needed
  return getLeaderboard();
};
