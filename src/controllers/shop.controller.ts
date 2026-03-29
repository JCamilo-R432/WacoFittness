import { Request, Response } from 'express';
import * as service from '../services/shop.service';

interface AuthRequest extends Request { user?: { id: string } }

export const getProducts = async (req: AuthRequest, res: Response) => {
  try {
    const data = await service.getProducts(req.query);
    res.json({ success: true, data });
  } catch (e: any) { res.status(400).json({ success: false, error: e.message }); }
};

export const getRecommendations = async (req: AuthRequest, res: Response) => {
  try {
    const goal = (req.query.goal as string) || 'muscle_gain';
    const data = await service.getRecommendations(goal);
    res.json({ success: true, data });
  } catch (e: any) { res.status(400).json({ success: false, error: e.message }); }
};
