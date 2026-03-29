import { z } from 'zod';

export const supplementQuerySchema = z.object({
  category: z.string().optional(),
  query: z.string().optional(),
  page: z.string().transform(Number).optional().default('1'),
  limit: z.string().transform(Number).optional().default('20'),
});

export const addUserSupplementSchema = z.object({
  supplementId: z.string().uuid(),
  quantity: z.number().positive(),
  unit: z.string(),
  dailyDosage: z.number().positive(),
  dosageUnit: z.string(),
  timing: z.array(z.string()).optional(),
  purchaseDate: z.string().datetime().optional(),
  expirationDate: z.string().datetime().optional(),
});

export const logSupplementSchema = z.object({
  supplementId: z.string().uuid(),
  quantity: z.number().positive(),
  takenAt: z.string().datetime(),
  timing: z.string().optional(),
  notes: z.string().optional(),
});
