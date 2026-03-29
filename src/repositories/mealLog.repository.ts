import { PrismaClient, MealLog, Prisma } from '@prisma/client';

const prisma = new PrismaClient();

export const create = async (data: Prisma.MealLogUncheckedCreateInput) => {
    return await prisma.mealLog.create({
        data,
        include: { foodItem: true }
    });
};

export const findById = async (id: string) => {
    return await prisma.mealLog.findUnique({
        where: { id },
        include: { foodItem: true }
    });
};

export const findByDateAndType = async (userId: string, dateStart: Date, dateEnd: Date, mealType?: string) => {
    const where: Prisma.MealLogWhereInput = {
        userId,
        consumedAt: {
            gte: dateStart,
            lt: dateEnd
        }
    };
    if (mealType) where.mealType = mealType;

    return await prisma.mealLog.findMany({
        where,
        include: { foodItem: true },
        orderBy: { consumedAt: 'asc' }
    });
};

export const deleteLog = async (id: string, userId: string) => {
    return await prisma.mealLog.delete({
        where: { id, userId } // ensuring user owns it
    });
};

export const findFrequent = async (userId: string) => {
    return await prisma.mealLog.groupBy({
        by: ['foodItemId'],
        where: { userId, foodItemId: { not: null } },
        _count: { foodItemId: true },
        orderBy: {
            _count: { foodItemId: 'desc' }
        },
        take: 10
    });
};
