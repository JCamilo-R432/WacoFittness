import api from './api';

export const restService = {
  // Sleep
  logSleep: (data: any) => api.post('/recovery/sleep/log', data),
  getSleepLogs: (params?: any) => api.get('/recovery/sleep/log', { params }),
  getLastSleep: () => api.get('/recovery/sleep/last'),

  // Relaxation
  getTechniques: (params?: any) => api.get('/recovery/relaxation/techniques', { params }),
  logRelaxation: (techniqueId: string, data: any) =>
    api.post(`/recovery/relaxation/techniques/${techniqueId}/log`, data),

  // Stress
  logStress: (data: any) => api.post('/recovery/stress/log', data),

  // Stretching
  getStretchingRoutines: (params?: any) => api.get('/recovery/stretching/routines', { params }),

  // Recovery Score
  getRecoveryScore: () => api.get('/recovery/score'),
};
