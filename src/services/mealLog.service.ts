import * as mealLogRepo from '../repositories/mealLog.repository';
import { PrismaClient, Prisma } from '@prisma/client';

const prisma = new PrismaClient(); // We need this to get FoodItem for macros calc

export const createMealLog = async (userId: string, data: any) => {
    const consumedAt = new Date(data.consumedAt);
    const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;

    if (Date.now() - consumedAt.getTime() > THIRTY_DAYS_MS) {
        throw new Error('Date cannot be more than 30 days in the past');
    }

    let finalCalories = data.calories;
    let finalProtein = data.proteinG;
    let finalCarbs = data.carbsG;
    let finalFat = data.fatG;

    if (data.foodItemId) {
        const food = await prisma.foodItem.findUnique({ where: { id: data.foodItemId } });
        if (food) {
            const factor = (data.quantityG / 100);
            finalCalories = finalCalories ?? Math.round(food.caloriesPer100g * factor);
            finalProtein = finalProtein ?? Number(food.proteinPer100g) * factor;
            finalCarbs = finalCarbs ?? Number(food.carbsPer100g) * factor;
            finalFat = finalFat ?? Number(food.fatPer100g) * factor;
        }
    }

    return await mealLogRepo.create({
        userId,
        foodItemId: data.foodItemId,
        mealType: data.mealType,
        consumedAt,
        quantityG: data.quantityG,
        calories: finalCalories,
        proteinG: finalProtein,
        carbsG: finalCarbs,
        fatG: finalFat,
        satietyLevel: data.satietyLevel,
        mood: data.mood,
        location: data.location,
        photoUrl: data.photoUrl,
        notes: data.notes
    });
};

export const duplicateMealLog = async (userId: string, logId: string) => {
    const existing = await mealLogRepo.findById(logId);
    if (!existing || existing.userId !== userId) throw new Error('Meal log not found');

    const now = new Date();

    return await mealLogRepo.create({
        userId,
        foodItemId: existing.foodItemId,
        mealType: existing.mealType,
        consumedAt: now, // new date
        quantityG: Number(existing.quantityG),
        calories: existing.calories,
        proteinG: existing.proteinG ? Number(existing.proteinG) : undefined,
        carbsG: existing.carbsG ? Number(existing.carbsG) : undefined,
        fatG: existing.fatG ? Number(existing.fatG) : undefined,
        satietyLevel: existing.satietyLevel,
        mood: existing.mood,
        location: existing.location,
        photoUrl: existing.photoUrl,
        notes: existing.notes
    });
};

export const getDailySummary = async (userId: string, dateStr: string) => {
    const start = new Date(dateStr);
    start.setUTCHours(0, 0, 0, 0);
    const end = new Date(start);
    end.setUTCDate(end.getUTCDate() + 1);

    const logs = await mealLogRepo.findByDateAndType(userId, start, end);

    const summary = logs.reduce((acc, log) => {
        acc.totalCalories += log.calories || 0;
        acc.totalProteinG += Number(log.proteinG) || 0;
        acc.totalCarbsG += Number(log.carbsG) || 0;
        acc.totalFatG += Number(log.fatG) || 0;
        return acc;
    }, { totalCalories: 0, totalProteinG: 0, totalCarbsG: 0, totalFatG: 0, _logs: logs });

    return summary;
};

export const getWeeklySummary = async (userId: string, startDateStr: string, endDateStr: string) => {
    const start = new Date(startDateStr);
    start.setUTCHours(0, 0, 0, 0);
    const end = new Date(endDateStr);
    end.setUTCHours(23, 59, 59, 999);

    const logs = await mealLogRepo.findByDateAndType(userId, start, end);

    // Simple trends
    const summary = { totalCalories: 0, daysCount: 0 };
    const dailyTracker = new Set<string>();

    logs.forEach(log => {
        summary.totalCalories += log.calories || 0;
        const d = log.consumedAt.toISOString().split('T')[0];
        dailyTracker.add(d);
    });
    summary.daysCount = dailyTracker.size;

    return {
        ...summary,
        averageDailyCalories: summary.daysCount ? summary.totalCalories / summary.daysCount : 0
    };
};

export const getFrequentFoods = async (userId: string) => {
    const freqs = await mealLogRepo.findFrequent(userId);
    const foodIds = freqs.map(f => f.foodItemId).filter(id => id !== null) as string[];

    const foods = await prisma.foodItem.findMany({
        where: { id: { in: foodIds } }
    });

    return freqs.map(f => ({
        count: f._count.foodItemId,
        food: foods.find(fd => fd.id === f.foodItemId)
    }));
};

export const deleteMealLog = async (userId: string, logId: string) => {
    return await mealLogRepo.deleteLog(logId, userId);
};

export const getLogs = async (userId: string, dateStr: string, mealType?: string) => {
    const start = new Date(dateStr);
    start.setUTCHours(0, 0, 0, 0);
    const end = new Date(start);
    end.setUTCDate(end.getUTCDate() + 1);

    return await mealLogRepo.findByDateAndType(userId, start, end, mealType);
};
