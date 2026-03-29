import api from './api';

export const supplementsService = {
  // Catalog
  getSupplements: (params?: any) => api.get('/supplements', { params }),

  // Inventory
  getInventory: () => api.get('/supplements/inventory'),
  addToInventory: (data: any) => api.post('/supplements/inventory', data),

  // Logs
  logConsumption: (data: any) => api.post('/supplements/log', data),
  getLogs: (params?: any) => api.get('/supplements/log', { params }),
  getTodayLogs: () => api.get('/supplements/log/today'),

  // Stacks
  getStacks: (params?: any) => api.get('/supplements/stacks', { params }),

  // Recommendations
  getRecommendations: () => api.get('/supplements/recommendations'),

  // Analytics
  getAnalytics: () => api.get('/supplements/analytics/summary'),
};
