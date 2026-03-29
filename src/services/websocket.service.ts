import { Server as HTTPServer } from 'http';
import { Server as SocketIOServer, Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import prisma from '../config/database';

interface AuthenticatedSocket extends Socket {
  userId?: string;
  userEmail?: string;
}

let io: SocketIOServer | null = null;

export function initWebSocket(httpServer: HTTPServer): SocketIOServer {
  io = new SocketIOServer(httpServer, {
    cors: {
      origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
      methods: ['GET', 'POST'],
      credentials: true,
    },
    pingTimeout: 60000,
    pingInterval: 25000,
  });

  // Auth middleware
  io.use(async (socket: AuthenticatedSocket, next) => {
    try {
      const token =
        socket.handshake.auth?.token ||
        socket.handshake.headers?.authorization?.replace('Bearer ', '');

      if (!token) {
        return next(new Error('Authentication required'));
      }

      const payload = jwt.verify(token, process.env.JWT_SECRET!) as { id: string; email: string };
      socket.userId = payload.id;
      socket.userEmail = payload.email;
      next();
    } catch {
      next(new Error('Invalid token'));
    }
  });

  io.on('connection', (socket: AuthenticatedSocket) => {
    const userId = socket.userId!;

    // Join personal room
    socket.join(`user:${userId}`);
    socket.emit('connected', { message: 'Conectado al servidor en tiempo real' });

    // ── Workout Live Tracking ──────────────────────────────────────────

    socket.on('workout:start', async (data: { workoutId?: string; planName?: string }) => {
      socket.join(`workout:${userId}`);
      socket.emit('workout:started', {
        sessionId: `ws_${Date.now()}`,
        startedAt: new Date().toISOString(),
        planName: data.planName,
      });
    });

    socket.on('workout:log_set', async (data: {
      sessionId: string;
      exerciseName: string;
      setNumber: number;
      reps: number;
      weightKg: number;
      rpe?: number;
    }) => {
      // Emit back with personal record check
      try {
        const pr = await prisma.personalRecord.findFirst({
          where: { userId, exercise: { name: data.exerciseName }, isCurrent: true },
          include: { exercise: true },
        });

        const isPR = pr && data.weightKg > Number(pr.weightKg);

        socket.emit('workout:set_logged', {
          ...data,
          isPR,
          previousBest: pr ? { weightKg: pr.weightKg, reps: pr.reps } : null,
          timestamp: new Date().toISOString(),
        });

        if (isPR) {
          socket.emit('workout:new_pr', {
            exercise: data.exerciseName,
            weightKg: data.weightKg,
            previousKg: pr?.weightKg,
            message: `¡Nuevo récord personal en ${data.exerciseName}! 🎉`,
          });
        }
      } catch {
        socket.emit('workout:set_logged', { ...data, timestamp: new Date().toISOString() });
      }
    });

    socket.on('workout:end', async (data: { sessionId: string; durationMinutes: number; totalVolume?: number }) => {
      socket.leave(`workout:${userId}`);
      socket.emit('workout:ended', {
        ...data,
        completedAt: new Date().toISOString(),
        message: '¡Entrenamiento completado! 💪',
      });
    });

    // ── Nutrition Real-time ───────────────────────────────────────────

    socket.on('nutrition:log_meal', async (data: {
      calories: number;
      proteinG: number;
      carbsG: number;
      fatG: number;
    }) => {
      try {
        const profile = await prisma.nutritionProfile.findUnique({
          where: { userId },
          select: { targetCalories: true, targetProteinG: true },
        });

        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);

        const todayTotals = await prisma.mealLog.aggregate({
          where: { userId, consumedAt: { gte: todayStart } },
          _sum: { calories: true, proteinG: true, carbsG: true, fatG: true },
        });

        const totalCalories = (todayTotals._sum.calories || 0) + data.calories;
        const targetCalories = profile?.targetCalories || 2000;
        const percentage = Math.round((totalCalories / targetCalories) * 100);

        socket.emit('nutrition:update', {
          today: {
            calories: totalCalories,
            proteinG: (Number(todayTotals._sum.proteinG) || 0) + data.proteinG,
            carbsG: (Number(todayTotals._sum.carbsG) || 0) + data.carbsG,
            fatG: (Number(todayTotals._sum.fatG) || 0) + data.fatG,
          },
          target: { calories: targetCalories, proteinG: profile?.targetProteinG || 150 },
          percentage,
          status: percentage >= 90 && percentage <= 110 ? 'on_track' : percentage > 110 ? 'over' : 'under',
        });
      } catch {
        // Silently fail — not critical
      }
    });

    // ── AI Coach Live Typing ──────────────────────────────────────────

    socket.on('ai:typing', (data: { sessionId: string }) => {
      // Could notify other devices of same user
      socket.emit('ai:typing_ack', { sessionId: data.sessionId });
    });

    // ── Wearable sync notification ────────────────────────────────────

    socket.on('wearable:sync_request', () => {
      socket.emit('wearable:sync_started', { timestamp: new Date().toISOString() });
    });

    // ── Disconnect ────────────────────────────────────────────────────

    socket.on('disconnect', () => {
      socket.leave(`user:${userId}`);
    });
  });

  return io;
}

// ── Server-side push utilities ─────────────────────────────────────────────

export function emitToUser(userId: string, event: string, data: unknown): void {
  io?.to(`user:${userId}`).emit(event, data);
}

export function emitToAll(event: string, data: unknown): void {
  io?.emit(event, data);
}

export function getIO(): SocketIOServer | null {
  return io;
}
