import { Response, NextFunction } from 'express';
import { AuthRequest } from './auth';
import prisma from '../config/database';

// AI calls per day by subscription plan
const AI_LIMITS: Record<string, number> = {
  free: 5,
  pro: 50,
  premium: 200,
  support: 500,
  admin: 9999,
  superadmin: 9999,
};

export const aiUsageLimit = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user!.id;
    const role = req.user!.role || 'user';

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        aiDailyUsage: true,
        aiDailyReset: true,
        aiOptOut: true,
        subscription: { select: { planId: true } },
      },
    });

    if (!user) {
      res.status(404).json({ error: 'Usuario no encontrado' });
      return;
    }

    if (user.aiOptOut) {
      res.status(403).json({ error: 'Has optado por no usar funciones de IA. Actívalo en configuración.' });
      return;
    }

    // Determine plan
    const planId = user.subscription?.planId || 'free';
    const effectiveRole = role === 'admin' || role === 'superadmin' ? role : planId;
    const limit = AI_LIMITS[effectiveRole] ?? AI_LIMITS.free;

    // Reset counter if it's a new day
    const now = new Date();
    const lastReset = user.aiDailyReset ? new Date(user.aiDailyReset) : new Date(0);
    const isNewDay = now.toDateString() !== lastReset.toDateString();

    let currentUsage = user.aiDailyUsage || 0;

    if (isNewDay) {
      currentUsage = 0;
      await prisma.user.update({
        where: { id: userId },
        data: { aiDailyUsage: 0, aiDailyReset: now },
      });
    }

    if (currentUsage >= limit) {
      res.status(429).json({
        error: 'Límite diario de IA alcanzado',
        limit,
        used: currentUsage,
        resetAt: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1).toISOString(),
        upgradeUrl: '/pricing',
      });
      return;
    }

    // Increment usage
    await prisma.user.update({
      where: { id: userId },
      data: { aiDailyUsage: { increment: 1 } },
    });

    // Attach limit info to request for controllers
    (req as any).aiUsage = { current: currentUsage + 1, limit, plan: planId };

    next();
  } catch (err) {
    next(err);
  }
};
