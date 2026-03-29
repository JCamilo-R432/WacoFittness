// ========================
// API Response Types
// ========================

export interface ApiResponse<T> {
  data: T;
  message?: string;
  success?: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ApiError {
  error: string;
  message: string;
  statusCode?: number;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface CreateNutritionProfileRequest {
  age: number;
  gender: string;
  weightKg: number;
  heightCm: number;
  activityLevel: string;
  goal: string;
  bodyFatPercentage?: number;
  trainingDaysPerWeek?: number;
}

export interface MealLogRequest {
  foodItemId: string;
  mealType: string;
  quantityG: number;
  consumedAt: string;
  notes?: string;
}

export interface WorkoutLogRequest {
  trainingDayId?: string;
  workoutDate: string;
  startTime: string;
  endTime?: string;
  exercises: {
    exerciseId: string;
    sets: number;
    repsCompleted: string;
    weightKg: number;
    restSeconds?: number;
    rpe?: number;
    notes?: string;
  }[];
  notes?: string;
  energyLevel?: number;
  moodBefore?: string;
  moodAfter?: string;
}

export interface SleepLogRequest {
  date: string;
  bedtime: string;
  wakeTime: string;
  quality: number;
  timeToFallAsleepMin?: number;
  interruptions?: number;
  feelingOnWake?: string;
  factors?: string[];
  notes?: string;
}

export interface HydrationLogRequest {
  amountMl: number;
  liquidType: string;
  liquidName?: string;
  context?: string;
  notes?: string;
}

export interface SupplementLogRequest {
  supplementId: string;
  quantity: number;
  timing?: string;
  notes?: string;
}

export interface ShoppingListRequest {
  name: string;
  description?: string;
  budget?: number;
  targetDate?: string;
  items: {
    name: string;
    category: string;
    quantity: number;
    unit: string;
    estimatedPrice?: number;
    brand?: string;
    notes?: string;
  }[];
}
