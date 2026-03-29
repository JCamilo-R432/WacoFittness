import { Request, Response } from 'express';
import * as service from '../services/recipe.service';

interface AuthRequest extends Request {
    user?: { id: string };
}

export const getRecipes = async (req: AuthRequest, res: Response) => {
    try {
        const { query = '', minCal = '0', maxCal = '0', tags = '', page = '1', limit = '20' } = req.query as any;
        const result = await service.getRecipes(
            query,
            Number(minCal),
            Number(maxCal),
            tags,
            Number(page),
            Number(limit),
            req.user!.id
        );
        res.json(result);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const getRecipeById = async (req: AuthRequest, res: Response) => {
    try {
        const recipe = await service.getRecipeById(req.params.id, req.user!.id);
        res.json(recipe);
    } catch (error: any) {
        if (error.message.includes('not found')) return res.status(404).json({ error: error.message });
        if (error.message.includes('Unauthorized')) return res.status(403).json({ error: error.message });
        res.status(500).json({ error: error.message });
    }
};

export const createRecipe = async (req: AuthRequest, res: Response) => {
    try {
        const recipe = await service.createRecipe(req.user!.id, req.body);
        res.status(201).json(recipe);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const updateRecipe = async (req: AuthRequest, res: Response) => {
    try {
        const recipe = await service.updateRecipe(req.params.id, req.user!.id, req.body);
        res.json(recipe);
    } catch (error: any) {
        if (error.message.includes('not found')) return res.status(404).json({ error: error.message });
        if (error.message.includes('someone else')) return res.status(403).json({ error: error.message });
        res.status(500).json({ error: error.message });
    }
};

export const deleteRecipe = async (req: AuthRequest, res: Response) => {
    try {
        await service.deleteRecipe(req.params.id, req.user!.id);
        res.json({ message: 'Recipe deleted' });
    } catch (error: any) {
        if (error.message.includes('not found')) return res.status(404).json({ error: error.message });
        res.status(500).json({ error: error.message });
    }
};

export const reviewRecipe = async (req: AuthRequest, res: Response) => {
    try {
        const { rating, comentario } = req.body;
        await service.reviewRecipe(req.params.id, req.user!.id, rating, comentario);
        res.status(201).json({ message: 'Review added' });
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
};

export const favoriteRecipe = async (req: AuthRequest, res: Response) => {
    try {
        const result = await service.favoriteRecipe(req.params.id, req.user!.id);
        res.json(result);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const getUserFavorites = async (req: AuthRequest, res: Response) => {
    try {
        const result = await service.getUserFavorites(req.user!.id);
        res.json(result);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const adjustPortions = async (req: AuthRequest, res: Response) => {
    try {
        const { servings } = req.body;
        if (!servings || servings < 1) throw new Error('Invalid servings');
        const adjusted = await service.adjustPortions(req.params.id, req.user!.id, servings);
        res.json(adjusted);
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
};

export const generateRecipesByMacros = async (req: AuthRequest, res: Response) => {
    try {
        const { calories, proteinG, carbsG, fatG } = req.query;
        const result = await service.generateRecipesByMacros(
            Number(calories),
            Number(proteinG),
            Number(carbsG),
            Number(fatG),
            req.user!.id
        );
        res.json(result);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};
