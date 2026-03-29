import { z } from 'zod';

export const exerciseQuerySchema = z.object({
  category: z.string().optional(),
  difficulty: z.enum(['beginner', 'intermediate', 'advanced']).optional(),
  equipment: z.string().optional(),
  page: z.string().transform(Number).optional().default('1'),
  limit: z.string().transform(Number).optional().default('20'),
});

export const createExerciseSchema = z.object({
  name: z.string().min(2),
  category: z.string(),
  type: z.enum(['compound', 'isolation', 'machine', 'freeWeight', 'bodyweight']),
  equipment: z.array(z.string()),
  difficulty: z.enum(['beginner', 'intermediate', 'advanced']),
  instructions: z.string().optional(),
  primaryMuscles: z.array(z.string()),
  secondaryMuscles: z.array(z.string()).optional(),
});

export const workoutLogSchema = z.object({
  trainingDayId: z.string().uuid().optional(),
  workoutDate: z.string().datetime(),
  startTime: z.string().datetime(),
  endTime: z.string().datetime().optional(),
  notes: z.string().optional(),
  exercises: z.array(z.object({
    exerciseId: z.string().uuid(),
    sets: z.number().int().positive(),
    repsCompleted: z.string(),
    weightKg: z.number().nonnegative(),
    rpe: z.number().int().min(1).max(10).optional(),
    notes: z.string().optional(),
  })).min(1),
});

export const trainingPlanSchema = z.object({
  name: z.string().min(2),
  description: z.string().optional(),
  splitType: z.enum(['fullbody', 'upperLower', 'pushPullLegs', 'broSplit', 'powerbuilding']),
  durationWeeks: z.number().int().positive(),
  daysPerWeek: z.number().int().min(1).max(7),
  goal: z.enum(['strength', 'hypertrophy', 'endurance', 'power']),
  experienceLevel: z.enum(['beginner', 'intermediate', 'advanced', 'elite']),
});

// Aliases for backward-compatible route imports
export const exerciseSchema = createExerciseSchema;

export const oneRMCalculatorSchema = z.object({
  weight: z.number().positive(),
  reps: z.number().int().min(1).max(30),
  formula: z.enum(['epley', 'brzycki', 'lander', 'lombardi']).optional().default('epley'),
});

export const trainingProfileSchema = z.object({
  experienceLevel: z.enum(['beginner', 'intermediate', 'advanced', 'elite']).optional(),
  goals: z.array(z.string()).optional(),
  daysPerWeek: z.number().int().min(1).max(7).optional(),
  preferredTime: z.string().optional(),
  injuryNotes: z.string().optional(),
  equipment: z.array(z.string()).optional(),
});
