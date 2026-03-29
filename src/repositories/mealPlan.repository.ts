import { PrismaClient, Prisma } from '@prisma/client';

const prisma = new PrismaClient();

export const countActivePlans = async (userId: string) => {
    return await prisma.mealPlan.count({
        where: { userId, isActive: true }
    });
};

export const hasOverlappingPlan = async (userId: string, start: Date, end: Date) => {
    const overlap = await prisma.mealPlan.findFirst({
        where: {
            userId,
            isActive: true,
            OR: [
                { startDate: { lte: end }, endDate: { gte: start } }
            ]
        }
    });
    return overlap !== null;
};

export const createPlan = async (data: Prisma.MealPlanUncheckedCreateInput, days: any[]) => {
    return await prisma.mealPlan.create({
        data: {
            ...data,
            days: {
                create: days.map(day => ({
                    dayNumber: day.dayNumber,
                    date: day.date,
                    totalCalories: day.totalCalories,
                    totalProteinG: day.totalProteinG,
                    totalCarbsG: day.totalCarbsG,
                    totalFatG: day.totalFatG,
                    meals: {
                        create: day.meals.map((meal: any) => ({
                            mealType: meal.mealType,
                            name: meal.name,
                            calories: meal.calories,
                            proteinG: meal.proteinG,
                            carbsG: meal.carbsG,
                            fatG: meal.fatG
                        }))
                    }
                }))
            }
        },
        include: {
            days: { include: { meals: true } }
        }
    });
};

export const getActivePlans = async (userId: string) => {
    return await prisma.mealPlan.findMany({
        where: { userId, isActive: true },
        include: { days: { include: { meals: true } } }
    });
};

export const getPlanById = async (id: string, userId: string) => {
    return await prisma.mealPlan.findUnique({
        where: { id, userId },
        include: { days: { include: { meals: true } } }
    });
};

export const getShoppingListForPlan = async (planId: string) => {
    // Mock grouping structure from days -> meals -> foodItems if we were linking foods natively.
    // Instead will return formatted representation.
    return [];
};

export const togglePlanActive = async (id: string, userId: string, isActive: boolean) => {
    return await prisma.mealPlan.update({
        where: { id },
        data: { isActive }
    });
};

export const deletePlan = async (id: string, userId: string) => {
    return await prisma.mealPlan.delete({
        where: { id }
    });
};
