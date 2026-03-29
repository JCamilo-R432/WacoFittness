import { PrismaClient } from '@prisma/client';
import { calculateBMR, calculateTDEE, calculateTargetCalories, calculateMacros } from '../utils/nutrition';

const prisma = new PrismaClient();

export const getProfile = async (userId: string) => {
    return await prisma.nutritionProfile.findUnique({
        where: { userId }
    });
};

export const createOrUpdateProfile = async (userId: string, data: any) => {
    const { weightKg, heightCm, age, gender, activityLevel, goal } = data;

    const bmr = calculateBMR(weightKg, heightCm, age, gender);
    const tdee = calculateTDEE(bmr, activityLevel);
    const targetCalories = calculateTargetCalories(tdee, goal);
    const macros = calculateMacros(targetCalories, weightKg);

    const profileData = {
        ...data,
        tmb: bmr,
        tdee: tdee,
        targetCalories: targetCalories,
        targetProteinG: macros.targetProteinG,
        targetFatG: macros.targetFatG,
        targetCarbsG: macros.targetCarbsG
    };

    return await prisma.nutritionProfile.upsert({
        where: { userId },
        update: profileData,
        create: { userId, ...profileData }
    });
};

export const updateGoals = async (userId: string, data: any) => {
    const profile = await getProfile(userId);
    if (!profile) throw new Error('Profile not found');

    const merged = { ...profile, ...data };
    return createOrUpdateProfile(userId, {
        weightKg: Number(merged.weightKg),
        heightCm: Number(merged.heightCm),
        age: merged.age,
        gender: merged.gender,
        activityLevel: merged.activityLevel,
        goal: merged.goal,
        bodyFatPercentage: merged.bodyFatPercentage ? Number(merged.bodyFatPercentage) : undefined
    });
};
