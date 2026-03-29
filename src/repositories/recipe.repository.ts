import { PrismaClient, Prisma } from '@prisma/client';

const prisma = new PrismaClient();

export const searchRecipes = async (
    query: string,
    minCal: number,
    maxCal: number,
    tags: string[],
    page: number,
    limit: number,
    userId: string
) => {
    const skip = (page - 1) * limit;

    const where: Prisma.RecipeWhereInput = {
        OR: [
            { isPublic: true },
            { creatorId: userId }
        ]
    };

    if (query) {
        where.OR = [
            { name: { contains: query, mode: 'insensitive' } },
            {
                tags: { some: { tag: { contains: query, mode: 'insensitive' } } }
            }
        ];
    }

    if (minCal > 0 || maxCal > 0) {
        where.caloriesPerServing = {};
        if (minCal > 0) where.caloriesPerServing.gte = minCal;
        if (maxCal > 0) where.caloriesPerServing.lte = maxCal;
    }

    if (tags && tags.length > 0) {
        where.tags = { some: { tag: { in: tags } } };
    }

    const [count, items] = await Promise.all([
        prisma.recipe.count({ where }),
        prisma.recipe.findMany({
            where,
            skip,
            take: limit,
            include: {
                tags: true,
                ingredients: true
            },
            orderBy: { createdAt: 'desc' }
        })
    ]);

    return { items, count, page, pages: Math.ceil(count / limit) };
};

export const getRecipeById = async (id: string) => {
    return await prisma.recipe.findUnique({
        where: { id },
        include: {
            creator: { select: { id: true, name: true } },
            ingredients: { include: { foodItem: true } },
            instructions: { orderBy: { stepNumber: 'asc' } },
            tags: true,
            reviews: { include: { user: { select: { name: true } } } }
        }
    });
};

export const createRecipe = async (creatorId: string, data: any) => {
    return await prisma.recipe.create({
        data: {
            creatorId,
            name: data.name,
            description: data.description,
            prepTimeMinutes: data.prepTimeMinutes,
            cookTimeMinutes: data.cookTimeMinutes,
            servings: data.servings,
            difficultyLevel: data.difficultyLevel,
            caloriesPerServing: data.caloriesPerServing,
            proteinPerServing: data.proteinPerServing,
            carbsPerServing: data.carbsPerServing,
            fatPerServing: data.fatPerServing,
            fiberPerServing: data.fiberPerServing,
            imageUrl: data.imageUrl,
            videoUrl: data.videoUrl,
            isPublic: data.isPublic,
            ingredients: {
                create: data.ingredients.map((i: any) => ({
                    foodItemId: i.foodItemId,
                    quantity: i.quantity,
                    unit: i.unit,
                    notes: i.notes
                }))
            },
            instructions: {
                create: data.instructions.map((ins: any) => ({
                    stepNumber: ins.stepNumber,
                    instruction: ins.instruction,
                    imageUrl: ins.imageUrl
                }))
            },
            tags: {
                create: data.tags?.map((t: string) => ({ tag: t })) || []
            }
        }
    });
};

export const updateRecipe = async (id: string, data: any) => {
    // Simplification for rapid development: omit updates to array fields directly or replace them
    return await prisma.recipe.update({
        where: { id },
        data: {
            name: data.name,
            description: data.description,
            isPublic: data.isPublic
            // Further detailed cascading updates would be handled here
        }
    });
};

export const deleteRecipe = async (id: string) => {
    return await prisma.recipe.delete({
        where: { id }
    });
};

export const addReview = async (recipeId: string, userId: string, rating: number, comentario?: string) => {
    return await prisma.$transaction(async (tx) => {
        const review = await tx.recipeReview.create({
            data: { recipeId, userId, rating, comentario }
        });

        // Aggregation update
        const stats = await tx.recipeReview.aggregate({
            where: { recipeId },
            _avg: { rating: true },
            _count: { rating: true }
        });

        await tx.recipe.update({
            where: { id: recipeId },
            data: {
                ratingAvg: stats._avg.rating || 0,
                ratingCount: stats._count.rating || 0
            }
        });

        return review;
    });
};

export const toggleFavorite = async (recipeId: string, userId: string) => {
    const existing = await prisma.recipeFavorite.findUnique({
        where: { recipeId_userId: { recipeId, userId } }
    });

    if (existing) {
        await prisma.recipeFavorite.delete({ where: { id: existing.id } });
        return { favorite: false };
    } else {
        await prisma.recipeFavorite.create({ data: { recipeId, userId } });
        return { favorite: true };
    }
};

export const getUserFavorites = async (userId: string) => {
    return await prisma.recipeFavorite.findMany({
        where: { userId },
        include: { recipe: true }
    });
};
