import api from './api';
import type { Task } from '../types';
import { mockTasks } from '../data/mockData';

// MVP Mode: Set to true to use mock data (no backend required)
const MVP_MODE = true;

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export const getTasks = async (status?: string, category?: string): Promise<Task[]> => {
  // MVP Mode: Return mock data
  if (MVP_MODE) {
    return new Promise((resolve) => {
      setTimeout(() => {
        let tasks = [...mockTasks];
        if (status && status !== 'all') {
          tasks = tasks.filter(t => t.status === status);
        }
        if (category) {
          tasks = tasks.filter(t => t.category === category);
        }
        resolve(tasks);
      }, 300);
    });
  }

  // Real API mode
  try {
    const params = new URLSearchParams();
    if (status) params.append('status', status);
    if (category) params.append('category', category);
    
    const response = await api.get<ApiResponse<Task[]>>(`/tasks?${params.toString()}`);
    return response.data.data || [];
  } catch (error) {
    console.warn('API failed, using mock data');
    return mockTasks;
  }
};

export const getTaskById = async (id: string): Promise<Task> => {
  // MVP Mode: Return mock task
  if (MVP_MODE) {
    return new Promise((resolve) => {
      setTimeout(() => {
        const task = mockTasks.find(t => t.id === id);
        if (task) {
          resolve({ ...task, submission: null });
        } else {
          throw new Error('Task not found');
        }
      }, 300);
    });
  }

  // Real API mode
  try {
    const response = await api.get<ApiResponse<Task>>(`/tasks?id=${id}`);
    return response.data.data;
  } catch (error) {
    const task = mockTasks.find(t => t.id === id);
    if (task) {
      return { ...task, submission: null };
    }
    throw error;
  }
};

export const createTask = async (task: {
  title: string;
  description: string;
  categoryId: number;
  points: number;
  dueDate?: string;
}): Promise<Task> => {
  if (MVP_MODE) {
    const newTask: Task = {
      id: Date.now().toString(),
      title: task.title,
      description: task.description,
      category: 'Other',
      points: task.points,
      status: 'pending',
      createdBy: 'admin-1',
      dueDate: task.dueDate,
      createdAt: new Date().toISOString(),
    };
    mockTasks.push(newTask);
    return newTask;
  }

  const response = await api.post<ApiResponse<{ taskId: number }>>('/tasks', {
    action: 'create',
    ...task
  });
  return getTaskById(response.data.data.taskId.toString());
};

export const updateTask = async (taskId: number, task: Partial<Task>): Promise<void> => {
  if (MVP_MODE) {
    const index = mockTasks.findIndex(t => t.id === taskId.toString());
    if (index !== -1) {
      mockTasks[index] = { ...mockTasks[index], ...task };
    }
    return;
  }

  await api.put('/tasks', {
    taskId,
    ...task
  });
};

export const submitTask = async (taskId: number, submissionText: string, files?: File[]): Promise<void> => {
  if (MVP_MODE) {
    return new Promise((resolve) => {
      setTimeout(() => {
        console.log('Task submitted (mock mode):', { taskId, submissionText, files });
        resolve();
      }, 500);
    });
  }

  const formData = new FormData();
  formData.append('taskId', taskId.toString());
  formData.append('submissionText', submissionText);
  
  if (files) {
    files.forEach((file) => {
      formData.append('attachments[]', file);
    });
  }
  
  await api.post('/tasks', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};

export const getTaskSubmissions = async (status: string = 'pending'): Promise<any[]> => {
  if (MVP_MODE) {
    return [];
  }

  try {
    const response = await api.get<ApiResponse<any[]>>(`/task-review?status=${status}`);
    return response.data.data || [];
  } catch (error) {
    return [];
  }
};

export const reviewTask = async (submissionId: number, action: 'approve' | 'reject', feedback: string, pointsAwarded?: number): Promise<void> => {
  if (MVP_MODE) {
    return new Promise((resolve) => {
      setTimeout(() => {
        console.log('Task reviewed (mock mode):', { submissionId, action, feedback, pointsAwarded });
        resolve();
      }, 500);
    });
  }

  await api.post('/task-review', {
    submissionId,
    action,
    feedback,
    pointsAwarded
  });
};

export const bulkReviewTasks = async (
  submissionIds: number[],
  action: 'approve' | 'reject',
  feedback?: string,
  pointsAwarded?: number
): Promise<void> => {
  if (MVP_MODE) {
    return new Promise((resolve) => {
      setTimeout(() => {
        console.log('Tasks bulk reviewed (mock mode):', { submissionIds, action, feedback, pointsAwarded });
        resolve();
      }, 500);
    });
  }

  // Perform bulk operations sequentially
  await Promise.all(
    submissionIds.map(id => 
      api.post('/task-review', {
        submissionId: id,
        action,
        feedback,
        pointsAwarded
      })
    )
  );
};
