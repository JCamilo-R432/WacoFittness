import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth';
import openAIService from '../services/openai.service';

// ── Meal Plan ──────────────────────────────────────────────────────────────

export const generateMealPlan = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { daysRequested = 1, restrictions = [], cuisinePreferences = [] } = req.body;

    if (daysRequested < 1 || daysRequested > 7) {
      res.status(400).json({ error: 'daysRequested debe estar entre 1 y 7' });
      return;
    }

    const plan = await openAIService.generateMealPlan(req.user!.id, {
      daysRequested,
      restrictions,
      cuisinePreferences,
    });

    res.json({ success: true, plan, usage: (req as any).aiUsage });
  } catch (err: any) {
    if (err.message?.includes('perfil nutricional')) {
      res.status(400).json({ error: err.message });
      return;
    }
    next(err);
  }
};

// ── Workout Generator ──────────────────────────────────────────────────────

export const generateWorkout = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { weeksRequested = 4, specificGoals = [] } = req.body;

    if (weeksRequested < 1 || weeksRequested > 16) {
      res.status(400).json({ error: 'weeksRequested debe estar entre 1 y 16' });
      return;
    }

    const workout = await openAIService.generateWorkout(req.user!.id, {
      weeksRequested,
      specificGoals,
    });

    res.json({ success: true, workout, usage: (req as any).aiUsage });
  } catch (err: any) {
    if (err.message?.includes('perfil de entrenamiento')) {
      res.status(400).json({ error: err.message });
      return;
    }
    next(err);
  }
};

// ── Food Image Analysis ────────────────────────────────────────────────────

export const analyzeFoodImage = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { base64Image, mimeType = 'image/jpeg' } = req.body;

    if (!base64Image) {
      res.status(400).json({ error: 'base64Image es requerido' });
      return;
    }

    const validMimeTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!validMimeTypes.includes(mimeType)) {
      res.status(400).json({ error: 'mimeType inválido. Use image/jpeg, image/png, image/webp' });
      return;
    }

    // Rough size check (~4MB base64 limit)
    if (base64Image.length > 5_500_000) {
      res.status(400).json({ error: 'Imagen demasiado grande. Máximo 4MB' });
      return;
    }

    const analysis = await openAIService.analyzeFoodImage(req.user!.id, base64Image, mimeType);

    res.json({ success: true, analysis, usage: (req as any).aiUsage });
  } catch (err) {
    next(err);
  }
};

// ── Coaching Chat ──────────────────────────────────────────────────────────

export const chat = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { message, sessionId, stream = false } = req.body;

    if (!message || typeof message !== 'string') {
      res.status(400).json({ error: 'message es requerido' });
      return;
    }
    if (!sessionId || typeof sessionId !== 'string') {
      res.status(400).json({ error: 'sessionId es requerido' });
      return;
    }
    if (message.length > 2000) {
      res.status(400).json({ error: 'Mensaje demasiado largo (máx 2000 caracteres)' });
      return;
    }

    if (stream) {
      // SSE streaming response
      await openAIService.chat(req.user!.id, sessionId, message, res);
    } else {
      const response = await openAIService.chat(req.user!.id, sessionId, message);
      res.json({ success: true, response, sessionId, usage: (req as any).aiUsage });
    }
  } catch (err) {
    next(err);
  }
};

// ── Progress Insights ──────────────────────────────────────────────────────

export const getInsights = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const insights = await openAIService.generateInsights(req.user!.id);
    res.json({ success: true, insights, usage: (req as any).aiUsage });
  } catch (err) {
    next(err);
  }
};

// ── Recipe Generation ──────────────────────────────────────────────────────

export const generateRecipe = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { ingredients, targetMacros, restrictions, mealType, cookTimeMax } = req.body;

    if (!ingredients || !Array.isArray(ingredients) || ingredients.length === 0) {
      res.status(400).json({ error: 'ingredients es requerido (array de strings)' });
      return;
    }
    if (ingredients.length > 20) {
      res.status(400).json({ error: 'Máximo 20 ingredientes' });
      return;
    }

    const recipe = await openAIService.generateRecipe(req.user!.id, {
      ingredients,
      targetMacros,
      restrictions,
      mealType,
      cookTimeMax,
    });

    res.json({ success: true, recipe, usage: (req as any).aiUsage });
  } catch (err) {
    next(err);
  }
};

// ── AI History ────────────────────────────────────────────────────────────

export const getAIHistory = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { type, limit = '10' } = req.query;
    const limitNum = Math.min(parseInt(limit as string, 10) || 10, 50);

    const history = await openAIService.getUserRecommendations(
      req.user!.id,
      type as string | undefined,
      limitNum,
    );

    res.json({ success: true, history });
  } catch (err) {
    next(err);
  }
};

// ── AI Usage Status ────────────────────────────────────────────────────────

export const getUsageStatus = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    // aiUsageLimit middleware already ran and incremented — read directly
    const { id } = req.user!;
    const prisma = (await import('../config/database')).default;

    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        aiDailyUsage: true,
        aiDailyReset: true,
        aiOptOut: true,
        subscription: { select: { planId: true } },
      },
    });

    const planId = user?.subscription?.planId || 'free';
    const AI_LIMITS: Record<string, number> = { free: 5, pro: 50, premium: 200 };
    const limit = AI_LIMITS[planId] ?? 5;
    const used = user?.aiDailyUsage || 0;

    res.json({
      success: true,
      usage: {
        used,
        limit,
        remaining: Math.max(0, limit - used),
        plan: planId,
        resetAt: new Date(new Date().setHours(24, 0, 0, 0)).toISOString(),
        optOut: user?.aiOptOut || false,
      },
    });
  } catch (err) {
    next(err);
  }
};
