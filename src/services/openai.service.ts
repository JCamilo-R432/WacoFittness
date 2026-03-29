import OpenAI from 'openai';
import type { Response } from 'express';
import prisma from '../config/database';
import {
  MEAL_PLANNER_SYSTEM_PROMPT,
  buildMealPlanUserPrompt,
} from '../infrastructure/ai/prompts/meal-planner.prompt';
import {
  WORKOUT_GENERATOR_SYSTEM_PROMPT,
  buildWorkoutPrompt,
} from '../infrastructure/ai/prompts/workout-generator.prompt';
import {
  buildCoachingPrompt,
  FOOD_ANALYSIS_PROMPT,
} from '../infrastructure/ai/prompts/coaching.prompt';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Modelos disponibles por tier
const MODELS = {
  fast: 'gpt-4o-mini',    // Rápido y económico
  smart: 'gpt-4o',        // Más capaz (visión, estructurado)
  fallback: 'gpt-3.5-turbo',
};

export interface AIUsageLog {
  type: string;
  tokensUsed: number;
  modelUsed: string;
  userId: string;
}

class OpenAIService {
  private logUsage(log: AIUsageLog) {
    prisma.aIRecommendation.create({
      data: {
        userId: log.userId,
        type: log.type,
        prompt: '',
        response: '',
        tokensUsed: log.tokensUsed,
        modelUsed: log.modelUsed,
        metadata: { tracked: true },
      },
    }).catch(() => {}); // No bloquear el flujo
  }

  // ── Meal Plan Generation ──────────────────────────────────────────────────

  async generateMealPlan(userId: string, options: {
    daysRequested?: number;
    restrictions?: string[];
    cuisinePreferences?: string[];
  } = {}): Promise<object> {
    const [user, nutritionProfile, pantryItems] = await Promise.all([
      prisma.user.findUnique({ where: { id: userId }, select: { name: true } }),
      prisma.nutritionProfile.findUnique({ where: { userId } }),
      prisma.pantryItem.findMany({ where: { userId }, select: { name: true }, take: 30 }),
    ]);

    if (!nutritionProfile) throw new Error('Configura tu perfil nutricional antes de generar un plan');

    const prompt = buildMealPlanUserPrompt({
      name: user?.name || 'Usuario',
      goals: {
        calories: nutritionProfile.targetCalories || 2000,
        protein: nutritionProfile.targetProteinG || 150,
        carbs: nutritionProfile.targetCarbsG || 200,
        fat: nutritionProfile.targetFatG || 60,
      },
      restrictions: options.restrictions || [],
      activityLevel: nutritionProfile.activityLevel,
      weight: Number(nutritionProfile.weightKg),
      goal: nutritionProfile.goal,
      daysRequested: options.daysRequested || 1,
      cuisinePreferences: options.cuisinePreferences,
      pantryItems: pantryItems.map(p => p.name),
    });

    const response = await openai.chat.completions.create({
      model: MODELS.smart,
      messages: [
        { role: 'system', content: MEAL_PLANNER_SYSTEM_PROMPT },
        { role: 'user', content: prompt },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.7,
      max_tokens: 4000,
    });

    const content = response.choices[0]?.message?.content || '{}';
    const plan = JSON.parse(content);

    // Guardar en BD
    await prisma.aIRecommendation.create({
      data: {
        userId,
        type: 'meal_plan',
        prompt,
        response: content,
        tokensUsed: response.usage?.total_tokens,
        modelUsed: MODELS.smart,
        metadata: { daysRequested: options.daysRequested, restrictions: options.restrictions },
      },
    });

    return plan;
  }

  // ── Workout Generation ────────────────────────────────────────────────────

  async generateWorkout(userId: string, options: {
    weeksRequested?: number;
    specificGoals?: string[];
  } = {}): Promise<object> {
    const [user, trainingProfile, recentWorkouts] = await Promise.all([
      prisma.user.findUnique({ where: { id: userId }, select: { name: true } }),
      prisma.trainingProfile.findUnique({ where: { userId } }),
      prisma.workoutLog.findMany({
        where: { userId },
        orderBy: { workoutDate: 'desc' },
        take: 5,
        select: { workoutDate: true, durationMinutes: true },
      }),
    ]);

    if (!trainingProfile) throw new Error('Configura tu perfil de entrenamiento antes de generar una rutina');

    const prompt = buildWorkoutPrompt({
      name: user?.name || 'Usuario',
      level: trainingProfile.experienceLevel,
      goals: options.specificGoals || trainingProfile.goals,
      equipment: trainingProfile.equipmentAvailable,
      daysPerWeek: trainingProfile.daysPerWeek,
      sessionDurationMin: trainingProfile.sessionDurationMin,
      injuries: trainingProfile.injuries || '',
      recentWorkouts: recentWorkouts
        .map(w => `${w.workoutDate.toLocaleDateString()} (${w.durationMinutes || '?'} min)`)
        .join(', '),
      weeksRequested: options.weeksRequested || 4,
    });

    const response = await openai.chat.completions.create({
      model: MODELS.smart,
      messages: [
        { role: 'system', content: WORKOUT_GENERATOR_SYSTEM_PROMPT },
        { role: 'user', content: prompt },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.6,
      max_tokens: 5000,
    });

    const content = response.choices[0]?.message?.content || '{}';
    const workout = JSON.parse(content);

    await prisma.aIRecommendation.create({
      data: {
        userId,
        type: 'workout',
        prompt,
        response: content,
        tokensUsed: response.usage?.total_tokens,
        modelUsed: MODELS.smart,
      },
    });

    return workout;
  }

  // ── Food Image Analysis ───────────────────────────────────────────────────

  async analyzeFoodImage(userId: string, base64Image: string, mimeType = 'image/jpeg'): Promise<object> {
    const response = await openai.chat.completions.create({
      model: MODELS.smart, // gpt-4o tiene visión
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'image_url',
              image_url: { url: `data:${mimeType};base64,${base64Image}`, detail: 'high' },
            },
            { type: 'text', text: FOOD_ANALYSIS_PROMPT },
          ],
        },
      ],
      response_format: { type: 'json_object' },
      max_tokens: 1500,
    });

    const content = response.choices[0]?.message?.content || '{}';
    const analysis = JSON.parse(content);

    await prisma.aIRecommendation.create({
      data: {
        userId,
        type: 'food_scan',
        prompt: 'image_analysis',
        response: content,
        tokensUsed: response.usage?.total_tokens,
        modelUsed: MODELS.smart,
      },
    });

    return analysis;
  }

  // ── Coaching Chatbot ──────────────────────────────────────────────────────

  async chat(
    userId: string,
    sessionId: string,
    message: string,
    streamRes?: Response,
  ): Promise<string> {
    // Obtener contexto del usuario
    const [user, trainingProfile, nutritionProfile, recentWorkouts, recentMeals] = await Promise.all([
      prisma.user.findUnique({ where: { id: userId }, select: { name: true } }),
      prisma.trainingProfile.findUnique({ where: { userId } }),
      prisma.nutritionProfile.findUnique({ where: { userId } }),
      prisma.workoutLog.findMany({
        where: { userId },
        orderBy: { workoutDate: 'desc' },
        take: 3,
        select: { workoutDate: true, durationMinutes: true },
      }),
      prisma.mealLog.aggregate({
        where: { userId, consumedAt: { gte: new Date(Date.now() - 7 * 86400000) } },
        _avg: { calories: true, proteinG: true },
      }),
    ]);

    // Historial de conversación (últimos 10 mensajes de esta sesión)
    const history = await prisma.chatMessage.findMany({
      where: { userId, sessionId },
      orderBy: { createdAt: 'asc' },
      take: 10,
    });

    const systemPrompt = buildCoachingPrompt({
      name: user?.name || 'Usuario',
      goal: nutritionProfile?.goal || trainingProfile?.goals?.[0] || 'mantenimiento',
      level: trainingProfile?.experienceLevel || 'beginner',
      currentWeight: nutritionProfile ? Number(nutritionProfile.weightKg) : undefined,
      recentWorkouts: recentWorkouts.map(w => ({
        date: w.workoutDate.toLocaleDateString('es-ES'),
        type: 'entrenamiento',
        duration: w.durationMinutes || 0,
      })),
      recentMeals: recentMeals._avg.calories
        ? { avgCalories: Math.round(Number(recentMeals._avg.calories)), avgProtein: Math.round(Number(recentMeals._avg.proteinG) || 0) }
        : undefined,
    });

    const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
      { role: 'system', content: systemPrompt },
      ...history.map((m: { role: string; content: string }) => ({
        role: m.role as 'user' | 'assistant',
        content: m.content,
      })),
      { role: 'user', content: message },
    ];

    // Guardar mensaje del usuario
    await prisma.chatMessage.create({
      data: { userId, sessionId, role: 'user', content: message },
    });

    let assistantResponse = '';

    if (streamRes) {
      // Streaming — envía chunks al cliente via SSE
      streamRes.setHeader('Content-Type', 'text/event-stream');
      streamRes.setHeader('Cache-Control', 'no-cache');
      streamRes.setHeader('Connection', 'keep-alive');

      const stream = await openai.chat.completions.create({
        model: MODELS.fast,
        messages,
        stream: true,
        max_tokens: 600,
        temperature: 0.8,
      });

      for await (const chunk of stream) {
        const delta = chunk.choices[0]?.delta?.content || '';
        if (delta) {
          assistantResponse += delta;
          streamRes.write(`data: ${JSON.stringify({ content: delta })}\n\n`);
        }
      }

      streamRes.write('data: [DONE]\n\n');
      streamRes.end();
    } else {
      const response = await openai.chat.completions.create({
        model: MODELS.fast,
        messages,
        max_tokens: 600,
        temperature: 0.8,
      });
      assistantResponse = response.choices[0]?.message?.content || '';
    }

    // Guardar respuesta del asistente
    await prisma.chatMessage.create({
      data: { userId, sessionId, role: 'assistant', content: assistantResponse },
    });

    return assistantResponse;
  }

  // ── Progress Insights ─────────────────────────────────────────────────────

  async generateInsights(userId: string): Promise<object> {
    const [recentWorkouts, nutritionStats, personalRecords] = await Promise.all([
      prisma.workoutLog.findMany({
        where: { userId },
        orderBy: { workoutDate: 'desc' },
        take: 20,
        select: { workoutDate: true, totalVolume: true, durationMinutes: true, averageRPE: true },
      }),
      prisma.nutritionProgress.findMany({
        where: { userId },
        orderBy: { loggedDate: 'desc' },
        take: 14,
      }),
      prisma.personalRecord.findMany({
        where: { userId, isCurrent: true },
        include: { exercise: { select: { name: true } } },
        take: 10,
      }),
    ]);

    const prompt = `Analiza los siguientes datos de fitness y genera insights personalizados:

WORKOUTS (últimas ${recentWorkouts.length} sesiones):
${JSON.stringify(recentWorkouts.map(w => ({ date: w.workoutDate, volume: w.totalVolume, duration: w.durationMinutes, rpe: w.averageRPE })))}

NUTRICIÓN (últimas 2 semanas):
Promedio: ${nutritionStats.length > 0 ? Math.round(nutritionStats.reduce((a, n) => a + (n.totalCalories || 0), 0) / nutritionStats.length) : '?'} kcal/día

RÉCORDS PERSONALES ACTUALES:
${personalRecords.map(pr => `${pr.exercise.name}: ${pr.weightKg}kg x ${pr.reps}`).join(', ')}

Genera un análisis JSON con:
{
  "insights": [{ "category": "strength|nutrition|recovery|consistency", "title": "string", "description": "string", "trend": "improving|declining|stable", "recommendation": "string" }],
  "weeklyHighlight": "string",
  "focusArea": "string",
  "predictedProgress": { "metric": "string", "in30Days": "string", "in60Days": "string" }
}`;

    const response = await openai.chat.completions.create({
      model: MODELS.fast,
      messages: [{ role: 'user', content: prompt }],
      response_format: { type: 'json_object' },
      max_tokens: 1000,
    });

    const content = response.choices[0]?.message?.content || '{}';

    await prisma.aIRecommendation.create({
      data: {
        userId,
        type: 'insight',
        prompt,
        response: content,
        tokensUsed: response.usage?.total_tokens,
        modelUsed: MODELS.fast,
      },
    });

    return JSON.parse(content);
  }

  // ── Recipe Generation ──────────────────────────────────────────────────────

  async generateRecipe(userId: string, options: {
    ingredients: string[];
    targetMacros?: { calories: number; protein: number };
    restrictions?: string[];
    mealType?: string;
    cookTimeMax?: number;
  }): Promise<object> {
    const prompt = `Crea una receta usando principalmente: ${options.ingredients.join(', ')}
${options.targetMacros ? `Macros objetivo: ~${options.targetMacros.calories} kcal, ~${options.targetMacros.protein}g proteína` : ''}
${options.restrictions?.length ? `Restricciones: ${options.restrictions.join(', ')}` : ''}
${options.mealType ? `Tipo de comida: ${options.mealType}` : ''}
${options.cookTimeMax ? `Tiempo máximo: ${options.cookTimeMax} minutos` : ''}

Responde en JSON:
{
  "name": "string", "description": "string", "servings": number, "prepTime": number, "cookTime": number,
  "ingredients": [{ "name": "string", "amount": number, "unit": "string" }],
  "instructions": ["string"],
  "macros": { "calories": number, "protein": number, "carbs": number, "fat": number },
  "tips": ["string"], "variations": ["string"]
}`;

    const response = await openai.chat.completions.create({
      model: MODELS.fast,
      messages: [{ role: 'user', content: prompt }],
      response_format: { type: 'json_object' },
      max_tokens: 1000,
    });

    const content = response.choices[0]?.message?.content || '{}';
    await prisma.aIRecommendation.create({
      data: { userId, type: 'recipe', prompt, response: content, modelUsed: MODELS.fast, tokensUsed: response.usage?.total_tokens },
    });

    return JSON.parse(content);
  }

  // ── Rate History ──────────────────────────────────────────────────────────

  async getUserRecommendations(userId: string, type?: string, limit = 10) {
    return prisma.aIRecommendation.findMany({
      where: { userId, ...(type && { type }) },
      orderBy: { createdAt: 'desc' },
      take: limit,
      select: { id: true, type: true, rating: true, isBookmarked: true, createdAt: true, modelUsed: true, tokensUsed: true },
    });
  }
}

export const openAIService = new OpenAIService();
export default openAIService;
