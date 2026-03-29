// ========================
// ZOD VALIDATION SCHEMAS
// ========================
import { z } from 'zod';

// ─── Auth ─────────────────────────────────────────
export const loginSchema = z.object({
  email: z.string().email('Email inválido').min(1, 'Email requerido'),
  password: z.string().min(6, 'Mínimo 6 caracteres'),
});

export const registerSchema = z.object({
  name: z.string().min(3, 'Mínimo 3 caracteres').max(50, 'Máximo 50 caracteres'),
  email: z.string().email('Email inválido'),
  password: z
    .string()
    .min(8, 'Mínimo 8 caracteres')
    .regex(/[A-Z]/, 'Debe contener al menos una mayúscula')
    .regex(/[0-9]/, 'Debe contener al menos un número'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Las contraseñas no coinciden',
  path: ['confirmPassword'],
});

export const forgotPasswordSchema = z.object({
  email: z.string().email('Email inválido'),
});

// ─── Profile Setup ────────────────────────────────
export const profileSetupSchema = z.object({
  name: z.string().min(2, 'Nombre requerido').max(50, 'Máximo 50 caracteres'),
  age: z.number().min(14, 'Mínimo 14 años').max(100, 'Máximo 100 años'),
  gender: z.enum(['male', 'female'], { errorMap: () => ({ message: 'Selecciona un género' }) }),
  weightKg: z.number().min(30, 'Mínimo 30 kg').max(300, 'Máximo 300 kg'),
  heightCm: z.number().min(100, 'Mínimo 100 cm').max(250, 'Máximo 250 cm'),
  activityLevel: z
    .enum(['sedentary', 'lightlyActive', 'moderatelyActive', 'veryActive', 'extremelyActive'])
    .optional(),
});

export const goalsSetupSchema = z.object({
  goal: z.enum(['muscleGain', 'fatLoss', 'maintenance', 'strength', 'endurance']),
  experienceLevel: z.enum(['beginner', 'intermediate', 'advanced', 'elite']),
  trainingDaysPerWeek: z.number().min(1, 'Mínimo 1 día').max(7, 'Máximo 7 días'),
  preferredSplit: z.string().optional(),
  dietaryPreferences: z.array(z.string()).optional(),
});

// ─── Meal Log ─────────────────────────────────────
export const mealLogSchema = z.object({
  foodItemId: z.string().min(1, 'Selecciona un alimento'),
  quantityG: z.number().min(1, 'Mínimo 1g').max(10000, 'Máximo 10,000g'),
  mealType: z.enum(['breakfast', 'morningSnack', 'lunch', 'afternoonSnack', 'dinner', 'beforeBed']),
  consumedAt: z.string(),
  notes: z.string().optional(),
});

// ─── Workout Log ──────────────────────────────────
export const workoutExerciseSchema = z.object({
  exerciseId: z.string().min(1, 'Selecciona ejercicio'),
  sets: z.number().min(1, 'Mínimo 1 serie').max(20, 'Máximo 20 series'),
  repsCompleted: z.string().min(1, 'Ingresa las repeticiones'),
  weightKg: z.number().min(0, 'Peso inválido').max(500, 'Máximo 500 kg'),
  restSeconds: z.number().optional(),
  rpe: z.number().min(1).max(10).optional(),
  notes: z.string().optional(),
});

export const workoutLogSchema = z.object({
  workoutDate: z.string(),
  startTime: z.string(),
  exercises: z.array(workoutExerciseSchema).min(1, 'Agrega al menos un ejercicio'),
  notes: z.string().optional(),
  energyLevel: z.number().min(1).max(5).optional(),
});

// ─── Sleep Log ────────────────────────────────────
export const sleepLogSchema = z.object({
  date: z.string(),
  bedtime: z.string(),
  wakeTime: z.string(),
  quality: z.number().min(1, 'Mínimo 1').max(5, 'Máximo 5'),
  timeToFallAsleepMin: z.number().min(0).optional(),
  interruptions: z.number().min(0).optional(),
  feelingOnWake: z.enum(['refreshed', 'normal', 'tired']).optional(),
  factors: z.array(z.string()).optional(),
  notes: z.string().optional(),
});

// ─── Hydration Log ────────────────────────────────
export const hydrationLogSchema = z.object({
  amountMl: z.number().min(1, 'Mínimo 1 ml').max(5000, 'Máximo 5000 ml'),
  liquidType: z.string().min(1, 'Selecciona tipo'),
  liquidName: z.string().optional(),
  context: z.string().optional(),
  notes: z.string().optional(),
});

// ─── Supplement Log ───────────────────────────────
export const supplementLogSchema = z.object({
  supplementId: z.string().min(1, 'Selecciona suplemento'),
  quantity: z.number().min(0.1, 'Cantidad inválida'),
  timing: z.string().optional(),
  notes: z.string().optional(),
});

// ─── Shopping List ────────────────────────────────
export const shoppingListSchema = z.object({
  name: z.string().min(1, 'Nombre requerido').max(100),
  description: z.string().optional(),
  budget: z.number().min(0).optional(),
  targetDate: z.string().optional(),
  items: z.array(z.object({
    name: z.string().min(1),
    category: z.string().min(1),
    quantity: z.number().min(0.1),
    unit: z.string().min(1),
    estimatedPrice: z.number().optional(),
  })).optional(),
});

// ─── Settings ─────────────────────────────────────
export const editProfileSchema = z.object({
  name: z.string().min(3, 'Mínimo 3 caracteres').max(50),
  email: z.string().email('Email inválido'),
  weightKg: z.number().min(30).max(300).optional(),
  heightCm: z.number().min(100).max(250).optional(),
});

// ─── Type exports ─────────────────────────────────
export type LoginFormData = z.infer<typeof loginSchema>;
export type RegisterFormData = z.infer<typeof registerSchema>;
export type ProfileSetupFormData = z.infer<typeof profileSetupSchema>;
export type GoalsSetupFormData = z.infer<typeof goalsSetupSchema>;
export type MealLogFormData = z.infer<typeof mealLogSchema>;
export type WorkoutLogFormData = z.infer<typeof workoutLogSchema>;
export type SleepLogFormData = z.infer<typeof sleepLogSchema>;
export type HydrationLogFormData = z.infer<typeof hydrationLogSchema>;
export type SupplementLogFormData = z.infer<typeof supplementLogSchema>;
export type ShoppingListFormData = z.infer<typeof shoppingListSchema>;
