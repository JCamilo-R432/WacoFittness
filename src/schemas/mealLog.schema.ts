import { z } from 'zod';

export const mealTypeEnum = z.enum(['breakfast', 'morningSnack', 'lunch', 'afternoonSnack', 'dinner', 'beforeBed']);

export const addMealLogSchema = z.object({
    body: z.object({
        foodItemId: z.string().uuid().optional(),
        mealType: mealTypeEnum,
        consumedAt: z.string().datetime(),
        quantityG: z.number().min(1).max(10000),
        calories: z.number().optional(),
        proteinG: z.number().optional(),
        carbsG: z.number().optional(),
        fatG: z.number().optional(),
        satietyLevel: z.number().min(1).max(5).optional(),
        mood: z.string().optional(),
        location: z.string().optional(),
        photoUrl: z.string().url().optional(),
        notes: z.string().optional()
    })
});
