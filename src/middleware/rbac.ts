import { Response, NextFunction } from 'express';
import { AuthRequest } from './auth';
import { sendError } from '../utils/response';

export enum Role {
  USER      = 'user',
  PRO       = 'pro',
  PREMIUM   = 'premium',
  SUPPORT   = 'support',
  ADMIN     = 'admin',
  SUPERADMIN = 'superadmin',
}

/** Jerarquía de roles — a mayor índice, mayor privilegio */
const ROLE_HIERARCHY: Record<string, number> = {
  user: 0,
  pro: 1,
  premium: 2,
  support: 3,
  admin: 4,
  superadmin: 5,
};

/**
 * Requiere que el usuario tenga UNO de los roles especificados.
 * También acepta roles con mayor jerarquía (ej: admin puede acceder a rutas de pro).
 */
export const requireRole = (...requiredRoles: Role[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return sendError(res, 'No autenticado', 'UNAUTHORIZED', 401);
    }

    const userLevel = ROLE_HIERARCHY[req.user.role] ?? 0;
    const hasAccess = requiredRoles.some(r => {
      const requiredLevel = ROLE_HIERARCHY[r] ?? 0;
      // Superadmin y admin tienen acceso a todo. Para otros, verificar nivel.
      return userLevel >= requiredLevel;
    });

    if (!hasAccess) {
      return sendError(res, 'Acceso denegado. Permisos insuficientes.', 'FORBIDDEN', 403);
    }

    return next();
  };
};

/** Shorthand para rutas de admin */
export const requireAdmin = requireRole(Role.ADMIN);

/** Shorthand para rutas de superadmin */
export const requireSuperAdmin = requireRole(Role.SUPERADMIN);

/** Shorthand para rutas de soporte/admin */
export const requireSupport = requireRole(Role.SUPPORT);

/** Shorthand para features Pro (pro+, premium, admin) */
export const requirePro = requireRole(Role.PRO);

/** Shorthand para features Premium (premium, admin, superadmin) */
export const requirePremium = requireRole(Role.PREMIUM);
