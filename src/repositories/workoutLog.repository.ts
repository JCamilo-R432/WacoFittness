import { PrismaClient, Prisma } from '@prisma/client';

const prisma = new PrismaClient();

export const createWorkout = async (userId: string, data: any) => {
    return await prisma.workoutLog.create({
        data: {
            userId,
            workoutDate: new Date(data.workoutDate),
            startTime: new Date(data.startTime),
            endTime: data.endTime ? new Date(data.endTime) : undefined,
            energyLevel: data.energyLevel,
            moodBefore: data.moodBefore,
            moodAfter: data.moodAfter,
            notes: data.notes,
            isCompleted: true,
            exercises: {
                create: data.exercises.map((ex: any) => ({
                    exerciseId: ex.exerciseId,
                    order: ex.order,
                    sets: ex.sets,
                    repsCompleted: ex.repsCompleted,
                    weightKg: ex.weightKg,
                    rpe: ex.rpe,
                    notes: ex.notes
                }))
            }
        },
        include: { exercises: true }
    });
};

export const getWorkoutById = async (id: string, userId: string) => {
    return await prisma.workoutLog.findUnique({
        where: { id, userId },
        include: { exercises: { include: { exercise: true } } }
    });
};

export const getDailyLogs = async (userId: string, date: Date) => {
    const nextDay = new Date(date);
    nextDay.setDate(date.getDate() + 1);

    return await prisma.workoutLog.findMany({
        where: {
            userId,
            workoutDate: {
                gte: date,
                lt: nextDay
            }
        },
        include: { exercises: true },
        orderBy: { startTime: 'desc' }
    });
};

export const deleteWorkout = async (id: string, userId: string) => {
    return await prisma.workoutLog.delete({
        where: { id, userId }
    });
};
