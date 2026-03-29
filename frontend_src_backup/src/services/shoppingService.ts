import api from './api';

export const shoppingService = {
  // Lists
  createList: (data: any) => api.post('/shopping/lists', data),
  getLists: () => api.get('/shopping/lists'),
  getListById: (id: string) => api.get(`/shopping/lists/${id}`),
  completeList: (id: string) => api.post(`/shopping/lists/${id}/complete`),
  generateFromMealPlan: (data: any) => api.post('/shopping/lists/from-meal-plan', data),

  // Pantry
  getPantry: (params?: any) => api.get('/shopping/pantry', { params }),
  addPantryItem: (data: any) => api.post('/shopping/pantry', data),
  consumePantry: (id: string, data: any) => api.put(`/shopping/pantry/${id}/consume`, data),

  // Purchase history
  getPurchaseHistory: (params?: any) => api.get('/shopping/purchases', { params }),
};
