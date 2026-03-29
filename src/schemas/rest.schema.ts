import { z } from 'zod';

export const sleepLogSchema = z.object({
  date: z.string().datetime(),
  bedtime: z.string().datetime(),
  wakeTime: z.string().datetime(),
  quality: z.number().int().min(1).max(5),
  factors: z.array(z.string()).optional(),
  notes: z.string().optional(),
});

export const relaxationLogSchema = z.object({
  techniqueId: z.string().uuid(),
  durationMinutes: z.number().int().positive(),
  moodBefore: z.number().int().min(1).max(10).optional(),
  moodAfter: z.number().int().min(1).max(10).optional(),
  effectiveness: z.number().int().min(1).max(5).optional(),
  notes: z.string().optional(),
});

export const recoveryToolLogSchema = z.object({
  toolId: z.string().uuid(),
  durationMinutes: z.number().int().positive().optional(),
  effectiveness: z.number().int().min(1).max(5).optional(),
  notes: z.string().optional(),
});
