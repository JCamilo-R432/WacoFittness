import api from './api';

export const trainingService = {
  // Training Profile
  getProfile: () => api.get('/training/profile'),
  createOrUpdateProfile: (data: any) => api.post('/training/profile', data),
  getRecommendations: () => api.get('/training/profile/recommendations'),

  // Workouts (routines / plans)
  getWorkouts: (params?: any) => api.get('/training/workouts', { params }),
  getWorkoutById: (id: string) => api.get(`/training/workouts/${id}`),

  // Personal records & progress
  getPRs: (params?: any) => api.get('/training/prs', { params }),
  getProgress: (params?: any) => api.get('/training/progress', { params }),
  getWeeklySummary: (params?: any) => api.get('/training/summary/weekly', { params }),

  // Exercises
  getExercises: (params?: any) => api.get('/training/exercises', { params }),
  getExerciseById: (id: string) => api.get(`/training/exercises/${id}`),
  createCustomExercise: (data: any) => api.post('/training/exercises', data),

  // Workout Logs
  createWorkoutLog: (data: any) => api.post('/training/workouts/log', data),
  getWorkoutLogs: (params?: any) => api.get('/training/workouts/log', { params }),
  getWorkoutLogById: (id: string) => api.get(`/training/workouts/log/${id}`),
  deleteWorkoutLog: (id: string) => api.delete(`/training/workouts/log/${id}`),

  // Calculator
  calculate1RM: (data: any) => api.post('/training/calculator/1rm', data),
  calculatePercentages: (data: any) => api.post('/training/calculator/percentages', data),
  calculateVolume: (data: any) => api.post('/training/calculator/volume', data),
  getProgression: (params?: any) => api.get('/training/calculator/progression', { params }),
};
