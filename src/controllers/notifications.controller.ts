import { Request, Response } from 'express';
import { NotificationsService } from '../services/notifications.service';
import { sendSuccess, sendError } from '../utils/response';

export class NotificationsController {
  static async getNotifications(req: any, res: Response) {
    try {
      const result = await NotificationsService.getUserNotifications(req.user.id);
      return sendSuccess(res, result);
    } catch (error: any) {
      return sendError(res, error.message, 'NOTIFICATIONS_GET_ERROR');
    }
  }

  static async markAsRead(req: any, res: Response) {
    try {
      const result = await NotificationsService.markAsRead(req.params.id, req.user.id);
      return sendSuccess(res, result, 'Notificación marcada como leída');
    } catch (error: any) {
      return sendError(res, error.message, 'NOTIFICATION_READ_ERROR', 404);
    }
  }

  static async deleteNotification(req: any, res: Response) {
    try {
      await NotificationsService.deleteNotification(req.params.id, req.user.id);
      return sendSuccess(res, null, 'Notificación eliminada');
    } catch (error: any) {
      return sendError(res, error.message, 'NOTIFICATION_DELETE_ERROR', 404);
    }
  }

  static async getPreferences(req: any, res: Response) {
    try {
      const result = await NotificationsService.getPreferences(req.user.id);
      return sendSuccess(res, result);
    } catch (error: any) {
      return sendError(res, error.message, 'NOTIFICATION_PREFS_ERROR');
    }
  }

  static async updatePreferences(req: any, res: Response) {
    try {
      const result = await NotificationsService.updatePreferences(req.user.id, req.body);
      return sendSuccess(res, result, 'Preferencias actualizadas');
    } catch (error: any) {
      return sendError(res, error.message, 'NOTIFICATION_PREFS_UPDATE_ERROR');
    }
  }
}
