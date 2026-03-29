import prisma from '../config/database';

export class NutritionService {
  static async getFoods(params: any, userId: string) {
    const { query, category, page = 1, limit = 20 } = params;
    const skip = (page - 1) * limit;

    const where: any = {
      OR: [
        { isCustom: false },
        { userId: userId }
      ]
    };

    if (query) {
      where.name = { contains: query, mode: 'insensitive' };
    }

    if (category) {
      where.category = category;
    }

    const [items, total] = await Promise.all([
      prisma.foodItem.findMany({
        where,
        skip,
        take: limit,
        orderBy: { name: 'asc' }
      }),
      prisma.foodItem.count({ where })
    ]);

    return {
      items,
      total,
      pages: Math.ceil(total / limit)
    };
  }

  static async createFood(userId: string, data: any) {
    return await prisma.foodItem.create({
      data: {
        ...data,
        userId,
        isCustom: true
      }
    });
  }

  static async logMeal(userId: string, data: any) {
    const { foodItemId, quantityG, consumedAt, mealType, notes } = data;

    let calories = 0, proteinG = 0, carbsG = 0, fatG = 0;

    if (foodItemId) {
      const food = await prisma.foodItem.findUnique({ where: { id: foodItemId } });
      if (food) {
        const factor = quantityG / 100;
        calories = Math.round(food.caloriesPer100g * factor);
        proteinG = Number(food.proteinPer100g) * factor;
        carbsG = Number(food.carbsPer100g) * factor;
        fatG = Number(food.fatPer100g) * factor;
      }
    }

    return await prisma.mealLog.create({
      data: {
        userId,
        foodItemId,
        quantityG,
        consumedAt: new Date(consumedAt),
        mealType,
        notes,
        calories,
        proteinG,
        carbsG,
        fatG
      }
    });
  }

  static async getMealLogs(userId: string, date: string) {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    return await prisma.mealLog.findMany({
      where: {
        userId,
        consumedAt: {
          gte: startOfDay,
          lte: endOfDay
        }
      },
      include: { foodItem: true },
      orderBy: { consumedAt: 'asc' }
    });
  }

  static async getRecipes(params: any) {
    const { category, difficulty, page = 1, limit = 10 } = params;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (difficulty) where.difficultyLevel = difficulty;

    const [items, total] = await Promise.all([
      prisma.recipe.findMany({
        where,
        skip,
        take: limit,
        include: { tags: true },
        orderBy: { createdAt: 'desc' }
      }),
      prisma.recipe.count({ where })
    ]);

    return { items, total, pages: Math.ceil(total / limit) };
  }

  static async getRecipeById(id: string) {
    const recipe = await prisma.recipe.findUnique({
      where: { id },
      include: {
        ingredients: { include: { foodItem: true } },
        instructions: { orderBy: { stepNumber: 'asc' } },
        tags: true
      }
    });
    if (!recipe) throw new Error('Receta no encontrada');
    return recipe;
  }
}
