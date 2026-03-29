import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// ─── Progress Photos ──────────────────────────────────────────────────────────

export const addProgressPhoto = async (
  userId: string,
  data: {
    photoUrl: string;
    angle?: string;
    takenAt?: Date;
    weightKg?: number;
    bodyFatPct?: number;
    notes?: string;
    isPrivate?: boolean;
  },
) => {
  return prisma.progressPhoto.create({
    data: {
      userId,
      photoUrl: data.photoUrl,
      angle: data.angle ?? 'front',
      takenAt: data.takenAt ?? new Date(),
      weightKg: data.weightKg,
      bodyFatPct: data.bodyFatPct,
      notes: data.notes,
      isPrivate: data.isPrivate ?? true,
    },
  });
};

export const getMyProgressPhotos = async (userId: string, angle?: string) => {
  return prisma.progressPhoto.findMany({
    where: { userId, ...(angle ? { angle } : {}) },
    orderBy: { takenAt: 'desc' },
  });
};

export const deleteProgressPhoto = async (userId: string, photoId: string) => {
  const photo = await prisma.progressPhoto.findUnique({ where: { id: photoId } });
  if (!photo || photo.userId !== userId) throw new Error('NOT_FOUND');
  return prisma.progressPhoto.delete({ where: { id: photoId } });
};

// ─── Body Measurements ────────────────────────────────────────────────────────

export const logBodyMeasurement = async (
  userId: string,
  data: {
    date?: Date;
    weightKg?: number;
    bodyFatPct?: number;
    muscleMassPct?: number;
    waistCm?: number;
    hipsCm?: number;
    chestCm?: number;
    armCm?: number;
    thighCm?: number;
    notes?: string;
  },
) => {
  const date = data.date ?? new Date();
  return prisma.bodyMeasurement.create({
    data: {
      userId,
      date,
      weightKg: data.weightKg,
      bodyFatPct: data.bodyFatPct,
      muscleMassPct: data.muscleMassPct,
      waistCm: data.waistCm,
      hipsCm: data.hipsCm,
      chestCm: data.chestCm,
      armCm: data.armCm,
      thighCm: data.thighCm,
      notes: data.notes,
    },
  });
};

export const getMyMeasurements = async (userId: string, limit = 30) => {
  return prisma.bodyMeasurement.findMany({
    where: { userId },
    orderBy: { date: 'desc' },
    take: limit,
  });
};

// ─── Stats overview ───────────────────────────────────────────────────────────

export const getProgressStats = async (userId: string) => {
  const [
    photoCount,
    latestMeasurement,
    firstMeasurement,
    workoutCount,
    programsCompleted,
    challengesCompleted,
  ] = await Promise.all([
    prisma.progressPhoto.count({ where: { userId } }),
    prisma.bodyMeasurement.findFirst({ where: { userId }, orderBy: { date: 'desc' } }),
    prisma.bodyMeasurement.findFirst({ where: { userId }, orderBy: { date: 'asc' } }),
    prisma.workoutLog.count({ where: { userId, isCompleted: true } }),
    prisma.programEnrollment.count({ where: { userId, completed: true } }),
    prisma.fitnessChallengeParticipant.count({ where: { userId, completed: true } }),
  ]);

  const weightChange = latestMeasurement && firstMeasurement && firstMeasurement.id !== latestMeasurement.id
    ? Number(latestMeasurement.weightKg ?? 0) - Number(firstMeasurement.weightKg ?? 0)
    : null;

  const bodyFatChange = latestMeasurement && firstMeasurement && firstMeasurement.id !== latestMeasurement.id
    ? Number(latestMeasurement.bodyFatPct ?? 0) - Number(firstMeasurement.bodyFatPct ?? 0)
    : null;

  return {
    photoCount,
    workoutCount,
    programsCompleted,
    challengesCompleted,
    latestMeasurement,
    weightChange,
    bodyFatChange,
    measurementHistory: await prisma.bodyMeasurement.findMany({
      where: { userId },
      orderBy: { date: 'asc' },
      select: { date: true, weightKg: true, bodyFatPct: true, waistCm: true },
    }),
  };
};

// ─── Workout streak ───────────────────────────────────────────────────────────

export const getWorkoutStreak = async (userId: string) => {
  const logs = await prisma.workoutLog.findMany({
    where: { userId, isCompleted: true },
    select: { workoutDate: true },
    orderBy: { workoutDate: 'desc' },
  });

  if (logs.length === 0) return { currentStreak: 0, longestStreak: 0 };

  let currentStreak = 0;
  let longestStreak = 0;
  let streak = 1;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const dates = [...new Set(logs.map((l) => l.workoutDate.toISOString().slice(0, 10)))];

  for (let i = 0; i < dates.length; i++) {
    if (i === 0) {
      const d = new Date(dates[0]);
      const diff = Math.floor((today.getTime() - d.getTime()) / 86400000);
      if (diff <= 1) currentStreak = 1;
      else break;
    } else {
      const d1 = new Date(dates[i - 1]);
      const d2 = new Date(dates[i]);
      const diff = Math.floor((d1.getTime() - d2.getTime()) / 86400000);
      if (diff === 1) {
        streak++;
        if (i === 1 || currentStreak > 0) currentStreak = streak;
      } else {
        if (streak > longestStreak) longestStreak = streak;
        streak = 1;
        if (currentStreak === 0) break;
      }
    }
  }

  if (streak > longestStreak) longestStreak = streak;

  return { currentStreak, longestStreak };
};
