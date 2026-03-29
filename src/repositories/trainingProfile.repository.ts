import { PrismaClient, Prisma } from '@prisma/client';

const prisma = new PrismaClient();

export const getProfile = async (userId: string) => {
    return await prisma.trainingProfile.findUnique({
        where: { userId }
    });
};

export const upsertProfile = async (userId: string, data: Prisma.TrainingProfileUncheckedCreateWithoutUserInput) => {
    return await prisma.trainingProfile.upsert({
        where: { userId },
        update: data,
        create: { userId, ...data }
    });
};
