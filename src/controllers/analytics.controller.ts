import { Request, Response } from 'express';
import prisma from '../config/database';

export class AnalyticsController {
  // GET /api/analytics/overview
  static async getOverview(req: Request, res: Response) {
    try {
      const userId = (req as any).user.id;
      const now = new Date();
      const thirtyDaysAgo = new Date(now);
      thirtyDaysAgo.setDate(now.getDate() - 30);

      const [mealLogs, workoutLogs, waterLogs, sleepLogs] = await Promise.all([
        prisma.mealLog.findMany({ where: { userId, createdAt: { gte: thirtyDaysAgo } }, orderBy: { createdAt: 'asc' } }),
        prisma.workoutLog.findMany({ where: { userId, createdAt: { gte: thirtyDaysAgo } }, orderBy: { createdAt: 'asc' } }),
        prisma.hydrationLog.findMany({ where: { userId, createdAt: { gte: thirtyDaysAgo } }, orderBy: { createdAt: 'asc' } }),
        prisma.sleepLog.findMany({ where: { userId, createdAt: { gte: thirtyDaysAgo } }, orderBy: { createdAt: 'asc' } }),
      ]);

      // Aggregate by date
      const byDate = (logs: any[], valueKey: string) => {
        const map: Record<string, number> = {};
        logs.forEach(l => {
          const date = new Date(l.createdAt).toISOString().split('T')[0];
          map[date] = (map[date] || 0) + (Number(l[valueKey]) || 1);
        });
        return Object.entries(map).map(([date, value]) => ({ date, value }));
      };

      const nutritionByDay = byDate(mealLogs, 'calories');
      const workoutsByDay = byDate(workoutLogs, 'durationMinutes');
      const waterByDay = byDate(waterLogs, 'amountMl');

      const sleepByDay = sleepLogs.map(l => ({
        date: new Date(l.createdAt).toISOString().split('T')[0],
        value: Number((l as any).durationHours || (l as any).totalDuration || 0),
      }));

      res.json({
        success: true,
        data: {
          nutrition: nutritionByDay,
          workouts: workoutsByDay,
          hydration: waterByDay,
          sleep: sleepByDay,
          totals: {
            meals: mealLogs.length,
            workouts: workoutLogs.length,
            waterLogs: waterLogs.length,
            sleepLogs: sleepLogs.length,
          },
        },
      });
    } catch (e: any) {
      res.status(500).json({ success: false, error: e.message });
    }
  }

  // GET /api/analytics/body-measurements
  static async getBodyMeasurements(req: Request, res: Response) {
    try {
      const userId = (req as any).user.id;
      const measurements = await prisma.bodyMeasurement.findMany({
        where: { userId },
        orderBy: { date: 'asc' },
      });
      res.json({ success: true, data: measurements });
    } catch (e: any) {
      res.status(500).json({ success: false, error: e.message });
    }
  }

  // POST /api/analytics/body-measurements
  static async addBodyMeasurement(req: Request, res: Response) {
    try {
      const userId = (req as any).user.id;
      const { date, weightKg, bodyFatPct, muscleMassPct, chestCm, waistCm, hipsCm, armCm, thighCm, notes } = req.body;

      if (!date) return res.status(400).json({ success: false, error: 'La fecha es requerida' });

      const measurement = await prisma.bodyMeasurement.create({
        data: {
          userId,
          date: new Date(date),
          weightKg: weightKg ? Number(weightKg) : null,
          bodyFatPct: bodyFatPct ? Number(bodyFatPct) : null,
          muscleMassPct: muscleMassPct ? Number(muscleMassPct) : null,
          chestCm: chestCm ? Number(chestCm) : null,
          waistCm: waistCm ? Number(waistCm) : null,
          hipsCm: hipsCm ? Number(hipsCm) : null,
          armCm: armCm ? Number(armCm) : null,
          thighCm: thighCm ? Number(thighCm) : null,
          notes,
        },
      });
      res.status(201).json({ success: true, data: measurement });
    } catch (e: any) {
      res.status(500).json({ success: false, error: e.message });
    }
  }

  // GET /api/analytics/nutrition-summary
  static async getNutritionSummary(req: Request, res: Response) {
    try {
      const userId = (req as any).user.id;
      const { days = 7 } = req.query;
      const since = new Date();
      since.setDate(since.getDate() - Number(days));

      const meals = await prisma.mealLog.findMany({
        where: { userId, createdAt: { gte: since } },
      });

      const totalCalories = meals.reduce((s, m) => s + (Number((m as any).calories) || 0), 0);
      const totalProtein = meals.reduce((s, m) => s + (Number((m as any).proteinG) || 0), 0);
      const totalCarbs = meals.reduce((s, m) => s + (Number((m as any).carbsG) || 0), 0);
      const totalFat = meals.reduce((s, m) => s + (Number((m as any).fatG) || 0), 0);
      const avgCalories = meals.length ? Math.round(totalCalories / Number(days)) : 0;

      res.json({
        success: true,
        data: {
          period: Number(days),
          totalMeals: meals.length,
          avgCaloriesPerDay: avgCalories,
          totals: { calories: totalCalories, protein: totalProtein, carbs: totalCarbs, fat: totalFat },
        },
      });
    } catch (e: any) {
      res.status(500).json({ success: false, error: e.message });
    }
  }

  // GET /api/analytics/training-summary
  static async getTrainingSummary(req: Request, res: Response) {
    try {
      const userId = (req as any).user.id;
      const { days = 30 } = req.query;
      const since = new Date();
      since.setDate(since.getDate() - Number(days));

      const workouts = await prisma.workoutLog.findMany({
        where: { userId, createdAt: { gte: since } },
      });

      const totalWorkouts = workouts.length;
      const totalMinutes = workouts.reduce((s, w) => s + (Number((w as any).durationMinutes) || 0), 0);
      const avgDuration = totalWorkouts ? Math.round(totalMinutes / totalWorkouts) : 0;

      res.json({
        success: true,
        data: {
          period: Number(days),
          totalWorkouts,
          totalMinutes,
          avgDurationMinutes: avgDuration,
        },
      });
    } catch (e: any) {
      res.status(500).json({ success: false, error: e.message });
    }
  }
}
