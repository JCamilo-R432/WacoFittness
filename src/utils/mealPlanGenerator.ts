import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Distribution logic based on targets
export const generatePlan = async (
    userId: string,
    targetCalories: number,
    targetProteinG: number,
    targetCarbsG: number,
    targetFatG: number,
    durationDays: number,
    preferences: string[],
    startDate: Date
) => {
    // distribution: desayuno 25%, media mañana 10%, almuerzo 30%, merienda 10%, cena 25%
    const mealsStructure = [
        { type: 'breakfast', percent: 0.25 },
        { type: 'morningSnack', percent: 0.10 },
        { type: 'lunch', percent: 0.30 },
        { type: 'afternoonSnack', percent: 0.10 },
        { type: 'dinner', percent: 0.25 },
    ];

    // Load subset of foods for fake distribution
    const allFoods = await prisma.foodItem.findMany({ take: 50 });

    const days = [];

    for (let i = 0; i < durationDays; i++) {
        const curDate = new Date(startDate);
        curDate.setDate(curDate.getDate() + i);

        const dsMeals = mealsStructure.map(ms => {
            const mealCals = Math.round(targetCalories * ms.percent);
            const mealPro = Math.round(targetProteinG * ms.percent);
            const mealCarb = Math.round(targetCarbsG * ms.percent);
            const mealFat = Math.round(targetFatG * ms.percent);

            return {
                mealType: ms.type,
                name: `Generated ${ms.type}`,
                calories: mealCals,
                proteinG: mealPro,
                carbsG: mealCarb,
                fatG: mealFat
            };
        });

        const totalC = dsMeals.reduce((acc, curr) => acc + curr.calories, 0);
        const totalP = dsMeals.reduce((acc, curr) => acc + curr.proteinG, 0);
        const totalCa = dsMeals.reduce((acc, curr) => acc + curr.carbsG, 0);
        const totalF = dsMeals.reduce((acc, curr) => acc + curr.fatG, 0);

        days.push({
            dayNumber: i + 1,
            date: curDate,
            totalCalories: totalC,
            totalProteinG: totalP,
            totalCarbsG: totalCa,
            totalFatG: totalF,
            meals: dsMeals
        });
    }

    return days;
};
