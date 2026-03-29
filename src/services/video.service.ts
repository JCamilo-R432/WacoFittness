import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// ─── List videos ──────────────────────────────────────────────────────────────

export const listVideos = async (filters: {
  categoryId?: string;
  difficulty?: string;
  equipment?: string;
  muscleGroup?: string;
  maxDuration?: number;
  search?: string;
  isFeatured?: boolean;
  page?: number;
  limit?: number;
}) => {
  const {
    categoryId, difficulty, equipment, muscleGroup,
    maxDuration, search, isFeatured, page = 1, limit = 20,
  } = filters;

  const where: any = { isActive: true };
  if (categoryId) where.categoryId = categoryId;
  if (difficulty) where.difficulty = difficulty;
  if (equipment) where.equipmentNeeded = { has: equipment };
  if (muscleGroup) where.muscleGroups = { has: muscleGroup };
  if (maxDuration) where.durationSeconds = { lte: maxDuration * 60 };
  if (isFeatured) where.isFeatured = true;
  if (search) {
    where.OR = [
      { title: { contains: search, mode: 'insensitive' } },
      { description: { contains: search, mode: 'insensitive' } },
      { instructorName: { contains: search, mode: 'insensitive' } },
    ];
  }

  const [videos, total] = await Promise.all([
    prisma.onDemandVideo.findMany({
      where,
      include: {
        category: { select: { id: true, name: true, slug: true, iconName: true } },
        _count: { select: { watchHistory: true } },
      },
      orderBy: [{ isFeatured: 'desc' }, { viewCount: 'desc' }, { createdAt: 'desc' }],
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.onDemandVideo.count({ where }),
  ]);

  return { videos, total, page, limit, pages: Math.ceil(total / limit) };
};

export const getVideoById = async (videoId: string, userId?: string) => {
  const video = await prisma.onDemandVideo.findUnique({
    where: { id: videoId },
    include: { category: true },
  });
  if (!video) throw new Error('VIDEO_NOT_FOUND');

  // Increment view count (fire-and-forget)
  prisma.onDemandVideo.update({
    where: { id: videoId },
    data: { viewCount: { increment: 1 } },
  }).catch(() => {});

  let watchRecord = null;
  if (userId) {
    watchRecord = await prisma.userWatchHistory.findUnique({
      where: { userId_videoId: { userId, videoId } },
    });
  }

  return { ...video, watchRecord };
};

// ─── Watch history ────────────────────────────────────────────────────────────

export const logWatchTime = async (
  userId: string,
  videoId: string,
  watchedSeconds: number,
) => {
  const video = await prisma.onDemandVideo.findUnique({ where: { id: videoId } });
  if (!video) throw new Error('VIDEO_NOT_FOUND');

  const completed = video.durationSeconds > 0 && watchedSeconds >= video.durationSeconds * 0.9;

  return prisma.userWatchHistory.upsert({
    where: { userId_videoId: { userId, videoId } },
    create: {
      userId, videoId, watchedSeconds,
      totalSeconds: video.durationSeconds,
      lastWatchedAt: new Date(),
      completedAt: completed ? new Date() : undefined,
    },
    update: {
      watchedSeconds: { set: Math.max(watchedSeconds, 0) },
      lastWatchedAt: new Date(),
      completedAt: completed ? new Date() : undefined,
    },
  });
};

export const toggleVideoLike = async (userId: string, videoId: string) => {
  const history = await prisma.userWatchHistory.findUnique({
    where: { userId_videoId: { userId, videoId } },
  });

  if (!history) {
    // Create watch record with like
    const video = await prisma.onDemandVideo.findUnique({ where: { id: videoId } });
    if (!video) throw new Error('VIDEO_NOT_FOUND');

    await prisma.userWatchHistory.create({
      data: { userId, videoId, liked: true, totalSeconds: video.durationSeconds },
    });
    await prisma.onDemandVideo.update({
      where: { id: videoId },
      data: { likeCount: { increment: 1 } },
    });
    return { liked: true };
  }

  const newLiked = !history.liked;
  await prisma.userWatchHistory.update({
    where: { userId_videoId: { userId, videoId } },
    data: { liked: newLiked },
  });
  await prisma.onDemandVideo.update({
    where: { id: videoId },
    data: { likeCount: { increment: newLiked ? 1 : -1 } },
  });

  return { liked: newLiked };
};

export const getWatchHistory = async (userId: string, limit = 20) => {
  return prisma.userWatchHistory.findMany({
    where: { userId },
    include: { video: { include: { category: { select: { name: true, iconName: true } } } } },
    orderBy: { lastWatchedAt: 'desc' },
    take: limit,
  });
};

export const getRecommendedVideos = async (userId: string, limit = 10) => {
  // Get user's most-watched categories
  const history = await prisma.userWatchHistory.findMany({
    where: { userId },
    include: { video: { select: { categoryId: true, difficulty: true } } },
    orderBy: { lastWatchedAt: 'desc' },
    take: 20,
  });

  const watchedIds = history.map((h) => h.videoId);
  const topCategory = history[0]?.video.categoryId;
  const userDifficulty = history[0]?.video.difficulty ?? 'beginner';

  return prisma.onDemandVideo.findMany({
    where: {
      isActive: true,
      id: { notIn: watchedIds },
      OR: [
        { categoryId: topCategory ?? undefined },
        { difficulty: userDifficulty },
        { isFeatured: true },
      ],
    },
    include: { category: { select: { name: true, iconName: true } } },
    orderBy: { viewCount: 'desc' },
    take: limit,
  });
};

export const listVideoCategories = async () => {
  return prisma.videoCategory.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: 'asc' },
  });
};
