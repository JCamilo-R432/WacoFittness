import { Request, Response } from 'express';
import { TrainingService } from '../services/training.service';
import { sendSuccess, sendError } from '../utils/response';

export class TrainingController {
  static async getExercises(req: Request, res: Response) {
    try {
      const result = await TrainingService.getExercises(req.query);
      return sendSuccess(res, result.items, 'Ejercicios listados', 200, {
        page: Number(req.query.page || 1),
        limit: Number(req.query.limit || 20),
        total: result.total,
        pages: result.pages
      });
    } catch (error: any) {
      return sendError(res, error.message, 'EXERCISE_LIST_ERROR');
    }
  }

  static async getExerciseById(req: Request, res: Response) {
    try {
      const result = await TrainingService.getExerciseById(req.params.id);
      return sendSuccess(res, result);
    } catch (error: any) {
      return sendError(res, error.message, 'EXERCISE_GET_ERROR', 404);
    }
  }

  static async logWorkout(req: any, res: Response) {
    try {
      const result = await TrainingService.logWorkout(req.user.id, req.body);
      return sendSuccess(res, result, 'Workout registrado exitosamente', 201);
    } catch (error: any) {
      return sendError(res, error.message, 'WORKOUT_LOG_ERROR');
    }
  }

  static async getWorkouts(req: any, res: Response) {
    try {
      const result = await TrainingService.getWorkouts(req.user.id);
      return sendSuccess(res, result);
    } catch (error: any) {
      return sendError(res, error.message, 'WORKOUT_HISTORY_ERROR');
    }
  }
}
