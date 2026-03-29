import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// ─── Coaches ──────────────────────────────────────────────────────────────────

export const listCoaches = async (filters: {
  specialty?: string;
  language?: string;
  maxRate?: number;
  search?: string;
  page?: number;
  limit?: number;
}) => {
  const { specialty, language, maxRate, search, page = 1, limit = 20 } = filters;

  const where: any = { isAvailable: true };
  if (specialty) where.specialties = { has: specialty };
  if (language) where.languages = { has: language };
  if (maxRate) where.sessionRate = { lte: maxRate };
  if (search) {
    where.OR = [
      { bio: { contains: search, mode: 'insensitive' } },
    ];
  }

  const [coaches, total] = await Promise.all([
    prisma.trainer.findMany({
      where,
      include: {
        _count: { select: { coachingSessions: true, virtualClasses: true } },
      },
      orderBy: [{ rating: 'desc' }, { reviewCount: 'desc' }],
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.trainer.count({ where }),
  ]);

  return { coaches, total, page, limit, pages: Math.ceil(total / limit) };
};

export const getCoachById = async (coachId: string) => {
  const coach = await prisma.trainer.findUnique({
    where: { id: coachId },
    include: {
      virtualClasses: {
        where: { isActive: true },
        take: 5,
        orderBy: { enrollmentCount: 'desc' },
      },
      _count: { select: { coachingSessions: true, virtualClasses: true } },
    },
  });
  if (!coach) throw new Error('COACH_NOT_FOUND');
  return coach;
};

// ─── Session booking ──────────────────────────────────────────────────────────

export const bookSession = async (
  userId: string,
  data: {
    coachId: string;
    scheduledAt: Date;
    durationMin?: number;
    type?: string;
    clientNotes?: string;
  },
) => {
  const coach = await prisma.trainer.findUnique({ where: { id: data.coachId } });
  if (!coach || !coach.isAvailable) throw new Error('COACH_NOT_AVAILABLE');

  // Check for conflicts (coach busy at that time)
  const conflict = await prisma.coachingSession.findFirst({
    where: {
      coachId: data.coachId,
      status: { in: ['scheduled'] },
      scheduledAt: {
        gte: new Date(data.scheduledAt.getTime() - 5 * 60000),
        lte: new Date(data.scheduledAt.getTime() + (data.durationMin ?? 60) * 60000),
      },
    },
  });
  if (conflict) throw new Error('TIME_SLOT_TAKEN');

  const priceCents = coach.sessionRate
    ? Math.round(Number(coach.sessionRate) * 100)
    : undefined;

  return prisma.coachingSession.create({
    data: {
      coachId: data.coachId,
      userId,
      scheduledAt: data.scheduledAt,
      durationMin: data.durationMin ?? 60,
      type: data.type ?? 'consultation',
      clientNotes: data.clientNotes,
      priceCents,
      status: 'scheduled',
    },
    include: { coach: true },
  });
};

export const cancelSession = async (userId: string, sessionId: string) => {
  const session = await prisma.coachingSession.findUnique({ where: { id: sessionId } });
  if (!session) throw new Error('SESSION_NOT_FOUND');
  if (session.userId !== userId) throw new Error('FORBIDDEN');
  if (session.status !== 'scheduled') throw new Error('CANNOT_CANCEL');

  // Check cancellation window (> 24h before)
  const hoursUntil = (session.scheduledAt.getTime() - Date.now()) / 3600000;
  if (hoursUntil < 24) throw new Error('TOO_LATE_TO_CANCEL');

  return prisma.coachingSession.update({
    where: { id: sessionId },
    data: { status: 'cancelled' },
  });
};

export const getMySessions = async (userId: string) => {
  return prisma.coachingSession.findMany({
    where: { userId },
    include: { coach: true },
    orderBy: { scheduledAt: 'desc' },
  });
};

export const getCoachSchedule = async (coachId: string, from: Date, to: Date) => {
  return prisma.coachingSession.findMany({
    where: {
      coachId,
      status: 'scheduled',
      scheduledAt: { gte: from, lte: to },
    },
    select: { scheduledAt: true, durationMin: true },
    orderBy: { scheduledAt: 'asc' },
  });
};

// ─── Complete session (coach action) ─────────────────────────────────────────

export const completeSession = async (
  coachId: string,
  sessionId: string,
  coachNotes?: string,
  recordingUrl?: string,
) => {
  const session = await prisma.coachingSession.findUnique({ where: { id: sessionId } });
  if (!session) throw new Error('SESSION_NOT_FOUND');
  if (session.coachId !== coachId) throw new Error('FORBIDDEN');

  return prisma.coachingSession.update({
    where: { id: sessionId },
    data: { status: 'completed', coachNotes, recordingUrl },
  });
};
