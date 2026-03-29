import { Request, Response } from 'express';
import { AuthService } from '../services/auth.service';
import { sendSuccess, sendError } from '../utils/response';

export class AuthController {
  static async register(req: Request, res: Response) {
    try {
      const result = await AuthService.register(req.body);
      return sendSuccess(res, result, 'Usuario registrado exitosamente', 201);
    } catch (error: any) {
      return sendError(res, error.message, 'REGISTER_ERROR', 400);
    }
  }

  static async login(req: Request, res: Response) {
    try {
      const result = await AuthService.login(req.body);
      return sendSuccess(res, result, 'Login exitoso');
    } catch (error: any) {
      return sendError(res, error.message, 'LOGIN_ERROR', 401);
    }
  }

  static async getProfile(req: any, res: Response) {
    try {
      const result = await AuthService.getProfile(req.user.id);
      return sendSuccess(res, result);
    } catch (error: any) {
      return sendError(res, error.message, 'PROFILE_ERROR', 404);
    }
  }

  static async updateProfile(req: any, res: Response) {
    try {
      const result = await AuthService.updateProfile(req.user.id, req.body);
      return sendSuccess(res, result, 'Perfil actualizado');
    } catch (error: any) {
      return sendError(res, error.message, 'UPDATE_PROFILE_ERROR', 400);
    }
  }
}
