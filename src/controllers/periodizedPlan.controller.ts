import { Request, Response } from 'express';
import * as service from '../services/periodizedPlan.service';

interface AuthRequest extends Request { user?: { id: string } }

export const create = async (req: AuthRequest, res: Response) => {
  try {
    const plan = await service.createPeriodizedPlan(req.user!.id, req.body);
    res.status(201).json({ success: true, data: plan });
  } catch (e: any) { res.status(400).json({ success: false, error: e.message }); }
};

export const list = async (req: AuthRequest, res: Response) => {
  try {
    const plans = await service.listPlans(req.user!.id);
    res.json({ success: true, data: plans });
  } catch (e: any) { res.status(400).json({ success: false, error: e.message }); }
};

export const getById = async (req: AuthRequest, res: Response) => {
  try {
    const plan = await service.getPlanById(req.user!.id, req.params.id);
    res.json({ success: true, data: plan });
  } catch (e: any) { res.status(404).json({ success: false, error: e.message }); }
};

export const update = async (req: AuthRequest, res: Response) => {
  try {
    const plan = await service.updatePlan(req.user!.id, req.params.id, req.body);
    res.json({ success: true, data: plan });
  } catch (e: any) { res.status(400).json({ success: false, error: e.message }); }
};

export const remove = async (req: AuthRequest, res: Response) => {
  try {
    await service.deletePlan(req.user!.id, req.params.id);
    res.json({ success: true, message: 'Plan eliminado' });
  } catch (e: any) { res.status(400).json({ success: false, error: e.message }); }
};

export const progress = async (req: AuthRequest, res: Response) => {
  try {
    const data = await service.getPlanProgress(req.user!.id, req.params.id);
    res.json({ success: true, data });
  } catch (e: any) { res.status(400).json({ success: false, error: e.message }); }
};
