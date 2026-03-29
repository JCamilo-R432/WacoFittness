// ── WacoCoach Voice Controller ─────────────────────────────────────────────
// Endpoint dedicado para el asistente de voz.
// Flujo: texto del usuario → router híbrido → (LLM si necesario) → texto de respuesta
// El backend NUNCA recibe ni envía audio. Solo procesa texto.

import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth';
import { routeQuery, UserData } from '../services/routerService';
import { sanitizeInput, isValidChatInput } from '../services/securityService';
import prisma from '../config/database';
import logger from '../config/logger';
import OpenAI from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// System prompt WacoCoach — personalidad del agente de voz
const WACOCOACH_VOICE_SYSTEM = `Sos WacoCoach, un asistente personal de fitness experto con años de experiencia.

🎯 TU PERSONALIDAD:
✅ Motivador pero realista (nunca prometas resultados mágicos)
✅ Empático y comprensivo con las frustraciones
✅ Basado en ciencia/evidencia
✅ Adaptable al nivel del usuario
✅ Lenguaje latinoamericano: "vos", "podés", "tenés"

🗣️ ESTILO PARA RESPUESTAS DE VOZ:
- Sé CONCISO: respuestas de 2-4 oraciones máximo (se van a escuchar en voz alta)
- Sin listas largas (difícil de escuchar), preferí oraciones fluidas
- Terminá con UNA pregunta de seguimiento relevante
- Usá emojis MUY POCO (se leen en voz alta)
- Números específicos cuando los tenés ("112 a 154 gramos", no "bastante proteína")

⚠️ LÍMITES OBLIGATORIOS:
❌ No diagnosticás lesiones → "Consultá con un fisioterapeuta"
❌ No recetás dietas médicas → "Hablá con un nutricionista"
❌ No prometés resultados específicos → "Cada cuerpo responde diferente"

{USER_CONTEXT}

{CALCULATED_DATA}`;

// ── Helpers ───────────────────────────────────────────────────────────────

async function getUserContext(userId: string): Promise<{ userData: UserData; contextStr: string }> {
  const [user, nutritionProfile, trainingProfile] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      select: { name: true },
    }),
    prisma.nutritionProfile.findUnique({
      where: { userId },
      select: { weightKg: true, heightCm: true, goal: true, activityLevel: true },
    }).catch(() => null),
    prisma.trainingProfile.findUnique({
      where: { userId },
      select: { experienceLevel: true },
    }).catch(() => null),
  ]);

  const userData: UserData = {
    name: user?.name || 'Usuario',
    weight: nutritionProfile?.weightKg ? Number(nutritionProfile.weightKg) : undefined,
    height: (nutritionProfile as any)?.heightCm ? Number((nutritionProfile as any).heightCm) : undefined,
    goal: nutritionProfile?.goal || undefined,
    activityLevel: nutritionProfile?.activityLevel || undefined,
    level: trainingProfile?.experienceLevel || undefined,
  };

  const contextParts: string[] = [`Usuario: ${userData.name}`];
  if (userData.weight) contextParts.push(`Peso: ${userData.weight}kg`);
  if (userData.goal) contextParts.push(`Objetivo: ${userData.goal}`);
  if (userData.level) contextParts.push(`Nivel: ${userData.level}`);

  return {
    userData,
    contextStr: contextParts.length > 1
      ? `[CONTEXTO DEL USUARIO]:\n${contextParts.join('\n')}`
      : '',
  };
}

// ── Controlador principal ─────────────────────────────────────────────────

export const voiceChat = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const rawText = req.body?.text;
    const userId = req.user!.id;

    if (!isValidChatInput(rawText)) {
      res.status(400).json({ success: false, error: 'text es requerido y debe tener entre 1 y 1000 caracteres' });
      return;
    }

    const text = sanitizeInput(rawText);

    // 1. Obtener contexto del usuario
    const { userData, contextStr } = await getUserContext(userId);

    // 2. Router híbrido: decidir qué camino tomar
    const route = routeQuery(text, userData);
    logger.info('voice_chat_route', { userId, routeType: route.type, skipLLM: route.skipLLM });

    // 3. Si es emergencia → respuesta directa sin LLM
    if (route.skipLLM && route.directResponse) {
      res.json({ success: true, text: route.directResponse, type: route.type });
      return;
    }

    // 4. Construir system prompt con contexto inyectado
    const systemPrompt = WACOCOACH_VOICE_SYSTEM
      .replace('{USER_CONTEXT}', contextStr)
      .replace('{CALCULATED_DATA}', route.llmContextExtra || '');

    // 5. Obtener historial reciente de esta sesión de voz (máx 6 mensajes = 3 turnos)
    const sessionId = `voice_${userId}`;
    const history = await prisma.chatMessage.findMany({
      where: { userId, sessionId },
      orderBy: { createdAt: 'desc' },
      take: 6,
    }).then(msgs => msgs.reverse());

    const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
      { role: 'system', content: systemPrompt },
      ...history.map(m => ({
        role: m.role as 'user' | 'assistant',
        content: m.content,
      })),
      { role: 'user', content: text },
    ];

    // 6. Guardar mensaje del usuario
    await prisma.chatMessage.create({
      data: { userId, sessionId, role: 'user', content: text },
    });

    // 7. Llamar al LLM
    const completion = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
      messages,
      max_tokens: 300,   // Respuestas cortas para TTS
      temperature: 0.8,
    });

    const responseText = completion.choices[0]?.message?.content || '¿Podés repetir eso?';

    // 8. Guardar respuesta del asistente
    await prisma.chatMessage.create({
      data: { userId, sessionId, role: 'assistant', content: responseText },
    });

    // 9. Log de uso de AI (sin bloquear la respuesta)
    prisma.aIRecommendation.create({
      data: {
        userId,
        type: `voice_chat_${route.type}`,
        prompt: text,
        response: responseText,
        tokensUsed: completion.usage?.total_tokens,
        modelUsed: process.env.OPENAI_MODEL || 'gpt-4o-mini',
      },
    }).catch(() => {});

    res.json({ success: true, text: responseText, type: route.type });

  } catch (err: any) {
    logger.error('voice_chat_error', { error: err.message, stack: err.stack });
    next(err);
  }
};

// ── GET /api/ai-coach/history ─────────────────────────────────────────────

export const getHistory = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const userId = req.user!.id;
    const sessionId = `voice_${userId}`;
    const limit  = Math.min(parseInt(String(req.query.limit  ?? 20), 10), 100);
    const offset = parseInt(String(req.query.offset ?? 0),  10);

    const [messages, total] = await Promise.all([
      prisma.chatMessage.findMany({
        where: { userId, sessionId },
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset,
        select: { id: true, role: true, content: true, createdAt: true },
      }),
      prisma.chatMessage.count({ where: { userId, sessionId } }),
    ]);

    res.json({ success: true, messages: messages.reverse(), total, limit, offset });
  } catch (err: any) {
    logger.error('get_history_error', { error: err.message });
    next(err);
  }
};

// ── DELETE /api/ai-coach/history ──────────────────────────────────────────

export const clearHistory = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const userId = req.user!.id;
    const sessionId = `voice_${userId}`;

    const { count } = await prisma.chatMessage.deleteMany({ where: { userId, sessionId } });

    logger.info('voice_history_cleared', { userId, deleted: count });
    res.json({ success: true, deleted: count });
  } catch (err: any) {
    logger.error('clear_history_error', { error: err.message });
    next(err);
  }
};
