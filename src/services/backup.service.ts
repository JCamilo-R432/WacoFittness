import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';
const prisma = new PrismaClient();

async function createBackupData(userId: string) {
  const [workoutLogs, mealLogs, trainingPlans, periodizedPlans, recoveryMetrics, nutritionProfile] = await Promise.all([
    prisma.workoutLog.findMany({ where: { userId }, include: { exercises: true }, take: 500 }),
    prisma.mealLog.findMany({ where: { userId }, take: 500 }),
    prisma.trainingPlan.findMany({ where: { userId }, include: { weeks: { include: { days: { include: { exercises: true } } } } } }),
    prisma.periodizedPlan.findMany({ where: { userId }, include: { phases: true, cycles: true } }),
    prisma.recoveryMetric.findMany({ where: { userId }, take: 365 }),
    prisma.nutritionProfile.findUnique({ where: { userId } }),
  ]);
  return { userId, exportedAt: new Date().toISOString(), workoutLogs, mealLogs, trainingPlans, periodizedPlans, recoveryMetrics, nutritionProfile };
}

export async function createBackup(userId: string, type: string = 'manual') {
  const data = await createBackupData(userId);
  const jsonStr = JSON.stringify(data);
  const checksum = crypto.createHash('sha256').update(jsonStr).digest('hex');
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 30);
  const backup = await prisma.backup.create({
    data: {
      userId,
      type,
      provider: 'local',
      filePath: `backup_${userId}_${Date.now()}.json`,
      fileSize: Buffer.byteLength(jsonStr),
      status: 'success',
      encrypted: false,
      expiresAt,
    },
  });
  return { backup, checksum, recordCount: Object.values(data).reduce((acc: number, v: any) => acc + (Array.isArray(v) ? v.length : 1), 0), data };
}

export async function listBackups(userId: string) {
  return prisma.backup.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
  });
}

export async function deleteBackup(userId: string, backupId: string) {
  const backup = await prisma.backup.findFirst({ where: { id: backupId, userId } });
  if (!backup) throw new Error('Backup no encontrado');
  await prisma.backup.delete({ where: { id: backupId } });
  return { success: true };
}
