import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

function calcRecoveryScore(data: any): number {
  let score = 70; // base
  // HRV component (40%)
  if (data.hrv) {
    const hrvScore = Math.min(100, (data.hrv / 80) * 100);
    score = score * 0.6 + hrvScore * 0.4;
  }
  // Sleep component (30%)
  if (data.sleepHours !== undefined && data.sleepQuality !== undefined) {
    const sleepScore = Math.min(100, ((data.sleepHours / 8) * 50) + (data.sleepQuality * 5));
    score = score * 0.7 + sleepScore * 0.3;
  }
  // Fatigue component (20%)
  if (data.fatigueLevel !== undefined) {
    const fatigueScore = (11 - data.fatigueLevel) * 10;
    score = score * 0.8 + fatigueScore * 0.2;
  }
  // Stress component (10%)
  if (data.stressLevel !== undefined) {
    const stressScore = (11 - data.stressLevel) * 10;
    score = score * 0.9 + stressScore * 0.1;
  }
  return Math.round(Math.max(0, Math.min(100, score)));
}

function getRecommendation(score: number): string {
  if (score >= 80) return 'Entrena fuerte hoy — estás en óptimas condiciones';
  if (score >= 60) return 'Entreno moderado — buen estado de recuperación';
  if (score >= 40) return 'Descanso activo recomendado — camina, estira, yoga';
  return 'Descanso total — tu cuerpo necesita recuperarse';
}

export async function logMetric(userId: string, data: any) {
  const date = data.date ? new Date(data.date) : new Date();
  date.setHours(0, 0, 0, 0);
  const recoveryScore = calcRecoveryScore(data);
  return prisma.recoveryMetric.upsert({
    where: { userId_date: { userId, date } },
    create: { userId, date, ...data, recoveryScore },
    update: { ...data, recoveryScore },
  });
}

export async function getMetrics(userId: string, days: number = 30) {
  const since = new Date();
  since.setDate(since.getDate() - days);
  return prisma.recoveryMetric.findMany({
    where: { userId, date: { gte: since } },
    orderBy: { date: 'desc' },
  });
}

export async function getScore(userId: string) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const metric = await prisma.recoveryMetric.findFirst({
    where: { userId, date: { gte: today } },
    orderBy: { createdAt: 'desc' },
  });
  const score = metric?.recoveryScore ?? 70;
  return { score, recommendation: getRecommendation(score), metric };
}

export async function getSleepData(userId: string, days: number = 14) {
  const since = new Date();
  since.setDate(since.getDate() - days);
  const metrics = await prisma.recoveryMetric.findMany({
    where: { userId, date: { gte: since }, sleepHours: { not: null } },
    orderBy: { date: 'asc' },
    select: { date: true, sleepHours: true, sleepQuality: true },
  });
  const avgHours = metrics.length ? metrics.reduce((s, m) => s + (m.sleepHours ?? 0), 0) / metrics.length : 0;
  const avgQuality = metrics.length ? metrics.reduce((s, m) => s + (m.sleepQuality ?? 5), 0) / metrics.length : 0;
  return { metrics, avgHours: +avgHours.toFixed(1), avgQuality: +avgQuality.toFixed(1) };
}

export async function getHRVData(userId: string, days: number = 30) {
  const since = new Date();
  since.setDate(since.getDate() - days);
  const metrics = await prisma.recoveryMetric.findMany({
    where: { userId, date: { gte: since }, hrv: { not: null } },
    orderBy: { date: 'asc' },
    select: { date: true, hrv: true, restingHeartRate: true },
  });
  return { metrics };
}

export async function getRecommendations(userId: string) {
  const score = await getScore(userId);
  const sleep = await getSleepData(userId, 7);
  const hrv = await getHRVData(userId, 7);
  const recs = [];
  if (sleep.avgHours < 7) recs.push('Intenta dormir al menos 7-8 horas por noche');
  if (sleep.avgQuality < 6) recs.push('Mejora la calidad del sueño: evita pantallas antes de dormir');
  if (score.score < 60) recs.push('Considera un día de descanso activo hoy');
  if (hrv.metrics.length === 0) recs.push('Registra tu HRV diariamente para mejores recomendaciones');
  if (recs.length === 0) recs.push('¡Excelente recuperación! Mantén tus buenos hábitos');
  return { score, sleep, hrv, recommendations: recs };
}
