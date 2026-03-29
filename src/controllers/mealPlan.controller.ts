import { Request, Response } from 'express';
import * as mealPlanService from '../services/mealPlan.service';

interface AuthRequest extends Request {
    user?: { id: string };
}

export const generatePlan = async (req: AuthRequest, res: Response) => {
    try {
        const { durationDays, preferences, startDate } = req.body;
        if (!durationDays) return res.status(400).json({ error: 'durationDays required' });
        const plan = await mealPlanService.generateMealPlan(req.user!.id, durationDays, preferences || [], startDate);
        res.status(201).json(plan);
    } catch (error: any) {
        if (error.message.includes('Maximum') || error.message.includes('overlap')) {
            return res.status(400).json({ error: error.message });
        }
        if (error.message.includes('required before generating')) {
            return res.status(400).json({ error: error.message });
        }
        res.status(500).json({ error: 'Server error', details: error.message });
    }
};

export const getActivePlans = async (req: AuthRequest, res: Response) => {
    try {
        const plans = await mealPlanService.getActiveMealPlans(req.user!.id);
        res.json(plans);
    } catch (error: any) {
        res.status(500).json({ error: 'Server error', details: error.message });
    }
};

export const getPlanById = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;
        const plan = await mealPlanService.getMealPlanById(req.user!.id, id);
        res.json(plan);
    } catch (error: any) {
        if (error.message.includes('not found')) return res.status(404).json({ error: error.message });
        res.status(500).json({ error: 'Server error', details: error.message });
    }
};

export const activatePlan = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;
        const plan = await mealPlanService.activatePlan(req.user!.id, id);
        res.json(plan);
    } catch (error: any) {
        res.status(500).json({ error: 'Server error', details: error.message });
    }
};

export const deactivatePlan = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;
        const plan = await mealPlanService.deactivatePlan(req.user!.id, id);
        res.json(plan);
    } catch (error: any) {
        res.status(500).json({ error: 'Server error', details: error.message });
    }
};

export const deletePlan = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;
        await mealPlanService.deleteMealPlan(req.user!.id, id);
        res.json({ message: 'Deleted successfully' });
    } catch (error: any) {
        if (error.message.includes('not found')) return res.status(404).json({ error: error.message });
        res.status(500).json({ error: 'Server error', details: error.message });
    }
};

export const swapFood = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;
        const { mealId, newFoodItemId } = req.body;
        await mealPlanService.getMealPlanById(req.user!.id, id); // Verify ownership
        const swapped = await mealPlanService.swapFood(req.user!.id, mealId, newFoodItemId);
        res.json(swapped);
    } catch (error: any) {
        res.status(500).json({ error: 'Server error', details: error.message });
    }
};

export const getShoppingList = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;
        const list = await mealPlanService.generateShoppingList(req.user!.id, id);
        res.json(list);
    } catch (error: any) {
        if (error.message.includes('not found')) return res.status(404).json({ error: error.message });
        res.status(500).json({ error: 'Server error', details: error.message });
    }
};
