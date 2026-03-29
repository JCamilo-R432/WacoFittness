import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { sendSuccess, sendError } from '../utils/response';
import twoFAService from '../services/twofa.service';
import auditService from '../services/audit.service';
import { dispatchEmail } from '../services/queue.service';
import prisma from '../config/database';

// ── 2FA Setup ─────────────────────────────────────────────────────────────

export const get2FAStatus = async (req: AuthRequest, res: Response) => {
  const user = await prisma.user.findUnique({
    where: { id: req.user!.id },
    select: { twoFAEnabled: true },
  });
  return sendSuccess(res, { enabled: user?.twoFAEnabled ?? false }, '2FA status');
};

export const setup2FA = async (req: AuthRequest, res: Response) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
      select: { email: true, twoFAEnabled: true },
    });
    if (!user) return sendError(res, 'Usuario no encontrado', 'NOT_FOUND', 404);
    if (user.twoFAEnabled) return sendError(res, '2FA ya está habilitado', 'ALREADY_ENABLED', 400);

    const { secret, qrCodeUrl, otpauthUrl } = await twoFAService.generateSetupData(
      req.user!.id,
      user.email,
    );

    // Devolver QR code para escanear, no el secret en texto plano
    return sendSuccess(res, { qrCodeUrl, otpauthUrl }, 'Escanea el QR con tu app autenticadora');
  } catch (err: any) {
    return sendError(res, err.message, '2FA_SETUP_ERROR', 500);
  }
};

export const verify2FA = async (req: AuthRequest, res: Response) => {
  try {
    const { code } = req.body;
    if (!code) return sendError(res, 'Código requerido', 'MISSING_CODE', 400);

    const { backupCodes } = await twoFAService.verifyAndEnable(req.user!.id, code);

    // Enviar backup codes por email
    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
      select: { email: true, name: true },
    });
    if (user) {
      await dispatchEmail('2fa-backup-codes', { to: user.email, name: user.name, codes: backupCodes });
      await dispatchEmail('2fa-enabled', { to: user.email, name: user.name });
    }

    await auditService.logRequest(req, 'security.2fa.enabled', 'User', req.user!.id);

    return sendSuccess(
      res,
      { backupCodes, message: 'Guarda estos códigos en lugar seguro. Solo se muestran una vez.' },
      '2FA activado exitosamente',
    );
  } catch (err: any) {
    return sendError(res, err.message, '2FA_VERIFY_ERROR', 400);
  }
};

export const disable2FA = async (req: AuthRequest, res: Response) => {
  try {
    const { code } = req.body;
    if (!code) return sendError(res, 'Código TOTP requerido para desactivar 2FA', 'MISSING_CODE', 400);

    await twoFAService.disable(req.user!.id, code);

    await auditService.logRequest(req, 'security.2fa.disabled', 'User', req.user!.id);

    return sendSuccess(res, null, '2FA desactivado');
  } catch (err: any) {
    return sendError(res, err.message, '2FA_DISABLE_ERROR', 400);
  }
};

export const regenerateBackupCodes = async (req: AuthRequest, res: Response) => {
  try {
    const { code } = req.body;
    if (!code) return sendError(res, 'Código TOTP requerido', 'MISSING_CODE', 400);

    const { backupCodes } = await twoFAService.regenerateBackupCodes(req.user!.id, code);

    await auditService.logRequest(req, 'security.2fa.backup_codes.regenerated', 'User', req.user!.id);

    return sendSuccess(res, { backupCodes }, 'Nuevos códigos generados. Los anteriores ya no son válidos.');
  } catch (err: any) {
    return sendError(res, err.message, '2FA_BACKUP_ERROR', 400);
  }
};

// ── Audit Log ─────────────────────────────────────────────────────────────

export const getMyAuditLog = async (req: AuthRequest, res: Response) => {
  try {
    const limit = Math.min(parseInt(req.query.limit as string) || 20, 100);
    const offset = parseInt(req.query.offset as string) || 0;

    const logs = await auditService.getLogsForUser(req.user!.id, limit, offset);
    return sendSuccess(res, logs, 'Audit log obtenido');
  } catch (err: any) {
    return sendError(res, err.message, 'AUDIT_ERROR', 500);
  }
};

// ── Support Tickets ───────────────────────────────────────────────────────

export const createSupportTicket = async (req: AuthRequest, res: Response) => {
  try {
    const { subject, body, category, priority } = req.body;
    if (!subject || !body) return sendError(res, 'Subject y body requeridos', 'MISSING_FIELDS', 400);

    const ticket = await prisma.supportTicket.create({
      data: {
        userId: req.user!.id,
        subject,
        body,
        category: category || 'general',
        priority: priority || 'medium',
      },
    });

    return sendSuccess(res, ticket, 'Ticket creado', 201);
  } catch (err: any) {
    return sendError(res, err.message, 'TICKET_ERROR', 500);
  }
};

export const getMySupportTickets = async (req: AuthRequest, res: Response) => {
  try {
    const tickets = await prisma.supportTicket.findMany({
      where: { userId: req.user!.id },
      orderBy: { createdAt: 'desc' },
      include: { replies: { orderBy: { createdAt: 'asc' } } },
    });
    return sendSuccess(res, tickets, 'Tickets obtenidos');
  } catch (err: any) {
    return sendError(res, err.message, 'TICKETS_ERROR', 500);
  }
};
