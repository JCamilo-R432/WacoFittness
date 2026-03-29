import { Request, Response } from 'express';
import { SupplementService } from '../services/supplement.service';
import { sendSuccess, sendError } from '../utils/response';

export class SupplementController {
  static async getSupplements(req: Request, res: Response) {
    try {
      const result = await SupplementService.getSupplements(req.query);
      return sendSuccess(res, result.items, 'Suplementos listados', 200, {
        page: Number(req.query.page || 1),
        limit: Number(req.query.limit || 20),
        total: result.total,
        pages: result.pages
      });
    } catch (error: any) {
      return sendError(res, error.message, 'SUPPLEMENT_LIST_ERROR');
    }
  }

  static async getSupplementById(req: Request, res: Response) {
    try {
      const result = await SupplementService.getSupplementById(req.params.id);
      return sendSuccess(res, result);
    } catch (error: any) {
      return sendError(res, error.message, 'SUPPLEMENT_GET_ERROR', 404);
    }
  }

  static async addUserSupplement(req: any, res: Response) {
    try {
      const result = await SupplementService.addUserSupplement(req.user.id, req.body);
      return sendSuccess(res, result, 'Suplemento añadido a tu lista', 201);
    } catch (error: any) {
      return sendError(res, error.message, 'USER_SUPPLEMENT_ADD_ERROR');
    }
  }

  static async getUserSupplements(req: any, res: Response) {
    try {
      const result = await SupplementService.getUserSupplements(req.user.id);
      return sendSuccess(res, result);
    } catch (error: any) {
      return sendError(res, error.message, 'USER_SUPPLEMENT_LIST_ERROR');
    }
  }

  static async logSupplement(req: any, res: Response) {
    try {
      const result = await SupplementService.logSupplement(req.user.id, req.body);
      return sendSuccess(res, result, 'Toma registrada', 201);
    } catch (error: any) {
      return sendError(res, error.message, 'SUPPLEMENT_LOG_ERROR');
    }
  }

  static async getStacks(req: Request, res: Response) {
    try {
      const result = await SupplementService.getStacks();
      return sendSuccess(res, result);
    } catch (error: any) {
      return sendError(res, error.message, 'STACKS_GET_ERROR');
    }
  }
}
