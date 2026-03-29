import api from './api';

export const notificationsService = {
  // Tokens
  registerToken: (data: any) => api.post('/notifications/tokens', data),
  listTokens: () => api.get('/notifications/tokens'),
  deleteToken: (id: string) => api.delete(`/notifications/tokens/${id}`),

  // Preferences
  getPreferences: () => api.get('/notifications/preferences'),
  updatePreferences: (data: any) => api.put('/notifications/preferences', data),

  // Notifications
  listNotifications: (params?: any) => api.get('/notifications', { params }),
  getNotification: (id: string) => api.get(`/notifications/${id}`),
  markRead: (id: string) => api.put(`/notifications/${id}/read`),
  markClick: (id: string) => api.put(`/notifications/${id}/click`),
  deleteNotification: (id: string) => api.delete(`/notifications/${id}`),
  countUnread: () => api.get('/notifications/unread/count'),
  markAllRead: () => api.put('/notifications/read-all'),

  // Schedules
  listSchedules: () => api.get('/notifications/schedules'),
  createSchedule: (data: any) => api.post('/notifications/schedules', data),
  updateSchedule: (id: string, data: any) => api.put(`/notifications/schedules/${id}`, data),
  deleteSchedule: (id: string) => api.delete(`/notifications/schedules/${id}`),
  toggleSchedule: (id: string) => api.put(`/notifications/schedules/${id}/toggle`),

  // Analytics
  getAnalyticsSummary: () => api.get('/notifications/analytics/summary'),
};
