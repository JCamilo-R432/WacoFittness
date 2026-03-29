import { Request, Response } from 'express';
import { RestService } from '../services/rest.service';
import { sendSuccess, sendError } from '../utils/response';

export class RestController {
  static async logSleep(req: any, res: Response) {
    try {
      const result = await RestService.logSleep(req.user.id, req.body);
      return sendSuccess(res, result, 'Sueño registrado', 201);
    } catch (error: any) {
      return sendError(res, error.message, 'SLEEP_LOG_ERROR');
    }
  }

  static async getSleepLogs(req: any, res: Response) {
    try {
      const result = await RestService.getSleepLogs(req.user.id);
      return sendSuccess(res, result);
    } catch (error: any) {
      return sendError(res, error.message, 'SLEEP_LOGS_GET_ERROR');
    }
  }

  static async getRecoveryScore(req: any, res: Response) {
    try {
      const result = await RestService.getRecoveryScore(req.user.id);
      return sendSuccess(res, result);
    } catch (error: any) {
      return sendError(res, error.message, 'RECOVERY_SCORE_ERROR');
    }
  }

  static async getRelaxationTechniques(req: Request, res: Response) {
    try {
      const result = await RestService.getRelaxationTechniques();
      return sendSuccess(res, result);
    } catch (error: any) {
      return sendError(res, error.message, 'RELAXATION_TECHNIQUES_ERROR');
    }
  }

  static async logRelaxation(req: any, res: Response) {
    try {
      const result = await RestService.logRelaxation(req.user.id, req.body);
      return sendSuccess(res, result, 'Sesión de relajación registrada', 201);
    } catch (error: any) {
      return sendError(res, error.message, 'RELAXATION_LOG_ERROR');
    }
  }
}
