import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const detectPR = async (userId: string, exerciseId: string, weightKg: number, reps: number, logId: string) => {
    // Simple logic: if weight > any prior where reps >= same, it's a new PR
    const prior = await prisma.personalRecord.findFirst({
        where: { userId, exerciseId, reps: { gte: reps }, weightKg: { gte: weightKg } }
    });

    if (!prior) {
        // Demote old for exact reps if any
        await prisma.personalRecord.updateMany({
            where: { userId, exerciseId, reps },
            data: { isCurrent: false }
        });

        return await prisma.personalRecord.create({
            data: {
                userId,
                exerciseId,
                weightKg,
                reps,
                date: new Date(),
                workoutLogId: logId,
                isCurrent: true
            }
        });
    }
    return null;
};
