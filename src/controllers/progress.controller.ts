import { Request, Response } from 'express';
import * as svc from '../services/progress.service';

const ok = (res: Response, data: any) => res.json({ success: true, ...data });
const err = (res: Response, e: any) => {
  const msg = e.message === 'NOT_FOUND' ? 'No encontrado' : 'Error del servidor';
  const status = e.message === 'NOT_FOUND' ? 404 : 500;
  return res.status(status).json({ success: false, error: msg });
};

export const getStats = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    ok(res, { stats: await svc.getProgressStats(userId) });
  } catch (e) { err(res, e); }
};

export const getStreak = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    ok(res, await svc.getWorkoutStreak(userId));
  } catch (e) { err(res, e); }
};

export const getPhotos = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const photos = await svc.getMyProgressPhotos(userId, req.query.angle as string);
    ok(res, { photos });
  } catch (e) { err(res, e); }
};

export const addPhoto = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const photo = await svc.addProgressPhoto(userId, {
      ...req.body,
      takenAt: req.body.takenAt ? new Date(req.body.takenAt) : undefined,
    });
    res.status(201).json({ success: true, photo });
  } catch (e) { err(res, e); }
};

export const deletePhoto = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    await svc.deleteProgressPhoto(userId, req.params.id);
    ok(res, { message: 'Foto eliminada' });
  } catch (e) { err(res, e); }
};

export const getMeasurements = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    ok(res, { measurements: await svc.getMyMeasurements(userId, Number(req.query.limit) || 30) });
  } catch (e) { err(res, e); }
};

export const logMeasurement = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const measurement = await svc.logBodyMeasurement(userId, {
      ...req.body,
      date: req.body.date ? new Date(req.body.date) : undefined,
    });
    res.status(201).json({ success: true, measurement });
  } catch (e) { err(res, e); }
};
