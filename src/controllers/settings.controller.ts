import { Request, Response } from 'express';
import * as service from '../services/settings.service';

interface AuthRequest extends Request { user?: { id: string } }

export const getSettings = async (req: AuthRequest, res: Response) => {
  try {
    const data = await service.getSettings(req.user!.id);
    res.json({ success: true, data });
  } catch (e: any) { res.status(400).json({ success: false, error: e.message }); }
};

export const updateSettings = async (req: AuthRequest, res: Response) => {
  try {
    const data = await service.updateSettings(req.user!.id, req.body);
    res.json({ success: true, data });
  } catch (e: any) { res.status(400).json({ success: false, error: e.message }); }
};

export const updateTheme = async (req: AuthRequest, res: Response) => {
  try {
    const data = await service.updateTheme(req.user!.id, req.body.theme);
    res.json({ success: true, data });
  } catch (e: any) { res.status(400).json({ success: false, error: e.message }); }
};

export const updateLanguage = async (req: AuthRequest, res: Response) => {
  try {
    const data = await service.updateLanguage(req.user!.id, req.body.language);
    res.json({ success: true, data });
  } catch (e: any) { res.status(400).json({ success: false, error: e.message }); }
};

export const importData = async (req: AuthRequest, res: Response) => {
  try {
    const data = await service.importData(req.user!.id, req.body.source, req.body);
    res.status(201).json({ success: true, data });
  } catch (e: any) { res.status(400).json({ success: false, error: e.message }); }
};

export const getImportHistory = async (req: AuthRequest, res: Response) => {
  try {
    const data = await service.getImportHistory(req.user!.id);
    res.json({ success: true, data });
  } catch (e: any) { res.status(400).json({ success: false, error: e.message }); }
};

export const getSupportedFormats = async (_req: Request, res: Response) => {
  try {
    const data = await service.getSupportedFormats();
    res.json({ success: true, data });
  } catch (e: any) { res.status(400).json({ success: false, error: e.message }); }
};
