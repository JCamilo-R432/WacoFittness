import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { sendError } from '../utils/response';

export interface AuthUser {
  id: string;
  email: string;
  role: string; // user, pro, premium, support, admin, superadmin
}

export interface AuthRequest extends Request {
  user?: AuthUser;
  rawBody?: Buffer; // Para verificación de webhooks Stripe
}

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) { console.error('FATAL: JWT_SECRET env var is not set'); process.exit(1); }

export const authenticate = (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return sendError(res, 'No se proporcionó un token de acceso. Inicie sesión.', 'UNAUTHORIZED', 401);
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as AuthUser;
    req.user = {
      id: decoded.id,
      email: decoded.email || '',
      role: decoded.role || 'user',
    };
    return next();
  } catch (error) {
    return sendError(res, 'Token inválido o expirado. Inicie sesión de nuevo.', 'INVALID_TOKEN', 401);
  }
};

/** Alias para mantener compatibilidad con código existente */
export const authMiddleware = authenticate;
