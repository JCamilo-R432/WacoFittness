import { z } from 'zod';

export const recipeSchema = z.object({
    body: z.object({
        name: z.string().min(3).max(100),
        description: z.string().max(2000).optional(),
        prepTimeMinutes: z.number().min(1).max(480).optional(),
        cookTimeMinutes: z.number().min(1).max(480).optional(),
        servings: z.number().min(1).max(50),
        difficultyLevel: z.enum(['facil', 'medio', 'dificil']).optional(),
        caloriesPerServing: z.number().min(0).max(2000).optional(),
        proteinPerServing: z.number().min(0).optional(),
        carbsPerServing: z.number().min(0).optional(),
        fatPerServing: z.number().min(0).optional(),
        fiberPerServing: z.number().min(0).optional(),
        imageUrl: z.string().url().optional(),
        videoUrl: z.string().url().optional(),
        isPublic: z.boolean().optional().default(true),
        ingredients: z.array(z.object({
            foodItemId: z.string().uuid().optional(),
            quantity: z.number().positive(),
            unit: z.string(),
            notes: z.string().optional()
        })).max(50),
        instructions: z.array(z.object({
            stepNumber: z.number().int().positive(),
            instruction: z.string().min(10),
            imageUrl: z.string().url().optional()
        })),
        tags: z.array(z.string()).optional()
    })
});

export const recipeReviewSchema = z.object({
    body: z.object({
        rating: z.number().int().min(1).max(5),
        comentario: z.string().max(1000).optional()
    })
});

export const generateByMacrosSchema = z.object({
    query: z.object({
        calories: z.string().regex(/^\d+$/),
        proteinG: z.string().regex(/^\d+$/),
        carbsG: z.string().regex(/^\d+$/),
        fatG: z.string().regex(/^\d+$/)
    })
});
