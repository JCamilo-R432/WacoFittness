import prisma from '../config/database';

export class SupplementService {
  static async getSupplements(params: any) {
    const { category, query, page = 1, limit = 20 } = params;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (category) where.category = category;
    if (query) {
      where.name = { contains: query, mode: 'insensitive' };
    }

    const [items, total] = await Promise.all([
      prisma.supplement.findMany({
        where,
        skip,
        take: limit,
        orderBy: { name: 'asc' }
      }),
      prisma.supplement.count({ where })
    ]);

    return { items, total, pages: Math.ceil(total / limit) };
  }

  static async getSupplementById(id: string) {
    const supplement = await prisma.supplement.findUnique({
      where: { id },
      include: {
        supplementReviews: { take: 5, orderBy: { createdAt: 'desc' }, include: { user: { select: { name: true, avatarUrl: true } } } }
      }
    });
    if (!supplement) throw new Error('Suplemento no encontrado');
    return supplement;
  }

  static async addUserSupplement(userId: string, data: any) {
    return await prisma.userSupplement.create({
      data: {
        ...data,
        userId
      }
    });
  }

  static async getUserSupplements(userId: string) {
    return await prisma.userSupplement.findMany({
      where: { userId, isActive: true },
      include: { supplement: true }
    });
  }

  static async logSupplement(userId: string, data: any) {
    return await prisma.supplementLog.create({
      data: {
        ...data,
        userId
      }
    });
  }

  static async getStacks() {
    return await prisma.supplementStack.findMany({
      where: { isPredefined: true },
      include: { supplements: { include: { supplement: true } } }
    });
  }
}
