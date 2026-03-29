import { Request, Response } from 'express';
import * as svc from '../services/coaching.service';

const ok = (res: Response, data: any) => res.json({ success: true, ...data });
const err = (res: Response, e: any) => {
  const map: Record<string, [number, string]> = {
    COACH_NOT_FOUND: [404, 'Coach no encontrado'],
    COACH_NOT_AVAILABLE: [400, 'El coach no está disponible actualmente'],
    TIME_SLOT_TAKEN: [409, 'Ese horario ya está ocupado'],
    SESSION_NOT_FOUND: [404, 'Sesión no encontrada'],
    FORBIDDEN: [403, 'No tienes permiso para esta acción'],
    CANNOT_CANCEL: [400, 'Esta sesión no puede cancelarse'],
    TOO_LATE_TO_CANCEL: [400, 'No puedes cancelar con menos de 24h de anticipación'],
  };
  const [status, message] = map[e.message] ?? [500, 'Error del servidor'];
  return res.status(status).json({ success: false, error: message });
};

export const getCoaches = async (req: Request, res: Response) => {
  try {
    const result = await svc.listCoaches({
      specialty: req.query.specialty as string,
      language: req.query.language as string,
      maxRate: req.query.maxRate ? Number(req.query.maxRate) : undefined,
      search: req.query.search as string,
      page: Number(req.query.page) || 1,
      limit: Number(req.query.limit) || 20,
    });
    ok(res, result);
  } catch (e) { err(res, e); }
};

export const getCoach = async (req: Request, res: Response) => {
  try {
    ok(res, { coach: await svc.getCoachById(req.params.id) });
  } catch (e) { err(res, e); }
};

export const getCoachSchedule = async (req: Request, res: Response) => {
  try {
    const from = new Date(req.query.from as string || Date.now());
    const to = new Date(req.query.to as string || Date.now() + 7 * 86400000);
    ok(res, { schedule: await svc.getCoachSchedule(req.params.id, from, to) });
  } catch (e) { err(res, e); }
};

export const bookSession = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const session = await svc.bookSession(userId, {
      ...req.body,
      scheduledAt: new Date(req.body.scheduledAt),
    });
    res.status(201).json({ success: true, session });
  } catch (e) { err(res, e); }
};

export const cancelSession = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    ok(res, { session: await svc.cancelSession(userId, req.params.id) });
  } catch (e) { err(res, e); }
};

export const mySessions = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    ok(res, { sessions: await svc.getMySessions(userId) });
  } catch (e) { err(res, e); }
};

export const completeSession = async (req: Request, res: Response) => {
  try {
    const coachId = (req as any).user.trainerId; // from auth middleware
    const { coachNotes, recordingUrl } = req.body;
    ok(res, { session: await svc.completeSession(coachId, req.params.id, coachNotes, recordingUrl) });
  } catch (e) { err(res, e); }
};
