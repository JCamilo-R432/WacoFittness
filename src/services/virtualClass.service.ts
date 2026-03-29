import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// ─── List & Filter ────────────────────────────────────────────────────────────

export const listClasses = async (filters: {
  categoryId?: string;
  difficulty?: string;
  isLive?: boolean;
  equipment?: string;
  maxDuration?: number;
  search?: string;
  instructorId?: string;
  isFeatured?: boolean;
  page?: number;
  limit?: number;
}) => {
  const {
    categoryId, difficulty, isLive, equipment, maxDuration,
    search, instructorId, isFeatured, page = 1, limit = 20,
  } = filters;

  const where: any = { isActive: true };
  if (categoryId) where.categoryId = categoryId;
  if (difficulty) where.difficulty = difficulty;
  if (isLive !== undefined) where.isLive = isLive;
  if (instructorId) where.instructorId = instructorId;
  if (isFeatured) where.isFeatured = true;
  if (maxDuration) where.durationMinutes = { lte: maxDuration };
  if (equipment) where.equipmentNeeded = { has: equipment };
  if (search) {
    where.OR = [
      { title: { contains: search, mode: 'insensitive' } },
      { description: { contains: search, mode: 'insensitive' } },
    ];
  }

  const [classes, total] = await Promise.all([
    prisma.virtualClass.findMany({
      where,
      include: {
        instructor: { select: { id: true, userId: true, rating: true } },
        category: { select: { id: true, name: true, slug: true, colorHex: true, iconName: true } },
        _count: { select: { enrollments: true, reviews: true } },
      },
      orderBy: [{ isFeatured: 'desc' }, { enrollmentCount: 'desc' }, { createdAt: 'desc' }],
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.virtualClass.count({ where }),
  ]);

  return { classes, total, page, limit, pages: Math.ceil(total / limit) };
};

export const getClassById = async (classId: string, userId?: string) => {
  const vc = await prisma.virtualClass.findUnique({
    where: { id: classId },
    include: {
      instructor: true,
      category: true,
      reviews: {
        include: { user: { select: { id: true, name: true, avatarUrl: true } } },
        orderBy: { createdAt: 'desc' },
        take: 10,
      },
      _count: { select: { enrollments: true } },
    },
  });
  if (!vc) throw new Error('CLASS_NOT_FOUND');

  let enrollment = null;
  if (userId) {
    enrollment = await prisma.classEnrollment.findUnique({
      where: { userId_classId: { userId, classId } },
    });
  }

  return { ...vc, enrollment };
};

// ─── Enrollment ───────────────────────────────────────────────────────────────

export const enrollInClass = async (userId: string, classId: string) => {
  const vc = await prisma.virtualClass.findUnique({ where: { id: classId } });
  if (!vc || !vc.isActive) throw new Error('CLASS_NOT_FOUND');

  const existing = await prisma.classEnrollment.findUnique({
    where: { userId_classId: { userId, classId } },
  });
  if (existing) return existing;

  const [enrollment] = await prisma.$transaction([
    prisma.classEnrollment.create({ data: { userId, classId } }),
    prisma.virtualClass.update({
      where: { id: classId },
      data: { enrollmentCount: { increment: 1 } },
    }),
  ]);

  return enrollment;
};

export const markClassCompleted = async (userId: string, classId: string) => {
  const enrollment = await prisma.classEnrollment.findUnique({
    where: { userId_classId: { userId, classId } },
  });
  if (!enrollment) throw new Error('NOT_ENROLLED');

  return prisma.classEnrollment.update({
    where: { userId_classId: { userId, classId } },
    data: { completed: true, completedAt: new Date() },
  });
};

export const updateWatchProgress = async (
  userId: string, classId: string, watchedSeconds: number,
) => {
  const enrollment = await prisma.classEnrollment.findUnique({
    where: { userId_classId: { userId, classId } },
  });
  if (!enrollment) throw new Error('NOT_ENROLLED');

  const vc = await prisma.virtualClass.findUnique({ where: { id: classId } });
  const totalSeconds = (vc?.durationMinutes ?? 0) * 60;
  const completed = totalSeconds > 0 && watchedSeconds >= totalSeconds * 0.9;

  return prisma.classEnrollment.update({
    where: { userId_classId: { userId, classId } },
    data: {
      watchedSeconds,
      lastWatchedAt: new Date(),
      completed: completed || enrollment.completed,
      completedAt: completed && !enrollment.completed ? new Date() : enrollment.completedAt,
    },
  });
};

export const getMyClasses = async (userId: string) => {
  return prisma.classEnrollment.findMany({
    where: { userId },
    include: {
      class: {
        include: {
          instructor: { select: { id: true, userId: true } },
          category: { select: { id: true, name: true, colorHex: true, iconName: true } },
        },
      },
    },
    orderBy: { enrolledAt: 'desc' },
  });
};

// ─── Reviews ──────────────────────────────────────────────────────────────────

export const rateClass = async (
  userId: string, classId: string, rating: number, comment?: string,
) => {
  if (rating < 1 || rating > 5) throw new Error('INVALID_RATING');

  const enrollment = await prisma.classEnrollment.findUnique({
    where: { userId_classId: { userId, classId } },
  });
  if (!enrollment) throw new Error('NOT_ENROLLED');

  const review = await prisma.classReview.upsert({
    where: { userId_classId: { userId, classId } },
    create: { userId, classId, rating, comment },
    update: { rating, comment },
  });

  // Recalculate average rating
  const agg = await prisma.classReview.aggregate({
    where: { classId },
    _avg: { rating: true },
    _count: { rating: true },
  });

  await prisma.virtualClass.update({
    where: { id: classId },
    data: {
      rating: Number(agg._avg.rating) || 0,
      reviewCount: agg._count.rating,
    },
  });

  return review;
};

// ─── Categories ───────────────────────────────────────────────────────────────

export const listCategories = async () => {
  return prisma.classCategory.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: 'asc' },
  });
};

// ─── Upcoming live classes ────────────────────────────────────────────────────

export const getUpcomingLive = async (limit = 10) => {
  return prisma.virtualClass.findMany({
    where: {
      isActive: true,
      isLive: true,
      scheduledAt: { gte: new Date() },
    },
    include: {
      instructor: { select: { id: true, userId: true, rating: true } },
      category: { select: { id: true, name: true, colorHex: true, iconName: true } },
    },
    orderBy: { scheduledAt: 'asc' },
    take: limit,
  });
};
