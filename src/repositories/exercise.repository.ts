import { PrismaClient, Prisma } from '@prisma/client';

const prisma = new PrismaClient();

export const searchExercises = async (
    query: string,
    category: string,
    equipment: string,
    page: number,
    limit: number,
    userId: string
) => {
    const skip = (page - 1) * limit;

    const where: Prisma.ExerciseWhereInput = {
        OR: [
            { isCustom: false },
            { creatorId: userId, isCustom: true }
        ]
    };

    if (query) {
        where.name = { contains: query, mode: 'insensitive' };
    }

    if (category) {
        where.category = { contains: category, mode: 'insensitive' };
    }

    if (equipment) {
        where.equipment = { has: equipment };
    }

    const [count, items] = await Promise.all([
        prisma.exercise.count({ where }),
        prisma.exercise.findMany({
            where,
            skip,
            take: limit,
            orderBy: { name: 'asc' }
        })
    ]);

    return { items, count, page, pages: Math.ceil(count / limit) };
};

export const findById = async (id: string) => {
    return await prisma.exercise.findUnique({
        where: { id }
    });
};

export const createCustom = async (userId: string, data: any) => {
    return await prisma.exercise.create({
        data: {
            ...data,
            creatorId: userId,
            isCustom: true,
            isVerified: false
        }
    });
};
