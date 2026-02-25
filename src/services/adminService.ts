import api from './api';

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

// PHP Application Management
export const getPHPApplications = async (status: string = 'pending'): Promise<any[]> => {
  try {
    const response = await api.get<ApiResponse<any[]>>(`/php-applications?status=${status}`);
    return response.data.data || [];
  } catch (error) {
    return [];
  }
};

export const reviewPHPApplication = async (
  applicationId: number,
  action: 'approve' | 'reject',
  rejectionReason?: string
): Promise<void> => {
  await api.post('/php-applications', {
    applicationId,
    action,
    rejectionReason
  });
};

// Bulk Operations
export const bulkReviewTasks = async (
  submissionIds: number[],
  action: 'approve' | 'reject',
  feedback?: string,
  pointsAwarded?: number
): Promise<void> => {
  // For now, perform bulk operations sequentially
  // TODO: Create bulk endpoint in backend
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

export const bulkReviewPHPApplications = async (
  applicationIds: number[],
  action: 'approve' | 'reject',
  rejectionReason?: string
): Promise<void> => {
  await Promise.all(
    applicationIds.map(id => reviewPHPApplication(id, action, rejectionReason))
  );
};

export const bulkReviewEventApplications = async (
  applicationIds: number[],
  action: 'approve' | 'reject'
): Promise<void> => {
  await api.post('/event-applications', {
    applicationIds,
    action
  });
};

// Messaging
export const sendMessage = async (data: {
  subject: string;
  message: string;
  recipientIds?: number[];
  isAnnouncement?: boolean;
}): Promise<void> => {
  await api.post('/messages', data);
};

export const getMessages = async (): Promise<any[]> => {
  try {
    const response = await api.get<ApiResponse<any[]>>('/messages');
    return response.data.data || [];
  } catch (error) {
    return [];
  }
};

// Event Management - Get all events for admin
export const getAllEvents = async (): Promise<any[]> => {
  try {
    const response = await api.get<ApiResponse<any[]>>('/events');
    return response.data.data || [];
  } catch (error) {
    return [];
  }
};

// Get event applications for a specific event
export const getEventApplicationsForEvent = async (eventId: number): Promise<any[]> => {
  try {
    const response = await api.get<ApiResponse<any[]>>(`/event-applications?eventId=${eventId}&status=all`);
    return response.data.data || [];
  } catch (error) {
    return [];
  }
};

// Statistics with more detail
export const getDetailedStatistics = async (): Promise<any> => {
  try {
    const response = await api.get<ApiResponse<any>>('/admin?action=statistics');
    return response.data.data || {};
  } catch (error) {
    return {};
  }
};

