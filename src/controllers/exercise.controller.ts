import { Request, Response } from 'express';
import * as service from '../services/exercise.service';

interface AuthRequest extends Request {
    user?: { id: string };
}

export const getExercises = async (req: AuthRequest, res: Response) => {
    try {
        const { search = '', category = '', equipment = '', page = 1, limit = 20 } = req.query as any;
        const result = await service.getExercises(search, category, equipment, Number(page), Number(limit), req.user!.id);
        res.json(result);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const getExerciseById = async (req: AuthRequest, res: Response) => {
    try {
        const result = await service.getExerciseById(req.params.id, req.user!.id);
        res.json(result);
    } catch (error: any) {
        if (error.message.includes('not found')) return res.status(404).json({ error: error.message });
        if (error.message.includes('Unauthorized')) return res.status(403).json({ error: error.message });
        res.status(500).json({ error: error.message });
    }
};

export const createCustomExercise = async (req: AuthRequest, res: Response) => {
    try {
        const result = await service.createCustomExercise(req.user!.id, req.body);
        res.status(201).json(result);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};
