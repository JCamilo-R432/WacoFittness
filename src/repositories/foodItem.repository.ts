import { PrismaClient, Prisma } from '@prisma/client';

const prisma = new PrismaClient();

export const searchFoods = async (
    query: string,
    category: string,
    page: number,
    limit: number,
    userId: string
) => {
    const skip = (page - 1) * limit;

    const where: Prisma.FoodItemWhereInput = {
        OR: [
            { isCustom: false },
            { userId, isCustom: true }
        ]
    };

    if (query) {
        where.name = { contains: query, mode: 'insensitive' };
    }

    if (category) {
        where.category = { contains: category, mode: 'insensitive' };
    }

    const [count, items] = await Promise.all([
        prisma.foodItem.count({ where }),
        prisma.foodItem.findMany({
            where,
            skip,
            take: limit,
            orderBy: { name: 'asc' }
        })
    ]);

    return { items, count, page, pages: Math.ceil(count / limit) };
};

export const findById = async (id: string) => {
    return await prisma.foodItem.findUnique({
        where: { id }
    });
};

export const findByBarcode = async (barcode: string) => {
    return await prisma.foodItem.findUnique({
        where: { barcode }
    });
};

export const createCustomFood = async (userId: string, data: any) => {
    return await prisma.foodItem.create({
        data: {
            ...data,
            userId,
            isCustom: true,
            isVerified: false
        }
    });
};

export const findUserCustomFoods = async (userId: string) => {
    return await prisma.foodItem.findMany({
        where: { userId, isCustom: true },
        orderBy: { createdAt: 'desc' }
    });
};
