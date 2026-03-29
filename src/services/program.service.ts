import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// ─── List & Filter ────────────────────────────────────────────────────────────

export const listPrograms = async (filters: {
  category?: string;
  difficulty?: string;
  goal?: string;
  equipment?: string;
  maxWeeks?: number;
  isFree?: boolean;
  search?: string;
  page?: number;
  limit?: number;
}) => {
  const {
    category, difficulty, goal, equipment, maxWeeks,
    isFree, search, page = 1, limit = 20,
  } = filters;

  const where: any = { isActive: true };
  if (category) where.category = category;
  if (difficulty) where.difficulty = difficulty;
  if (goal) where.goal = goal;
  if (equipment) where.equipmentNeeded = { has: equipment };
  if (maxWeeks) where.durationWeeks = { lte: maxWeeks };
  if (isFree !== undefined) where.isFree = isFree;
  if (search) {
    where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { description: { contains: search, mode: 'insensitive' } },
    ];
  }

  const [programs, total] = await Promise.all([
    prisma.workoutProgram.findMany({
      where,
      include: { _count: { select: { enrollments: true } } },
      orderBy: [{ isFeatured: 'desc' }, { enrollmentCount: 'desc' }, { createdAt: 'desc' }],
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.workoutProgram.count({ where }),
  ]);

  return { programs, total, page, limit, pages: Math.ceil(total / limit) };
};

export const getProgramById = async (programId: string, userId?: string) => {
  const program = await prisma.workoutProgram.findUnique({
    where: { id: programId },
    include: {
      weeks: {
        include: { days: { orderBy: { dayNumber: 'asc' } } },
        orderBy: { weekNumber: 'asc' },
      },
      _count: { select: { enrollments: true } },
    },
  });
  if (!program) throw new Error('PROGRAM_NOT_FOUND');

  let enrollment = null;
  if (userId) {
    enrollment = await prisma.programEnrollment.findUnique({
      where: { userId_programId: { userId, programId } },
    });
  }

  return { ...program, enrollment };
};

// ─── Enrollment ───────────────────────────────────────────────────────────────

export const enrollInProgram = async (userId: string, programId: string) => {
  const program = await prisma.workoutProgram.findUnique({ where: { id: programId } });
  if (!program || !program.isActive) throw new Error('PROGRAM_NOT_FOUND');

  const existing = await prisma.programEnrollment.findUnique({
    where: { userId_programId: { userId, programId } },
  });
  if (existing) return existing;

  const [enrollment] = await prisma.$transaction([
    prisma.programEnrollment.create({
      data: { userId, programId, currentWeek: 1, currentDay: 1 },
    }),
    prisma.workoutProgram.update({
      where: { id: programId },
      data: { enrollmentCount: { increment: 1 } },
    }),
  ]);

  return enrollment;
};

export const getMyPrograms = async (userId: string) => {
  return prisma.programEnrollment.findMany({
    where: { userId },
    include: {
      program: {
        include: { _count: { select: { enrollments: true } } },
      },
    },
    orderBy: { enrolledAt: 'desc' },
  });
};

export const updateProgramProgress = async (
  userId: string,
  programId: string,
  currentWeek: number,
  currentDay: number,
) => {
  const enrollment = await prisma.programEnrollment.findUnique({
    where: { userId_programId: { userId, programId } },
  });
  if (!enrollment) throw new Error('NOT_ENROLLED');

  const program = await prisma.workoutProgram.findUnique({ where: { id: programId } });
  const totalDays = (program?.durationWeeks ?? 1) * (program?.workoutsPerWeek ?? 1);
  const completedDays = (currentWeek - 1) * (program?.workoutsPerWeek ?? 1) + currentDay;
  const progressPercent = Math.min(100, (completedDays / totalDays) * 100);

  const completed = progressPercent >= 100;

  return prisma.programEnrollment.update({
    where: { userId_programId: { userId, programId } },
    data: {
      currentWeek,
      currentDay,
      progressPercent,
      lastActivityAt: new Date(),
      completed,
      completedAt: completed && !enrollment.completed ? new Date() : enrollment.completedAt,
    },
  });
};

export const completeProgram = async (userId: string, programId: string) => {
  const enrollment = await prisma.programEnrollment.findUnique({
    where: { userId_programId: { userId, programId } },
  });
  if (!enrollment) throw new Error('NOT_ENROLLED');

  return prisma.programEnrollment.update({
    where: { userId_programId: { userId, programId } },
    data: { completed: true, completedAt: new Date(), progressPercent: 100 },
  });
};
