import { Request, Response } from 'express';
import * as service from '../services/workoutLog.service';

interface AuthRequest extends Request {
    user?: { id: string };
}

export const createLog = async (req: AuthRequest, res: Response) => {
    try {
        const log = await service.createLog(req.user!.id, req.body);
        res.status(201).json(log);
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
};

export const getLogs = async (req: AuthRequest, res: Response) => {
    try {
        const logs = await service.getLogs(req.user!.id, req.query.date as string);
        res.json(logs);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const getLogById = async (req: AuthRequest, res: Response) => {
    try {
        const log = await service.getLogById(req.user!.id, req.params.id);
        res.json(log);
    } catch (error: any) {
        if (error.message.includes('not found')) return res.status(404).json({ error: error.message });
        res.status(500).json({ error: error.message });
    }
};

export const deleteLog = async (req: AuthRequest, res: Response) => {
    try {
        await service.deleteLog(req.user!.id, req.params.id);
        res.json({ message: 'Deleted successfully' });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};
