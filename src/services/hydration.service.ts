import prisma from '../config/database';

export class HydrationService {
  static async getGoal(userId: string) {
    let goal = await prisma.hydrationGoal.findUnique({ where: { userId } });
    if (!goal) {
      // Cálculo base: 35ml por kg de peso (asumiendo 70kg por defecto si no hay perfil)
      const profile = await prisma.nutritionProfile.findUnique({ where: { userId } });
      const weight = profile ? Number(profile.weightKg) : 70;
      const calculated = Math.round(weight * 35);

      goal = await prisma.hydrationGoal.create({
        data: {
          userId,
          dailyGoalMl: calculated,
          calculatedGoalMl: calculated,
          weightFactor: 1.0,
          activityFactor: 1.0,
          climateFactor: 1.0,
          supplementAdjustment: 0,
          lastCalculated: new Date()
        }
      });
    }
    return goal;
  }

  static async updateGoal(userId: string, dailyGoalMl: number) {
    return await prisma.hydrationGoal.upsert({
      where: { userId },
      update: { dailyGoalMl, lastCalculated: new Date() },
      create: {
        userId,
        dailyGoalMl,
        calculatedGoalMl: dailyGoalMl,
        weightFactor: 1.0,
        activityFactor: 1.0,
        climateFactor: 1.0,
        supplementAdjustment: 0,
        lastCalculated: new Date()
      }
    });
  }

  static async logWater(userId: string, data: any) {
    const { amountMl, liquidType = 'water', liquidName, consumedAt } = data;

    // El factor de hidratación varía según el líquido (agua=1.0, café=0.8, etc.)
    const factors: Record<string, number> = { water: 1.0, coffee: 0.8, tea: 0.9, sports: 1.1 };
    const factor = factors[liquidType] || 1.0;
    const effectiveMl = Math.round(amountMl * factor);

    return await prisma.hydrationLog.create({
      data: {
        userId,
        amountMl,
        liquidType,
        liquidName,
        hydrationFactor: factor,
        effectiveMl,
        loggedAt: consumedAt ? new Date(consumedAt) : new Date(),
      }
    });
  }

  static async getHistory(userId: string, days = 7) {
    const dateLimit = new Date();
    dateLimit.setDate(dateLimit.getDate() - days);

    return await prisma.hydrationLog.findMany({
      where: { userId, loggedAt: { gte: dateLimit } },
      orderBy: { loggedAt: 'desc' }
    });
  }

  static async getStats(userId: string) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const logsToday = await prisma.hydrationLog.findMany({
      where: { userId, loggedAt: { gte: today } }
    });

    const totalToday = logsToday.reduce((sum, log) => sum + log.effectiveMl, 0);
    const goal = await this.getGoal(userId);

    return {
      today: {
        current: totalToday,
        goal: goal.dailyGoalMl,
        percentage: Math.min(Math.round((totalToday / goal.dailyGoalMl) * 100), 100)
      },
      achievements: await prisma.hydrationAchievement.findMany({ where: { userId } })
    };
  }
}
