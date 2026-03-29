import { Request, Response, NextFunction } from 'express';
import { sendError } from '../utils/response';

export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  console.error('❌ Global Error Handler:', err.stack);

  const status = err.status || 500;
  const message = err.message || 'Error interno del servidor';
  const code = err.code || 'INTERNAL_SERVER_ERROR';

  return sendError(res, message, code, status);
};
