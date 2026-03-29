import { Request, Response } from 'express';
import * as foodItemService from '../services/foodItem.service';

interface AuthRequest extends Request {
    user?: { id: string };
}

export const getFoods = async (req: AuthRequest, res: Response) => {
    try {
        const { search = '', category = '', page = 1, limit = 20 } = req.query as any;
        const result = await foodItemService.getFoods(search, category, Number(page), Number(limit), req.user!.id);
        res.json(result);
    } catch (error: any) {
        res.status(500).json({ error: 'Server error', details: error.message });
    }
};

export const getFoodById = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;
        const result = await foodItemService.getFoodById(id, req.user!.id);
        res.json(result);
    } catch (error: any) {
        if (error.message.includes('not found')) return res.status(404).json({ error: error.message });
        if (error.message.includes('Unauthorized')) return res.status(403).json({ error: error.message });
        res.status(500).json({ error: 'Server error', details: error.message });
    }
};

export const getFoodByBarcode = async (req: AuthRequest, res: Response) => {
    try {
        const { code } = req.params;
        const result = await foodItemService.getFoodByBarcode(code, req.user!.id);
        res.json(result);
    } catch (error: any) {
        if (error.message.includes('not found')) return res.status(404).json({ error: error.message });
        if (error.message.includes('Unauthorized')) return res.status(403).json({ error: error.message });
        res.status(500).json({ error: 'Server error', details: error.message });
    }
};

export const getMyCustomFoods = async (req: AuthRequest, res: Response) => {
    try {
        const result = await foodItemService.getMyCustomFoods(req.user!.id);
        res.json(result);
    } catch (error: any) {
        res.status(500).json({ error: 'Server error', details: error.message });
    }
};

export const createCustomFood = async (req: AuthRequest, res: Response) => {
    try {
        const result = await foodItemService.createCustomFood(req.user!.id, req.body);
        res.status(201).json(result);
    } catch (error: any) {
        res.status(500).json({ error: 'Server error', details: error.message });
    }
};

export const getSuggestions = async (req: AuthRequest, res: Response) => {
    try {
        const result = await foodItemService.getSuggestions(req.user!.id);
        res.json(result);
    } catch (error: any) {
        res.status(500).json({ error: 'Server error', details: error.message });
    }
};
