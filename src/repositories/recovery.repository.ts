import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const createSleepLog = async (userId: string, data: any) => {
    return await prisma.sleepLog.create({
        data: { userId, ...data }
    });
};

export const getSleepLogs = async (userId: string, dateStr?: string) => {
    if (dateStr) {
        const d = new Date(dateStr);
        return await prisma.sleepLog.findUnique({
            where: { userId_date: { userId, date: d } }
        });
    }
    return await prisma.sleepLog.findMany({
        where: { userId },
        orderBy: { date: 'desc' }
    });
};

export const createRelaxationTechniqueLog = async (userId: string, techniqueId: string, data: any) => {
    // Update usage count
    await prisma.relaxationTechnique.update({
        where: { id: techniqueId },
        data: { usageCount: { increment: 1 } }
    });

    return await prisma.relaxationLog.create({
        data: { userId, techniqueId, ...data }
    });
};

export const getRelaxationTechniques = async (filters: any) => {
    return await prisma.relaxationTechnique.findMany({
        where: filters,
        orderBy: { usageCount: 'desc' }
    });
};

export const createStressLog = async (userId: string, data: any) => {
    return await prisma.stressLog.create({
        data: { userId, ...data }
    });
};

export const createRecoveryScore = async (userId: string, data: any) => {
    return await prisma.recoveryScore.upsert({
        where: { userId_date: { userId, date: data.date } },
        update: data,
        create: { userId, ...data }
    });
};

export const getRecoveryScore = async (userId: string, date: Date) => {
    return await prisma.recoveryScore.findUnique({
        where: { userId_date: { userId, date } }
    });
};

export const createWearableData = async (userId: string, data: any) => {
    return await prisma.wearableData.upsert({
        where: { userId_source_date: { userId, source: data.source, date: data.date } },
        update: data,
        create: { userId, ...data }
    });
};
