import { Request, Response, NextFunction } from 'express';
import { ZodError, z } from 'zod';

export const validate = (schema: z.ZodObject<any>) =>
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await schema.parseAsync(req.body ?? {});
      return next();
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({
          success: false,
          error: 'Error de validación',
          code: 'VALIDATION_ERROR',
          details: (error.issues ?? error.errors ?? []).map((err: any) => ({
            path: err.path.join('.'),
            message: err.message
          })),
          timestamp: new Date().toISOString()
        });
      }
      return next(error);
    }
  };