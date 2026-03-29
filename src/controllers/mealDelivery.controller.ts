import { Request, Response } from 'express';
import * as service from '../services/mealDelivery.service';

interface AuthRequest extends Request { user?: { id: string } }

export const getRestaurants = async (req: AuthRequest, res: Response) => {
  try {
    const data = await service.getRestaurants(req.query);
    res.json({ success: true, data });
  } catch (e: any) { res.status(400).json({ success: false, error: e.message }); }
};

export const getMeals = async (req: AuthRequest, res: Response) => {
  try {
    const data = await service.getMeals(req.query.restaurantId as string || '');
    res.json({ success: true, data });
  } catch (e: any) { res.status(400).json({ success: false, error: e.message }); }
};

export const createOrder = async (req: AuthRequest, res: Response) => {
  try {
    const data = await service.createOrder(req.user!.id, req.body);
    res.status(201).json({ success: true, data });
  } catch (e: any) { res.status(400).json({ success: false, error: e.message }); }
};

export const getOrders = async (req: AuthRequest, res: Response) => {
  try {
    const data = await service.getOrders(req.user!.id);
    res.json({ success: true, data });
  } catch (e: any) { res.status(400).json({ success: false, error: e.message }); }
};
