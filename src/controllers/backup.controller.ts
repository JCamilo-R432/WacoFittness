import { Request, Response } from 'express';
import * as service from '../services/backup.service';

interface AuthRequest extends Request { user?: { id: string } }

export const createBackup = async (req: AuthRequest, res: Response) => {
  try {
    const data = await service.createBackup(req.user!.id, req.body.type || 'manual');
    res.status(201).json({ success: true, data });
  } catch (e: any) { res.status(400).json({ success: false, error: e.message }); }
};

export const listBackups = async (req: AuthRequest, res: Response) => {
  try {
    const data = await service.listBackups(req.user!.id);
    res.json({ success: true, data });
  } catch (e: any) { res.status(400).json({ success: false, error: e.message }); }
};

export const deleteBackup = async (req: AuthRequest, res: Response) => {
  try {
    await service.deleteBackup(req.user!.id, req.params.id);
    res.json({ success: true, message: 'Backup eliminado' });
  } catch (e: any) { res.status(400).json({ success: false, error: e.message }); }
};
