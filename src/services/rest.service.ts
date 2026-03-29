import prisma from '../config/database';

export class RestService {
  // Sueño
  static async logSleep(userId: string, data: any) {
    const { bedtime, wakeTime } = data;
    const durationHours = (new Date(wakeTime).getTime() - new Date(bedtime).getTime()) / (1000 * 60 * 60);

    return await prisma.sleepLog.create({
      data: {
        ...data,
        userId,
        durationHours: Number(durationHours.toFixed(2))
      }
    });
  }

  static async getSleepLogs(userId: string) {
    return await prisma.sleepLog.findMany({
      where: { userId },
      orderBy: { date: 'desc' },
      take: 30
    });
  }

  // Recuperación
  static async getRecoveryScore(userId: string) {
    const today = new Date();
    today.setHours(0,0,0,0);

    let score = await prisma.recoveryScore.findUnique({
      where: { userId_date: { userId, date: today } }
    });

    if (!score) {
      // Algoritmo de recuperación WacoPro (Simulado)
      // Basado en sueño, estrés y volumen de entrenamiento reciente
      const sleep = await prisma.sleepLog.findFirst({ where: { userId }, orderBy: { date: 'desc' } });
      const sleepScore = sleep ? (sleep.quality * 20) : 50;

      score = await prisma.recoveryScore.create({
        data: {
          userId,
          date: today,
          score: sleepScore, // Simplificado para el ejemplo
          sleepScore,
          recommendations: ['Mantén una hidratación constante', 'Realiza 10 min de estiramientos']
        }
      });
    }
    return score;
  }

  static async getRelaxationTechniques() {
    return await prisma.relaxationTechnique.findMany({
      where: { isPublic: true },
      orderBy: { usageCount: 'desc' }
    });
  }

  static async logRelaxation(userId: string, data: any) {
    return await prisma.relaxationLog.create({
      data: {
        ...data,
        userId,
        completedAt: new Date()
      }
    });
  }
}
