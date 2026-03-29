import { Request, Response } from 'express';
import * as svc from '../services/virtualClass.service';

const ok = (res: Response, data: any) => res.json({ success: true, ...data });
const err = (res: Response, e: any) => {
  const map: Record<string, [number, string]> = {
    CLASS_NOT_FOUND: [404, 'Clase no encontrada'],
    NOT_ENROLLED: [400, 'No estás inscrito en esta clase'],
    INVALID_RATING: [400, 'La calificación debe ser entre 1 y 5'],
  };
  const [status, message] = map[e.message] ?? [500, 'Error del servidor'];
  return res.status(status).json({ success: false, error: message });
};

export const getCategories = async (_req: Request, res: Response) => {
  try { ok(res, { categories: await svc.listCategories() }); } catch (e) { err(res, e); }
};

export const getUpcomingLive = async (req: Request, res: Response) => {
  try { ok(res, { classes: await svc.getUpcomingLive(Number(req.query.limit) || 10) }); } catch (e) { err(res, e); }
};

export const getClasses = async (req: Request, res: Response) => {
  try {
    const result = await svc.listClasses({
      categoryId: req.query.categoryId as string,
      difficulty: req.query.difficulty as string,
      isLive: req.query.isLive === 'true' ? true : req.query.isLive === 'false' ? false : undefined,
      equipment: req.query.equipment as string,
      maxDuration: req.query.maxDuration ? Number(req.query.maxDuration) : undefined,
      search: req.query.search as string,
      instructorId: req.query.instructorId as string,
      isFeatured: req.query.isFeatured === 'true',
      page: Number(req.query.page) || 1,
      limit: Number(req.query.limit) || 20,
    });
    ok(res, result);
  } catch (e) { err(res, e); }
};

export const getClass = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    ok(res, { class: await svc.getClassById(req.params.id, userId) });
  } catch (e) { err(res, e); }
};

export const enroll = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    ok(res, { enrollment: await svc.enrollInClass(userId, req.params.id) });
  } catch (e) { err(res, e); }
};

export const complete = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    ok(res, { enrollment: await svc.markClassCompleted(userId, req.params.id) });
  } catch (e) { err(res, e); }
};

export const progress = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { watchedSeconds } = req.body;
    ok(res, { enrollment: await svc.updateWatchProgress(userId, req.params.id, watchedSeconds) });
  } catch (e) { err(res, e); }
};

export const myClasses = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    ok(res, { enrollments: await svc.getMyClasses(userId) });
  } catch (e) { err(res, e); }
};

export const rate = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { rating, comment } = req.body;
    ok(res, { review: await svc.rateClass(userId, req.params.id, rating, comment) });
  } catch (e) { err(res, e); }
};
