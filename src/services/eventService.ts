import api from './api';
import type { Event, EventApplication } from '../types';
import { mockEvents } from '../data/mockData';

// MVP Mode: Set to true to use mock data (no backend required)
const MVP_MODE = true;

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export const getEvents = async (status?: string, category?: string): Promise<Event[]> => {
  // MVP Mode: Return mock data
  if (MVP_MODE) {
    return new Promise((resolve) => {
      setTimeout(() => {
        let events = [...mockEvents];
        if (status && status !== 'all') {
          events = events.filter(e => e.status === status);
        }
        if (category) {
          events = events.filter(e => e.category === category);
        }
        resolve(events);
      }, 300);
    });
  }

  // Real API mode
  try {
    const params = new URLSearchParams();
    if (status) params.append('status', status);
    if (category) params.append('category', category);
    
    const response = await api.get<ApiResponse<Event[]>>(`/events?${params.toString()}`);
    return response.data.data || [];
  } catch (error) {
    console.warn('API failed, using mock data');
    return mockEvents;
  }
};

export const getEventById = async (id: string): Promise<Event> => {
  // MVP Mode: Return mock event
  if (MVP_MODE) {
    return new Promise((resolve) => {
      setTimeout(() => {
        const event = mockEvents.find(e => e.id === id);
        if (event) {
          resolve({ ...event, application: null });
        } else {
          throw new Error('Event not found');
        }
      }, 300);
    });
  }

  // Real API mode
  try {
    const response = await api.get<ApiResponse<Event>>(`/events?id=${id}`);
    return response.data.data;
  } catch (error) {
    const event = mockEvents.find(e => e.id === id);
    if (event) {
      return { ...event, application: null };
    }
    throw error;
  }
};

export const createEvent = async (event: {
  title: string;
  description: string;
  categoryId: number;
  eventDate: string;
  location: string;
  maxParticipants: number;
  points: number;
}): Promise<Event> => {
  if (MVP_MODE) {
    const newEvent: Event = {
      id: Date.now().toString(),
      title: event.title,
      description: event.description,
      category: 'Other',
      date: event.eventDate,
      location: event.location,
      maxParticipants: event.maxParticipants,
      currentParticipants: 0,
      points: event.points,
      status: 'upcoming',
      createdBy: 'admin-1',
      createdAt: new Date().toISOString(),
    };
    mockEvents.push(newEvent);
    return newEvent;
  }

  const response = await api.post<ApiResponse<{ eventId: number }>>('/events', event);
  return getEventById(response.data.data.eventId.toString());
};

export const updateEvent = async (eventId: number, event: Partial<Event>): Promise<void> => {
  if (MVP_MODE) {
    const index = mockEvents.findIndex(e => e.id === eventId.toString());
    if (index !== -1) {
      mockEvents[index] = { ...mockEvents[index], ...event };
    }
    return;
  }

  await api.put('/events', {
    eventId,
    ...event
  });
};

export const applyToEvent = async (eventId: number): Promise<void> => {
  if (MVP_MODE) {
    return new Promise((resolve) => {
      setTimeout(() => {
        console.log('Applied to event (mock mode):', eventId);
        resolve();
      }, 500);
    });
  }

  await api.post('/events', {
    eventId
  });
};

export const getEventApplications = async (eventId?: number, status: string = 'pending'): Promise<EventApplication[]> => {
  if (MVP_MODE) {
    return [];
  }

  try {
    const params = new URLSearchParams();
    params.append('status', status);
    if (eventId) params.append('eventId', eventId.toString());
    
    const response = await api.get<ApiResponse<EventApplication[]>>(`/event-applications?${params.toString()}`);
    return response.data.data || [];
  } catch (error) {
    return [];
  }
};

export const reviewEventApplications = async (applicationIds: number[], action: 'approve' | 'reject'): Promise<void> => {
  if (MVP_MODE) {
    return new Promise((resolve) => {
      setTimeout(() => {
        console.log('Event applications reviewed (mock mode):', { applicationIds, action });
        resolve();
      }, 500);
    });
  }

  await api.post('/event-applications', {
    applicationIds,
    action
  });
};

export const getCalendarEvents = async (month: number, year: number): Promise<Record<string, Event[]>> => {
  if (MVP_MODE) {
    const events: Record<string, Event[]> = {};
    mockEvents.forEach(event => {
      const eventDate = new Date(event.date);
      if (eventDate.getMonth() + 1 === month && eventDate.getFullYear() === year) {
        const dateKey = `${year}-${String(month).padStart(2, '0')}-${String(eventDate.getDate()).padStart(2, '0')}`;
        if (!events[dateKey]) {
          events[dateKey] = [];
        }
        events[dateKey].push(event);
      }
    });
    return events;
  }

  try {
    const response = await api.get<ApiResponse<Record<string, Event[]>>>(`/calendar?month=${month}&year=${year}`);
    return response.data.data || {};
  } catch (error) {
    return {};
  }
};
