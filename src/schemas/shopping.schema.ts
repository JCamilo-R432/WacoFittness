import { z } from 'zod';

export const createShoppingListSchema = z.object({
  name: z.string().min(2),
  description: z.string().optional(),
  targetDate: z.string().datetime().optional(),
  budget: z.number().nonnegative().optional(),
});

export const addShoppingListItemSchema = z.object({
  foodItemId: z.string().uuid().optional(),
  name: z.string().min(1),
  category: z.string(),
  quantity: z.number().positive(),
  unit: z.string(),
  notes: z.string().optional(),
});

export const updateShoppingListItemSchema = z.object({
  isPurchased: z.boolean(),
  realPrice: z.number().nonnegative().optional(),
});
