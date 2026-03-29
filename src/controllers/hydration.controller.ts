import { Request, Response } from 'express';
import { HydrationService } from '../services/hydration.service';
import { sendSuccess, sendError } from '../utils/response';

export class HydrationController {
  static async getGoal(req: any, res: Response) {
    try {
      const result = await HydrationService.getGoal(req.user.id);
      return sendSuccess(res, result);
    } catch (error: any) {
      return sendError(res, error.message, 'HYDRATION_GOAL_ERROR');
    }
  }

  static async updateGoal(req: any, res: Response) {
    try {
      const { dailyGoalMl } = req.body;
      const result = await HydrationService.updateGoal(req.user.id, dailyGoalMl);
      return sendSuccess(res, result, 'Meta de hidratación actualizada');
    } catch (error: any) {
      return sendError(res, error.message, 'HYDRATION_UPDATE_ERROR');
    }
  }

  static async logWater(req: any, res: Response) {
    try {
      const result = await HydrationService.logWater(req.user.id, req.body);
      return sendSuccess(res, result, 'Consumo registrado', 201);
    } catch (error: any) {
      return sendError(res, error.message, 'HYDRATION_LOG_ERROR');
    }
  }

  static async getHistory(req: any, res: Response) {
    try {
      const { days } = req.query;
      const result = await HydrationService.getHistory(req.user.id, Number(days || 7));
      return sendSuccess(res, result);
    } catch (error: any) {
      return sendError(res, error.message, 'HYDRATION_HISTORY_ERROR');
    }
  }

  static async getStats(req: any, res: Response) {
    try {
      const result = await HydrationService.getStats(req.user.id);
      return sendSuccess(res, result);
    } catch (error: any) {
      return sendError(res, error.message, 'HYDRATION_STATS_ERROR');
    }
  }
}
