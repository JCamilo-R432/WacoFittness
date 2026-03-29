import api from './api';

export const hydrationService = {
  // Goals
  getGoal: () => api.get('/hydration/goal'),
  updateGoal: (data: any) => api.put('/hydration/goal', data),
  calculateGoal: (data: any) => api.post('/hydration/goal/calculate', data),
  getTodayProgress: () => api.get('/hydration/goal/progress'),

  // Logs
  logIntake: (data: any) => api.post('/hydration/log', data),
  getLogs: (params?: any) => api.get('/hydration/log', { params }),
  getTodayLogs: () => api.get('/hydration/log/today'),
  getWeeklySummary: () => api.get('/hydration/log/summary/weekly'),
  getMonthlySummary: () => api.get('/hydration/log/summary/monthly'),
  deleteLog: (id: string) => api.delete(`/hydration/log/${id}`),
  quickAdd: (data: any) => api.post('/hydration/log/quick-add', data),

  // Reminders
  listReminders: () => api.get('/hydration/reminders'),
  createReminder: (data: any) => api.post('/hydration/reminders', data),
  updateReminder: (id: string, data: any) => api.put(`/hydration/reminders/${id}`, data),
  deleteReminder: (id: string) => api.delete(`/hydration/reminders/${id}`),
  snoozeReminder: () => api.post('/hydration/reminders/snooze'),

  // Symptoms
  logSymptoms: (data: any) => api.post('/hydration/symptoms', data),
  listSymptoms: () => api.get('/hydration/symptoms'),
  getSymptomsSummary: () => api.get('/hydration/symptoms/summary'),

  // Challenges
  getChallenges: () => api.get('/hydration/challenges'),
  getPredefinedChallenges: () => api.get('/hydration/challenges/predefined'),
  joinChallenge: (id: string, data: any) => api.post(`/hydration/challenges/${id}/join`, data),
  getUserChallenges: (userId: string) => api.get(`/hydration/challenges/user/${userId}`),
  updateChallengeProgress: (id: string) => api.put(`/hydration/challenges/user/${id}/progress`),

  // Achievements
  listAchievements: () => api.get('/hydration/achievements'),
  checkAchievements: () => api.post('/hydration/achievements/check'),

  // Settings
  getSettings: () => api.get('/hydration/settings'),
  updateSettings: (data: any) => api.put('/hydration/settings', data),

  // Analytics
  getAnalyticsSummary: () => api.get('/hydration/analytics/summary'),
};
