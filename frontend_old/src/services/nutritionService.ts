import api from './api';

export const nutritionService = {
  // Profile
  getProfile: () => api.get('/nutrition/profile'),
  createProfile: (data: any) => api.post('/nutrition/profile', data),
  updateGoals: (data: any) => api.put('/nutrition/profile/update-goals', data),
  calculateMacrosPreview: (params: any) => api.get('/nutrition/profile/calculate', { params }),

  // Foods
  searchFoods: (query: string) => api.get('/nutrition/foods', { params: { search: query } }),
  getFoodById: (id: string) => api.get(`/nutrition/foods/${id}`),
  createCustomFood: (data: any) => api.post('/nutrition/foods', data),
  getSuggestions: () => api.get('/nutrition/foods/suggestions'),
  getMyCustomFoods: () => api.get('/nutrition/foods/my-customs'),
  getFoodByBarcode: (code: string) => api.get(`/nutrition/foods/barcode/${code}`),

  // Meal Log
  logMeal: (data: any) => api.post('/nutrition/meals/log', data),
  getMealLogs: (params?: any) => api.get('/nutrition/meals/log', { params }),
  getDailySummary: (date: string) => api.get('/nutrition/meals/log/summary/daily', { params: { date } }),
  getWeeklySummary: () => api.get('/nutrition/meals/log/summary/weekly'),
  getFrequentFoods: () => api.get('/nutrition/meals/log/frequent'),
  duplicateLog: (id: string) => api.post(`/nutrition/meals/log/duplicate/${id}`),
  deleteMealLog: (id: string) => api.delete(`/nutrition/meals/log/${id}`),

  // Meal Plans
  generateMealPlan: (data: any) => api.post('/nutrition/meal-plans/generate', data),
  getMealPlans: () => api.get('/nutrition/meal-plans'),
  getMealPlanById: (id: string) => api.get(`/nutrition/meal-plans/${id}`),
  swapFood: (id: string, data: any) => api.put(`/nutrition/meal-plans/${id}/swap`, data),
  getShoppingListFromPlan: (id: string) => api.get(`/nutrition/meal-plans/${id}/shopping-list`),
  activatePlan: (id: string) => api.put(`/nutrition/meal-plans/${id}/activate`),
  deactivatePlan: (id: string) => api.put(`/nutrition/meal-plans/${id}/deactivate`),
  deletePlan: (id: string) => api.delete(`/nutrition/meal-plans/${id}`),

  // Recipes
  getRecipes: (params?: any) => api.get('/recipes', { params }),
  getRecipeById: (id: string) => api.get(`/recipes/${id}`),
  createRecipe: (data: any) => api.post('/recipes', data),
  updateRecipe: (id: string, data: any) => api.put(`/recipes/${id}`, data),
  deleteRecipe: (id: string) => api.delete(`/recipes/${id}`),
  reviewRecipe: (id: string, data: any) => api.post(`/recipes/${id}/review`, data),
  favoriteRecipe: (id: string) => api.post(`/recipes/${id}/favorite`),
  getUserFavorites: () => api.get('/recipes/user/favorites'),
  adjustPortions: (id: string, data: any) => api.post(`/recipes/${id}/adjust-portions`, data),
  generateByMacros: (params: any) => api.get('/recipes/generate-by-macros', { params }),

  // Progress
  getProgress: () => api.get('/nutrition/progress'),
};
