import prisma from '../config/database';
import { Request } from 'express';
import { AuthRequest } from '../middleware/auth';

export interface AuditEntry {
  userId?: string;
  action: string;
  resourceType?: string;
  resourceId?: string;
  oldValue?: object;
  newValue?: object;
  ipAddress?: string;
  userAgent?: string;
  metadata?: object;
}

class AuditService {
  async log(entry: AuditEntry): Promise<void> {
    try {
      await prisma.auditLog.create({
        data: {
          userId: entry.userId,
          action: entry.action,
          resourceType: entry.resourceType,
          resourceId: entry.resourceId,
          oldValue: entry.oldValue as any,
          newValue: entry.newValue as any,
          ipAddress: entry.ipAddress,
          userAgent: entry.userAgent,
          metadata: entry.metadata as any,
        },
      });
    } catch (err) {
      // Nunca fallar silenciosamente el request por un error de audit
      console.error('[AuditService] Error guardando audit log:', err);
    }
  }

  /** Extrae IP y User-Agent de la request */
  extractRequestMeta(req: Request): { ipAddress: string; userAgent: string } {
    const ipAddress =
      (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() ||
      req.socket.remoteAddress ||
      'unknown';
    const userAgent = req.get('user-agent') || 'unknown';
    return { ipAddress, userAgent };
  }

  /** Shorthand para loggear desde un controller */
  async logRequest(
    req: AuthRequest,
    action: string,
    resourceType?: string,
    resourceId?: string,
    extra?: { oldValue?: object; newValue?: object; metadata?: object },
  ): Promise<void> {
    const { ipAddress, userAgent } = this.extractRequestMeta(req);
    await this.log({
      userId: req.user?.id,
      action,
      resourceType,
      resourceId,
      ipAddress,
      userAgent,
      ...extra,
    });
  }

  async getLogsForUser(userId: string, limit = 50, offset = 0) {
    return prisma.auditLog.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset,
    });
  }

  async getAllLogs(filters: {
    userId?: string;
    action?: string;
    resourceType?: string;
    from?: Date;
    to?: Date;
    limit?: number;
    offset?: number;
  }) {
    const where: any = {};
    if (filters.userId) where.userId = filters.userId;
    if (filters.action) where.action = { contains: filters.action, mode: 'insensitive' };
    if (filters.resourceType) where.resourceType = filters.resourceType;
    if (filters.from || filters.to) {
      where.createdAt = {};
      if (filters.from) where.createdAt.gte = filters.from;
      if (filters.to) where.createdAt.lte = filters.to;
    }

    const [logs, total] = await Promise.all([
      prisma.auditLog.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: filters.limit ?? 100,
        skip: filters.offset ?? 0,
        include: {
          user: { select: { id: true, email: true, name: true } },
        },
      }),
      prisma.auditLog.count({ where }),
    ]);

    return { logs, total };
  }
}

export const auditService = new AuditService();
export default auditService;
