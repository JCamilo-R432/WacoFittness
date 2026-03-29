import * as mealPlanRepo from '../repositories/mealPlan.repository';
import * as profileService from '../services/nutritionProfile.service';
import { generatePlan as algGenerate } from '../utils/mealPlanGenerator';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const generateMealPlan = async (userId: string, durationDays: number, preferences: string[], startDateStr?: string) => {
    const activeCount = await mealPlanRepo.countActivePlans(userId);
    if (activeCount >= 3) {
        throw new Error('Maximum of 3 active meal plans allowed');
    }

    const startDate = startDateStr ? new Date(startDateStr) : new Date();
    const endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + durationDays - 1);

    const isOverlap = await mealPlanRepo.hasOverlappingPlan(userId, startDate, endDate);
    if (isOverlap) {
        throw new Error('Meal plan dates overlap with an existing active plan');
    }

    const profile = await profileService.getProfile(userId);
    if (!profile || !profile.targetCalories || !profile.targetProteinG || !profile.targetCarbsG || !profile.targetFatG) {
        throw new Error('Complete nutrition profile is required before generating a plan');
    }

    const generatedDays = await algGenerate(
        userId,
        profile.targetCalories,
        profile.targetProteinG,
        profile.targetCarbsG,
        profile.targetFatG,
        durationDays,
        preferences,
        startDate
    );

    const totalCalories = generatedDays.reduce((acc: number, day: any) => acc + day.totalCalories, 0);

    return await mealPlanRepo.createPlan({
        userId,
        name: `Plan - ${durationDays} days`,
        durationDays,
        startDate,
        endDate,
        totalCalories
    }, generatedDays);
};

export const getActiveMealPlans = async (userId: string) => {
    return await mealPlanRepo.getActivePlans(userId);
};

export const getMealPlanById = async (userId: string, id: string) => {
    const plan = await mealPlanRepo.getPlanById(id, userId);
    if (!plan) throw new Error('Meal plan not found');
    return plan;
};

export const activatePlan = async (userId: string, id: string) => {
    return await mealPlanRepo.togglePlanActive(id, userId, true);
};

export const deactivatePlan = async (userId: string, id: string) => {
    return await mealPlanRepo.togglePlanActive(id, userId, false);
};

export const deleteMealPlan = async (userId: string, id: string) => {
    await getMealPlanById(userId, id); // Ensure exists and owned
    return await mealPlanRepo.deletePlan(id, userId);
};

export const swapFood = async (userId: string, mealId: string, newFoodItemId: string) => {
    // Very simplistic swap mock updating calories ±10% roughly
    // You would typically use Prisma to update the meal
    const meal = await prisma.meal.findUnique({ where: { id: mealId } });
    if (!meal) throw new Error('Meal not found');

    const food = await prisma.foodItem.findUnique({ where: { id: newFoodItemId } });
    if (!food) throw new Error('Food not found');

    // Logic to simulate swap adjusting calories
    const newCals = Math.round(food.caloriesPer100g * 1.5);
    return await prisma.meal.update({
        where: { id: mealId },
        data: {
            name: food.name,
            calories: newCals,
            proteinG: Number(food.proteinPer100g) * 1.5,
            carbsG: Number(food.carbsPer100g) * 1.5,
            fatG: Number(food.fatPer100g) * 1.5
        }
    });
};

export const generateShoppingList = async (userId: string, id: string) => {
    // Genera lista basada en plan
    const plan = await getMealPlanById(userId, id);
    const items = [];
    for (const day of plan.days) {
        for (const meal of day.meals) {
            items.push({ mealName: meal.name, type: meal.mealType });
        }
    }
    // Remove duplicates normally
    return { planId: id, list: items };
};
