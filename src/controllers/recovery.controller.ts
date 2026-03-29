import { Request, Response } from 'express';
import * as service from '../services/recovery.service';

interface AuthRequest extends Request {
    user?: { id: string };
}

export const logSleep = async (req: AuthRequest, res: Response) => {
    try {
        const result = await service.logSleep(req.user!.id, req.body);
        res.status(201).json(result);
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
};

export const logRelaxation = async (req: AuthRequest, res: Response) => {
    try {
        const result = await service.logRelaxation(req.user!.id, req.params.id, req.body);
        res.status(201).json(result);
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
};

export const logStress = async (req: AuthRequest, res: Response) => {
    try {
        const result = await service.logStress(req.user!.id, req.body);
        res.status(201).json(result);
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
};

export const getRecoveryScore = async (req: AuthRequest, res: Response) => {
    try {
        const result = await service.fetchRecoveryScore(req.user!.id, req.query.date as string);
        res.json(result);
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
};
