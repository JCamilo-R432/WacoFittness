import { Request, Response } from 'express';
import * as svc from '../services/video.service';

const ok = (res: Response, data: any) => res.json({ success: true, ...data });
const err = (res: Response, e: any) => {
  const msg = e.message === 'VIDEO_NOT_FOUND' ? 'Video no encontrado' : 'Error del servidor';
  const status = e.message === 'VIDEO_NOT_FOUND' ? 404 : 500;
  return res.status(status).json({ success: false, error: msg });
};

export const getCategories = async (_req: Request, res: Response) => {
  try { ok(res, { categories: await svc.listVideoCategories() }); } catch (e) { err(res, e); }
};

export const getVideos = async (req: Request, res: Response) => {
  try {
    const result = await svc.listVideos({
      categoryId: req.query.categoryId as string,
      difficulty: req.query.difficulty as string,
      equipment: req.query.equipment as string,
      muscleGroup: req.query.muscleGroup as string,
      maxDuration: req.query.maxDuration ? Number(req.query.maxDuration) : undefined,
      search: req.query.search as string,
      isFeatured: req.query.isFeatured === 'true',
      page: Number(req.query.page) || 1,
      limit: Number(req.query.limit) || 20,
    });
    ok(res, result);
  } catch (e) { err(res, e); }
};

export const getVideo = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    ok(res, { video: await svc.getVideoById(req.params.id, userId) });
  } catch (e) { err(res, e); }
};

export const logWatch = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { watchedSeconds } = req.body;
    ok(res, { record: await svc.logWatchTime(userId, req.params.id, watchedSeconds) });
  } catch (e) { err(res, e); }
};

export const toggleLike = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    ok(res, await svc.toggleVideoLike(userId, req.params.id));
  } catch (e) { err(res, e); }
};

export const getHistory = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    ok(res, { history: await svc.getWatchHistory(userId, Number(req.query.limit) || 20) });
  } catch (e) { err(res, e); }
};

export const getRecommended = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    ok(res, { videos: await svc.getRecommendedVideos(userId, Number(req.query.limit) || 10) });
  } catch (e) { err(res, e); }
};
