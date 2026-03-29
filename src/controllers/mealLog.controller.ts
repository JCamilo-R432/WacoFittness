import { Request, Response } from 'express';
import * as mealLogService from '../services/mealLog.service';

interface AuthRequest extends Request {
    user?: { id: string };
}

export const createLog = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user!.id;
        const log = await mealLogService.createMealLog(userId, req.body);
        res.status(201).json(log);
    } catch (error: any) {
        if (error.message.includes('30 days')) return res.status(400).json({ error: error.message });
        res.status(500).json({ error: 'Server error', details: error.message });
    }
};

export const getLogs = async (req: AuthRequest, res: Response) => {
    try {
        const { date, type } = req.query as { date: string, type?: string };
        if (!date) return res.status(400).json({ error: 'Date is required (YYYY-MM-DD)' });
        const logs = await mealLogService.getLogs(req.user!.id, date, type);
        res.json(logs);
    } catch (error: any) {
        res.status(500).json({ error: 'Server error', details: error.message });
    }
};

export const getDailySummary = async (req: AuthRequest, res: Response) => {
    try {
        const { date } = req.query as { date: string };
        if (!date) return res.status(400).json({ error: 'Date is required (YYYY-MM-DD)' });
        const summary = await mealLogService.getDailySummary(req.user!.id, date);
        res.json(summary);
    } catch (error: any) {
        res.status(500).json({ error: 'Server error', details: error.message });
    }
};

export const getWeeklySummary = async (req: AuthRequest, res: Response) => {
    try {
        const { startDate, endDate } = req.query as { startDate: string, endDate: string };
        if (!startDate || !endDate) return res.status(400).json({ error: 'startDate and endDate required' });
        const summary = await mealLogService.getWeeklySummary(req.user!.id, startDate, endDate);
        res.json(summary);
    } catch (error: any) {
        res.status(500).json({ error: 'Server error', details: error.message });
    }
};

export const getFrequentFoods = async (req: AuthRequest, res: Response) => {
    try {
        const foods = await mealLogService.getFrequentFoods(req.user!.id);
        res.json(foods);
    } catch (error: any) {
        res.status(500).json({ error: 'Server error', details: error.message });
    }
};

export const duplicateLog = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;
        const log = await mealLogService.duplicateMealLog(req.user!.id, id);
        res.status(201).json(log);
    } catch (error: any) {
        if (error.message.includes('not found')) return res.status(404).json({ error: error.message });
        res.status(500).json({ error: 'Server error', details: error.message });
    }
};

export const deleteLog = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;
        await mealLogService.deleteMealLog(req.user!.id, id);
        res.json({ message: 'Deleted successfully' });
    } catch (error: any) {
        res.status(500).json({ error: 'Server error', details: error.message });
    }
};
