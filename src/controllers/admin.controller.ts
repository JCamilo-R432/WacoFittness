import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { sendSuccess, sendError } from '../utils/response';
import auditService from '../services/audit.service';
import stripeService from '../services/stripe.service';
import prisma from '../config/database';

// ── Dashboard Stats ───────────────────────────────────────────────────────

export const getStats = async (_req: AuthRequest, res: Response) => {
  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

    const [
      totalUsers,
      activeUsers,
      newUsersThisMonth,
      newUsersLastMonth,
      totalWorkouts,
      totalMealLogs,
      activeSubscriptions,
      revenueMetrics,
      openTickets,
    ] = await Promise.all([
      prisma.user.count({ where: { isActive: true } }),
      prisma.user.count({ where: { isActive: true, lastLoginAt: { gte: new Date(Date.now() - 7 * 86400000) } } }),
      prisma.user.count({ where: { createdAt: { gte: startOfMonth } } }),
      prisma.user.count({ where: { createdAt: { gte: startOfLastMonth, lt: startOfMonth } } }),
      prisma.workoutLog.count(),
      prisma.mealLog.count(),
      prisma.userSubscription.count({ where: { status: 'active' } }),
      stripeService.getRevenueMetrics(),
      prisma.supportTicket.count({ where: { status: { in: ['open', 'in_progress'] } } }),
    ]);

    const userGrowth = newUsersLastMonth > 0
      ? (((newUsersThisMonth - newUsersLastMonth) / newUsersLastMonth) * 100).toFixed(1)
      : '0';

    return sendSuccess(res, {
      users: { total: totalUsers, active: activeUsers, newThisMonth: newUsersThisMonth, growth: userGrowth + '%' },
      activity: { workouts: totalWorkouts, mealLogs: totalMealLogs },
      revenue: revenueMetrics,
      subscriptions: { active: activeSubscriptions },
      support: { openTickets },
    }, 'Stats del dashboard');
  } catch (err: any) {
    return sendError(res, err.message, 'STATS_ERROR', 500);
  }
};

// ── User Management ───────────────────────────────────────────────────────

export const listUsers = async (req: AuthRequest, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = Math.min(parseInt(req.query.limit as string) || 20, 100);
    const search = req.query.search as string | undefined;
    const role = req.query.role as string | undefined;
    const status = req.query.status as string | undefined;

    const where: any = {};
    if (search) where.OR = [
      { email: { contains: search, mode: 'insensitive' } },
      { name: { contains: search, mode: 'insensitive' } },
    ];
    if (role) where.role = role;
    if (status === 'banned') where.isBanned = true;
    if (status === 'active') where.isActive = true;

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        select: {
          id: true, email: true, name: true, role: true,
          isActive: true, isBanned: true, isVerified: true,
          createdAt: true, lastLoginAt: true,
          subscription: { select: { planId: true, status: true } },
          _count: { select: { workoutLogs: true, mealLogs: true } },
        },
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: (page - 1) * limit,
      }),
      prisma.user.count({ where }),
    ]);

    return sendSuccess(res, { users, total, page, limit }, 'Usuarios obtenidos');
  } catch (err: any) {
    return sendError(res, err.message, 'USERS_ERROR', 500);
  }
};

export const getUserDetail = async (req: AuthRequest, res: Response) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.params.id },
      select: {
        id: true, email: true, name: true, phone: true, role: true,
        isActive: true, isBanned: true, isVerified: true, bannedReason: true,
        createdAt: true, lastLoginAt: true,
        subscription: true,
        payments: { orderBy: { createdAt: 'desc' }, take: 5 },
        supportTickets: { orderBy: { createdAt: 'desc' }, take: 5 },
        _count: { select: { workoutLogs: true, mealLogs: true, socialPosts: true } },
      },
    });

    if (!user) return sendError(res, 'Usuario no encontrado', 'NOT_FOUND', 404);
    return sendSuccess(res, user, 'Usuario obtenido');
  } catch (err: any) {
    return sendError(res, err.message, 'USER_ERROR', 500);
  }
};

export const updateUser = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { role, isActive, isVerified } = req.body;

    const oldUser = await prisma.user.findUnique({ where: { id }, select: { role: true, isActive: true } });
    if (!oldUser) return sendError(res, 'Usuario no encontrado', 'NOT_FOUND', 404);

    // Superadmin no puede ser degradado por admin
    if (oldUser.role === 'superadmin' && req.user!.role !== 'superadmin') {
      return sendError(res, 'No puedes modificar a un superadmin', 'FORBIDDEN', 403);
    }

    const updated = await prisma.user.update({
      where: { id },
      data: {
        ...(role !== undefined && { role }),
        ...(isActive !== undefined && { isActive }),
        ...(isVerified !== undefined && { isVerified }),
      },
      select: { id: true, email: true, role: true, isActive: true },
    });

    await auditService.logRequest(req, 'admin.user.updated', 'User', id, {
      oldValue: oldUser as object,
      newValue: { role, isActive, isVerified } as object,
    });

    return sendSuccess(res, updated, 'Usuario actualizado');
  } catch (err: any) {
    return sendError(res, err.message, 'UPDATE_ERROR', 500);
  }
};

export const banUser = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    if (id === req.user!.id) return sendError(res, 'No puedes banear tu propia cuenta', 'SELF_BAN', 400);

    const user = await prisma.user.findUnique({ where: { id }, select: { role: true } });
    if (!user) return sendError(res, 'Usuario no encontrado', 'NOT_FOUND', 404);
    if (user.role === 'superadmin') return sendError(res, 'No puedes banear a un superadmin', 'FORBIDDEN', 403);

    await prisma.user.update({
      where: { id },
      data: { isBanned: true, isActive: false, bannedAt: new Date(), bannedReason: reason || 'Violación de términos' },
    });

    await auditService.logRequest(req, 'admin.user.banned', 'User', id, {
      metadata: { reason } as object,
    });

    return sendSuccess(res, null, 'Usuario baneado');
  } catch (err: any) {
    return sendError(res, err.message, 'BAN_ERROR', 500);
  }
};

export const unbanUser = async (req: AuthRequest, res: Response) => {
  try {
    await prisma.user.update({
      where: { id: req.params.id },
      data: { isBanned: false, isActive: true, bannedAt: null, bannedReason: null },
    });
    await auditService.logRequest(req, 'admin.user.unbanned', 'User', req.params.id);
    return sendSuccess(res, null, 'Usuario desbaneado');
  } catch (err: any) {
    return sendError(res, err.message, 'UNBAN_ERROR', 500);
  }
};

// ── Support Tickets (Admin) ───────────────────────────────────────────────

export const listTickets = async (req: AuthRequest, res: Response) => {
  try {
    const status = req.query.status as string | undefined;
    const priority = req.query.priority as string | undefined;

    const where: any = {};
    if (status) where.status = status;
    if (priority) where.priority = priority;

    const tickets = await prisma.supportTicket.findMany({
      where,
      orderBy: [{ priority: 'desc' }, { createdAt: 'desc' }],
      include: {
        user: { select: { id: true, email: true, name: true } },
        replies: { orderBy: { createdAt: 'asc' } },
      },
      take: 100,
    });

    return sendSuccess(res, tickets, 'Tickets obtenidos');
  } catch (err: any) {
    return sendError(res, err.message, 'TICKETS_ERROR', 500);
  }
};

export const replyToTicket = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { body } = req.body;
    if (!body) return sendError(res, 'body requerido', 'MISSING_BODY', 400);

    const [reply] = await prisma.$transaction([
      prisma.supportTicketReply.create({
        data: { ticketId: id, userId: req.user!.id, body, isStaff: true },
      }),
      prisma.supportTicket.update({
        where: { id },
        data: { status: 'in_progress', updatedAt: new Date() },
      }),
    ]);

    return sendSuccess(res, reply, 'Respuesta enviada', 201);
  } catch (err: any) {
    return sendError(res, err.message, 'REPLY_ERROR', 500);
  }
};

export const closeTicket = async (req: AuthRequest, res: Response) => {
  try {
    await prisma.supportTicket.update({
      where: { id: req.params.id },
      data: { status: 'resolved', resolvedAt: new Date() },
    });
    await auditService.logRequest(req, 'admin.ticket.closed', 'SupportTicket', req.params.id);
    return sendSuccess(res, null, 'Ticket cerrado');
  } catch (err: any) {
    return sendError(res, err.message, 'CLOSE_ERROR', 500);
  }
};

// ── Audit Logs (Admin) ────────────────────────────────────────────────────

export const getAuditLogs = async (req: AuthRequest, res: Response) => {
  try {
    const { userId, action, resourceType, from, to, limit, offset } = req.query;

    const { logs, total } = await auditService.getAllLogs({
      userId: userId as string,
      action: action as string,
      resourceType: resourceType as string,
      from: from ? new Date(from as string) : undefined,
      to: to ? new Date(to as string) : undefined,
      limit: limit ? parseInt(limit as string) : 100,
      offset: offset ? parseInt(offset as string) : 0,
    });

    return sendSuccess(res, { logs, total }, 'Audit logs obtenidos');
  } catch (err: any) {
    return sendError(res, err.message, 'AUDIT_ERROR', 500);
  }
};

// ── Revenue ───────────────────────────────────────────────────────────────

export const getRevenue = async (_req: AuthRequest, res: Response) => {
  try {
    const metrics = await stripeService.getRevenueMetrics();
    return sendSuccess(res, metrics, 'Revenue metrics');
  } catch (err: any) {
    return sendError(res, err.message, 'REVENUE_ERROR', 500);
  }
};
