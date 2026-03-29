import { z } from 'zod';

export const foodQuerySchema = z.object({
  query: z.string().optional(),
  category: z.string().optional(),
  page: z.string().transform(Number).optional().default('1'),
  limit: z.string().transform(Number).optional().default('20'),
});

export const createFoodSchema = z.object({
  name: z.string().min(2, 'Nombre requerido'),
  brand: z.string().optional(),
  category: z.string().optional(),
  caloriesPer100g: z.number().nonnegative(),
  proteinPer100g: z.number().nonnegative(),
  carbsPer100g: z.number().nonnegative(),
  fatPer100g: z.number().nonnegative(),
  fiberPer100g: z.number().optional(),
  servingSizeG: z.number().optional(),
  servingUnit: z.string().optional(),
  barcode: z.string().optional(),
  isCustom: z.boolean().default(true),
});

export const mealLogSchema = z.object({
  foodItemId: z.string().uuid().optional(),
  mealType: z.enum(['breakfast', 'lunch', 'dinner', 'snack', 'morningSnack', 'afternoonSnack', 'beforeBed']),
  consumedAt: z.string().datetime(),
  quantityG: z.number().positive(),
  notes: z.string().optional(),
});

export const recipeSchema = z.object({
  name: z.string().min(2),
  description: z.string().optional(),
  prepTimeMinutes: z.number().int().positive().optional(),
  cookTimeMinutes: z.number().int().positive().optional(),
  servings: z.number().int().positive(),
  difficultyLevel: z.enum(['beginner', 'intermediate', 'advanced']).optional(),
  isPublic: z.boolean().default(true),
  ingredients: z.array(z.object({
    foodItemId: z.string().uuid().optional(),
    name: z.string().optional(),
    quantity: z.number().positive(),
    unit: z.string(),
  })).min(1),
  instructions: z.array(z.object({
    stepNumber: z.number().int().positive(),
    instruction: z.string().min(5),
  })).min(1),
});

// Aliases for backward-compatible route imports
export const createProfileSchema = z.object({
  height: z.number().positive().optional(),
  weight: z.number().positive().optional(),
  age: z.number().int().positive().optional(),
  gender: z.enum(['male', 'female', 'other']).optional(),
  activityLevel: z.enum(['sedentary', 'lightly_active', 'moderately_active', 'very_active', 'extra_active']).optional(),
  goal: z.enum(['weight_loss', 'maintenance', 'muscle_gain']).optional(),
  targetCalories: z.number().int().positive().optional(),
  targetProtein: z.number().nonnegative().optional(),
  targetCarbs: z.number().nonnegative().optional(),
  targetFat: z.number().nonnegative().optional(),
});

export const updateGoalsSchema = z.object({
  goal: z.enum(['weight_loss', 'maintenance', 'muscle_gain']).optional(),
  targetCalories: z.number().int().positive().optional(),
  targetProtein: z.number().nonnegative().optional(),
  targetCarbs: z.number().nonnegative().optional(),
  targetFat: z.number().nonnegative().optional(),
  targetWeight: z.number().positive().optional(),
});
