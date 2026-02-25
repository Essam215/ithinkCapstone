// User Types
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  // include 'php' role used by the backend
  role: 'student' | 'admin' | 'mentor' | 'php';
  points: number;
  rank: number;
  avatar?: string;
  createdAt: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

// Task Types
export interface Task {
  id: string;
  title: string;
  description: string;
  category: string;
  points: number;
  status: 'pending' | 'in-progress' | 'completed' | 'approved';
  createdBy: string;
  assignedTo?: string;
  // support both camelCase and snake_case returned by API
  dueDate?: string;
  due_date?: string;
  // some endpoints return category_name
  category_name?: string;
  // submission object (nullable) for task review flows
  submission?: TaskSubmission | null;
  createdAt: string;
  attachments?: string[];
}

export interface TaskSubmission {
  taskId?: string;
  userId?: string;
  // common fields used in the UI
  submission_text?: string;
  submission?: string;
  status?: 'pending' | 'approved' | 'rejected';
  feedback?: string;
  points_awarded: number;
  attachments?: any[];
}

// Event Types
export interface Event {
  id: string;
  title: string;
  description: string;
  category: string;
  // backend sometimes returns event_date (snake_case)
  date: string;
  event_date?: string;
  location: string;
  maxParticipants: number;
  max_participants?: number;
  currentParticipants: number;
  current_participants?: number;
  points: number;
  status: 'upcoming' | 'ongoing' | 'completed' | 'cancelled';
  createdBy: string;
  createdAt: string;
  // possible application object returned for the current user
  application?: EventApplication | null;
}

export interface EventApplication {
  eventId: string;
  userId: string;
  status: 'pending' | 'approved' | 'rejected';
  appliedAt: string;
}

// Badge Types
export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  pointsRequired: number;
}

export interface UserBadge {
  badgeId: string;
  userId: string;
  earnedAt: string;
  badge: Badge;
}

// Notification Types
export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  read: boolean;
  createdAt: string;
  link?: string;
}

// Post / Feed Types (Prototype)
export type PostVisibility = "public" | "admin";
export type PostStatus = "pending" | "approved" | "rejected";
export type PostType = "post" | "event_request" | "other_request";

export interface Post {
  id: string;
  authorId: string;
  authorName?: string; // convenience for UI
  content: string;
  visibility: PostVisibility;
  type: PostType;
  status: PostStatus;
  isPinned: boolean;
  createdAt: string;
  updatedAt?: string;

  // Review fields (admin)
  reviewedBy?: string;
  reviewedAt?: string;
  feedback?: string;
  pointsAwarded?: number;
}

// Leaderboard Types
export interface LeaderboardEntry {
  userId: string;
  user: User;
  points: number;
  rank: number;
  badgesCount: number;
}

// API Response Types
export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface Stats {
  totalStudents: number;
  totalTasks: number;
  totalEvents: number;
  totalUsers: number;
  totalPHP: number;
  pendingTasks: number;
  pendingEvents: number;
  totalPointsAwarded: number;
  pendingPHPApplications: number;
}

export interface Event {
  id: string;
  title: string;
  description: string;
  status: 'upcoming' | 'ongoing' | 'completed' | 'cancelled';
  date: string;
  points: number;
  location: string;
  maxParticipants: number;
  currentParticipants: number;
  createdBy: string;
  createdAt: string;
}

