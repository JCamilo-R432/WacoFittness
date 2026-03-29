import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// ─── List challenges ──────────────────────────────────────────────────────────

export const listChallenges = async (filter: 'active' | 'upcoming' | 'all' = 'active', userId?: string) => {
  const now = new Date();
  const where: any = { isActive: true, isPublic: true };

  if (filter === 'active') {
    where.startDate = { lte: now };
    where.endDate = { gte: now };
  } else if (filter === 'upcoming') {
    where.startDate = { gt: now };
  }

  const challenges = await prisma.fitnessChallenge.findMany({
    where,
    include: { _count: { select: { participants: true } } },
    orderBy: { startDate: 'asc' },
  });

  if (!userId) return challenges;

  const myIds = await prisma.fitnessChallengeParticipant.findMany({
    where: { userId, challengeId: { in: challenges.map((c) => c.id) } },
    select: { challengeId: true, progress: true, completed: true, rank: true },
  });
  const myMap = new Map(myIds.map((m) => [m.challengeId, m]));

  return challenges.map((c) => ({ ...c, myParticipation: myMap.get(c.id) ?? null }));
};

export const getChallengeById = async (challengeId: string, userId?: string) => {
  const challenge = await prisma.fitnessChallenge.findUnique({
    where: { id: challengeId },
    include: { _count: { select: { participants: true } } },
  });
  if (!challenge) throw new Error('CHALLENGE_NOT_FOUND');

  let myParticipation = null;
  if (userId) {
    myParticipation = await prisma.fitnessChallengeParticipant.findUnique({
      where: { challengeId_userId: { challengeId, userId } },
    });
  }

  return { ...challenge, myParticipation };
};

// ─── Join ─────────────────────────────────────────────────────────────────────

export const joinChallenge = async (userId: string, challengeId: string) => {
  const challenge = await prisma.fitnessChallenge.findUnique({ where: { id: challengeId } });
  if (!challenge || !challenge.isActive) throw new Error('CHALLENGE_NOT_FOUND');

  const now = new Date();
  if (challenge.endDate < now) throw new Error('CHALLENGE_ENDED');
  if (challenge.maxParticipants && challenge.currentParticipants >= challenge.maxParticipants) {
    throw new Error('CHALLENGE_FULL');
  }

  const existing = await prisma.fitnessChallengeParticipant.findUnique({
    where: { challengeId_userId: { challengeId, userId } },
  });
  if (existing) return existing;

  const [participant] = await prisma.$transaction([
    prisma.fitnessChallengeParticipant.create({
      data: { challengeId, userId },
    }),
    prisma.fitnessChallenge.update({
      where: { id: challengeId },
      data: { currentParticipants: { increment: 1 } },
    }),
  ]);

  return participant;
};

// ─── Progress update ──────────────────────────────────────────────────────────

export const submitProgress = async (
  userId: string, challengeId: string, progress: number,
) => {
  const participant = await prisma.fitnessChallengeParticipant.findUnique({
    where: { challengeId_userId: { challengeId, userId } },
  });
  if (!participant) throw new Error('NOT_JOINED');

  const challenge = await prisma.fitnessChallenge.findUnique({ where: { id: challengeId } });
  const completed = challenge ? progress >= challenge.targetValue : false;

  return prisma.fitnessChallengeParticipant.update({
    where: { challengeId_userId: { challengeId, userId } },
    data: {
      progress,
      lastCheckin: new Date(),
      completed,
      completedAt: completed && !participant.completed ? new Date() : participant.completedAt,
    },
  });
};

// ─── Leaderboard ──────────────────────────────────────────────────────────────

export const getLeaderboard = async (challengeId: string, limit = 50) => {
  const participants = await prisma.fitnessChallengeParticipant.findMany({
    where: { challengeId },
    orderBy: [{ progress: 'desc' }, { completedAt: 'asc' }],
    take: limit,
    select: {
      id: true, userId: true, progress: true, completed: true,
      completedAt: true, joinedAt: true, rank: true,
      user: { select: { id: true, name: true, avatarUrl: true } },
    },
  });

  // Assign live ranks
  return participants.map((p, i) => ({ ...p, liveRank: i + 1 }));
};

// ─── My challenges ────────────────────────────────────────────────────────────

export const getMyChallenges = async (userId: string) => {
  return prisma.fitnessChallengeParticipant.findMany({
    where: { userId },
    include: {
      challenge: { include: { _count: { select: { participants: true } } } },
    },
    orderBy: { joinedAt: 'desc' },
  });
};
