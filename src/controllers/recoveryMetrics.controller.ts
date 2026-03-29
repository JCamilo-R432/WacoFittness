import { Request, Response } from 'express';
import * as service from '../services/recoveryMetrics.service';

interface AuthRequest extends Request { user?: { id: string } }

export const log = async (req: AuthRequest, res: Response) => {
  try {
    const metric = await service.logMetric(req.user!.id, req.body);
    res.status(201).json({ success: true, data: metric });
  } catch (e: any) { res.status(400).json({ success: false, error: e.message }); }
};

export const getMetrics = async (req: AuthRequest, res: Response) => {
  try {
    const days = Number(req.query.days) || 30;
    const data = await service.getMetrics(req.user!.id, days);
    res.json({ success: true, data });
  } catch (e: any) { res.status(400).json({ success: false, error: e.message }); }
};

export const getScore = async (req: AuthRequest, res: Response) => {
  try {
    const data = await service.getScore(req.user!.id);
    res.json({ success: true, data });
  } catch (e: any) { res.status(400).json({ success: false, error: e.message }); }
};

export const getSleep = async (req: AuthRequest, res: Response) => {
  try {
    const days = Number(req.query.days) || 14;
    const data = await service.getSleepData(req.user!.id, days);
    res.json({ success: true, data });
  } catch (e: any) { res.status(400).json({ success: false, error: e.message }); }
};

export const getHRV = async (req: AuthRequest, res: Response) => {
  try {
    const days = Number(req.query.days) || 30;
    const data = await service.getHRVData(req.user!.id, days);
    res.json({ success: true, data });
  } catch (e: any) { res.status(400).json({ success: false, error: e.message }); }
};

export const getRecommendations = async (req: AuthRequest, res: Response) => {
  try {
    const data = await service.getRecommendations(req.user!.id);
    res.json({ success: true, data });
  } catch (e: any) { res.status(400).json({ success: false, error: e.message }); }
};
