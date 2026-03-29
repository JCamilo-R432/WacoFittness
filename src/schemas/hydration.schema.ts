import { z } from 'zod';

export const hydrationGoalSchema = z.object({
  dailyGoalMl: z.number().int().positive(),
  unit: z.string().default('ml'),
});

export const hydrationLogSchema = z.object({
  amountMl: z.number().int().positive(),
  liquidType: z.string().default('water'),
  liquidName: z.string().optional(),
  consumedAt: z.string().datetime().optional(),
});
