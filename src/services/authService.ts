import api from './api';
import type { AuthResponse, User } from '../types';
import { MOCK_USERS, addMockUser, getMockUserByEmail } from '../data/mockUsers';

// MVP Mode: Set to true to use mock authentication (no backend required)
const MVP_MODE = true;

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  token?: string;
  user?: User;
  message?: string;
}

export const login = async (email: string, password: string): Promise<AuthResponse> => {
  // MVP Mode: Use mock authentication
  if (MVP_MODE) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const mockUser = getMockUserByEmail(email);
        if (mockUser && mockUser.password === password) {
          const token = 'mock-token-' + Date.now();
          resolve({
            token,
            user: mockUser.user
          });
        } else {
          reject(new Error('Invalid email or password. Try: admin@school.edu / admin123'));
        }
      }, 500); // Simulate network delay
    });
  }

  // Real API mode
  try {
    const response = await api.post<ApiResponse<User>>('/auth', {
      action: 'login',
      email,
      password
    });
    
    if (response.data.success && response.data.token && response.data.user) {
      return {
        token: response.data.token,
        user: response.data.user
      };
    }
    
    throw new Error(response.data.message || 'Login failed');
  } catch (error: any) {
    // Fallback to mock mode if API fails
    console.warn('API login failed, falling back to mock mode');
    const mockUser = MOCK_USERS[email.toLowerCase()];
    if (mockUser && mockUser.password === password) {
      const token = 'mock-token-' + Date.now();
      return {
        token,
        user: mockUser.user
      };
    }
    throw new Error(error?.response?.data?.message || error?.message || 'Login failed');
  }
};

export const register = async (
  email: string,
  password: string,
  firstName: string,
  lastName: string
): Promise<AuthResponse> => {
  // MVP Mode: Use mock authentication (create a mock student)
  if (MVP_MODE) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        // Check if email already exists
        if (MOCK_USERS[email.toLowerCase()]) {
          reject(new Error('Email already registered'));
          return;
        }
        
        // Create new mock user
        const newUser: User = {
          id: Date.now().toString(),
          email: email.toLowerCase(),
          firstName,
          lastName,
          role: 'student',
          points: 0,
          rank: 0,
          createdAt: new Date().toISOString(),
        };
        
        addMockUser(email, newUser, password);
        
        const token = 'mock-token-' + Date.now();
        resolve({
          token,
          user: newUser
        });
      }, 500);
    });
  }

  // Real API mode
  try {
    const response = await api.post<ApiResponse<User>>('/auth', {
      action: 'register',
      email,
      password,
      firstName,
      lastName
    });
    
    if (response.data.success && response.data.token && response.data.user) {
      return {
        token: response.data.token,
        user: response.data.user
      };
    }
    
    throw new Error(response.data.message || 'Registration failed');
  } catch (error: any) {
    // Fallback to mock mode if API fails
    console.warn('API registration failed, falling back to mock mode');
    if (MOCK_USERS[email.toLowerCase()]) {
      throw new Error('Email already registered');
    }
    
    const newUser: User = {
      id: Date.now().toString(),
      email: email.toLowerCase(),
      firstName,
      lastName,
      role: 'student',
      points: 0,
      rank: 0,
      createdAt: new Date().toISOString(),
    };
    
    addMockUser(email, newUser, password);
    
    const token = 'mock-token-' + Date.now();
    return {
      token,
      user: newUser
    };
  }
};

export const logout = async (): Promise<void> => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
};

export const getCurrentUser = async (): Promise<User> => {
  // MVP Mode: Get user from localStorage
  if (MVP_MODE) {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      return JSON.parse(userStr);
    }
    throw new Error('No user found');
  }

  // Real API mode
  try {
    const response = await api.get<ApiResponse<User>>('/auth');
    
    if (response.data.success && response.data.user) {
      return response.data.user;
    }
    
    throw new Error('Failed to get current user');
  } catch (error) {
    // Fallback to localStorage
    const userStr = localStorage.getItem('user');
    if (userStr) {
      return JSON.parse(userStr);
    }
    throw new Error('Failed to get current user');
  }
};

export const refreshToken = async (): Promise<string> => {
  // Token refresh would be handled here if needed
  const token = localStorage.getItem('token');
  if (!token) {
    throw new Error('No token found');
  }
  return token;
};
