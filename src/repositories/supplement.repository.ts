import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Supplements DB
export const getSupplements = async (category?: string) => {
    return await prisma.supplement.findMany({
        where: {
            ...(category && { category })
        },
        orderBy: { name: 'asc' }
    });
};

export const getSupplementById = async (id: string) => {
    return await prisma.supplement.findUnique({
        where: { id }
    });
};

// User Inventory
export const getUserInventory = async (userId: string) => {
    return await prisma.userSupplement.findMany({
        where: { userId, isActive: true },
        include: { supplement: true },
        orderBy: { daysRemaining: 'asc' }
    });
};

export const addUserSupplement = async (userId: string, data: any) => {
    return await prisma.userSupplement.create({
        data: { userId, ...data }
    });
};

export const updateUserInventory = async (id: string, userId: string, data: any) => {
    return await prisma.userSupplement.update({
        where: { id },
        data
    });
};

// Logs
export const createSupplementLog = async (userId: string, data: any) => {
    return await prisma.supplementLog.create({
        data: { userId, takenAt: new Date(), ...data }
    });
};

export const getLogs = async (userId: string, startDate?: Date) => {
    return await prisma.supplementLog.findMany({
        where: {
            userId,
            ...(startDate && { takenAt: { gte: startDate } })
        },
        include: { supplement: true },
        orderBy: { takenAt: 'desc' }
    });
};

// Stacks
export const getStacks = async () => {
    return await prisma.supplementStack.findMany({
        where: { isPublic: true },
        include: { supplements: { include: { supplement: true } } }
    });
};
