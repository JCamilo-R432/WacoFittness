import { Request, Response } from 'express';
import { ShoppingService } from '../services/shopping.service';
import { sendSuccess, sendError } from '../utils/response';

export class ShoppingController {
  static async createList(req: any, res: Response) {
    try {
      const result = await ShoppingService.createList(req.user.id, req.body);
      return sendSuccess(res, result, 'Lista de compras creada', 201);
    } catch (error: any) {
      return sendError(res, error.message, 'SHOPPING_CREATE_ERROR');
    }
  }

  static async getLists(req: any, res: Response) {
    try {
      const result = await ShoppingService.getLists(req.user.id);
      return sendSuccess(res, result);
    } catch (error: any) {
      return sendError(res, error.message, 'SHOPPING_LISTS_ERROR');
    }
  }

  static async getListById(req: any, res: Response) {
    try {
      const result = await ShoppingService.getListById(req.params.id, req.user.id);
      return sendSuccess(res, result);
    } catch (error: any) {
      return sendError(res, error.message, 'SHOPPING_GET_ERROR', 404);
    }
  }

  static async addItem(req: any, res: Response) {
    try {
      const result = await ShoppingService.addItem(req.params.id, req.user.id, req.body);
      return sendSuccess(res, result, 'Item añadido', 201);
    } catch (error: any) {
      return sendError(res, error.message, 'SHOPPING_ADD_ITEM_ERROR');
    }
  }

  static async updateItem(req: any, res: Response) {
    try {
      const result = await ShoppingService.updateItem(req.params.id, req.user.id, req.body);
      return sendSuccess(res, result, 'Item actualizado');
    } catch (error: any) {
      return sendError(res, error.message, 'SHOPPING_UPDATE_ITEM_ERROR');
    }
  }

  static async getStores(req: Request, res: Response) {
    try {
      const result = await ShoppingService.getStores();
      return sendSuccess(res, result);
    } catch (error: any) {
      return sendError(res, error.message, 'STORES_GET_ERROR');
    }
  }
}
