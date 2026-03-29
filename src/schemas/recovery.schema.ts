import { z } from 'zod';

export const sleepLogSchema = z.object({
    body: z.object({
        date: z.string().datetime(),
        bedtime: z.string().datetime(),
        wakeTime: z.string().datetime(),
        quality: z.number().min(1).max(5),
        timeToFallAsleepMin: z.number().min(0).max(180).optional(),
        interruptions: z.number().min(0).max(20).optional(),
        sleepStages: z.object({
            light: z.number().min(0).optional(),
            deep: z.number().min(0).optional(),
            rem: z.number().min(0).optional(),
            awake: z.number().min(0).optional()
        }).optional(),
        feelingOnWake: z.enum(['refreshed', 'normal', 'tired']).optional(),
        factors: z.array(z.string()).optional()
    })
});

export const relaxationLogSchema = z.object({
    body: z.object({
        techniqueId: z.string().uuid(),
        durationMinutes: z.number().min(1).max(120),
        moodBefore: z.number().min(1).max(10).optional(),
        moodAfter: z.number().min(1).max(10).optional(),
        effectiveness: z.number().min(1).max(5).optional()
    })
});

export const stressLogSchema = z.object({
    body: z.object({
        date: z.string().datetime(),
        stressLevel: z.number().min(1).max(10),
        triggers: z.array(z.string()).optional(),
        physicalSymptoms: z.array(z.string()).optional(),
        copingMethods: z.array(z.string()).optional()
    })
});

export const stretchingLogSchema = z.object({
    body: z.object({
        routineId: z.string().uuid(),
        durationMinutes: z.number().min(5).max(90),
        moodBefore: z.number().min(1).max(10).optional(),
        moodAfter: z.number().min(1).max(10).optional()
    })
});

export const recoveryToolLogSchema = z.object({
    body: z.object({
        toolId: z.string().uuid(),
        durationMinutes: z.number().min(5).max(120).optional(),
        effectiveness: z.number().min(1).max(5).optional()
    })
});

export const relaxationTechniqueSchema = z.object({
    body: z.object({
        name: z.string().min(3).max(100),
        category: z.enum(['breathing', 'meditation', 'bodyScan', 'visualization', 'yogaNidra', 'mindfulness']),
        durationMinutes: z.number().min(1).max(120),
        difficulty: z.enum(['beginner', 'intermediate', 'advanced']),
        benefits: z.array(z.string()).min(1),
        bestFor: z.array(z.enum(['preSleep', 'postWorkout', 'stressRelief', 'recovery']))
    })
});
