import { Request, Response } from 'express';
import { NutritionService } from '../services/nutrition.service';
import { sendSuccess, sendError } from '../utils/response';

export class NutritionController {
  static async getFoods(req: any, res: Response) {
    try {
      const result = await NutritionService.getFoods(req.query, req.user.id);
      return sendSuccess(res, result.items, 'Alimentos listados', 200, {
        page: Number(req.query.page || 1),
        limit: Number(req.query.limit || 20),
        total: result.total,
        pages: result.pages
      });
    } catch (error: any) {
      return sendError(res, error.message, 'FOOD_LIST_ERROR');
    }
  }

  static async createFood(req: any, res: Response) {
    try {
      const result = await NutritionService.createFood(req.user.id, req.body);
      return sendSuccess(res, result, 'Alimento creado', 201);
    } catch (error: any) {
      return sendError(res, error.message, 'FOOD_CREATE_ERROR');
    }
  }

  static async logMeal(req: any, res: Response) {
    try {
      const result = await NutritionService.logMeal(req.user.id, req.body);
      return sendSuccess(res, result, 'Comida registrada', 201);
    } catch (error: any) {
      return sendError(res, error.message, 'MEAL_LOG_ERROR');
    }
  }

  static async getMealLogs(req: any, res: Response) {
    try {
      const { date } = req.query;
      if (!date) throw new Error('Fecha requerida');
      const result = await NutritionService.getMealLogs(req.user.id, date as string);
      return sendSuccess(res, result);
    } catch (error: any) {
      return sendError(res, error.message, 'MEAL_LOGS_GET_ERROR');
    }
  }

  static async getRecipes(req: Request, res: Response) {
    try {
      const result = await NutritionService.getRecipes(req.query);
      return sendSuccess(res, result.items, 'Recetas listadas', 200, {
        page: Number(req.query.page || 1),
        limit: Number(req.query.limit || 10),
        total: result.total,
        pages: result.pages
      });
    } catch (error: any) {
      return sendError(res, error.message, 'RECIPE_LIST_ERROR');
    }
  }

  static async getRecipeById(req: Request, res: Response) {
    try {
      const result = await NutritionService.getRecipeById(req.params.id);
      return sendSuccess(res, result);
    } catch (error: any) {
      return sendError(res, error.message, 'RECIPE_GET_ERROR', 404);
    }
  }
}
