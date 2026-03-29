import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export async function saveFormCheckSession(userId: string, data: any) {
  return prisma.formCheckSession.create({
    data: {
      userId,
      exercise: data.exercise || 'squat',
      videoUrl: data.videoUrl || null,
      score: data.score ?? null,
      feedback: data.feedback || [],
      angles: data.angles || {},
      errors: data.errors || [],
      recommendations: data.recommendations || [],
    },
  });
}

export async function getFormCheckHistory(userId: string) {
  return prisma.formCheckSession.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    take: 20,
  });
}
