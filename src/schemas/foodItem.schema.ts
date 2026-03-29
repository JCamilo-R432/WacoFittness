import { z } from 'zod';

export const foodItemSchema = z.object({
    body: z.object({
        name: z.string().min(1),
        brand: z.string().optional(),
        category: z.string().optional(),
        caloriesPer100g: z.number().min(0),
        proteinPer100g: z.number().min(0),
        carbsPer100g: z.number().min(0),
        fatPer100g: z.number().min(0),
        fiberPer100g: z.number().min(0).optional(),
        servingSizeG: z.number().min(1).optional(),
        servingUnit: z.string().optional(),
        barcode: z.string().optional(),
    })
});
