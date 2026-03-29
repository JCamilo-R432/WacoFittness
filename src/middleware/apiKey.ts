import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';
import prisma from '../config/database';

export interface APIKeyRequest extends Request {
  apiKey?: {
    id: string;
    organizationId: string;
    scopes: string[];
    name: string;
  };
}

/**
 * Authenticates requests using Bearer API key (wk_live_XXXX or wk_test_XXXX).
 * Used for API marketplace / developer integrations.
 */
export const apiKeyAuth = async (req: APIKeyRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer wk_')) {
      res.status(401).json({ error: 'API key requerida (Bearer wk_live_... o wk_test_...)' });
      return;
    }

    const rawKey = authHeader.replace('Bearer ', '');
    const keyHash = crypto.createHash('sha256').update(rawKey).digest('hex');

    const apiKey = await prisma.aPIKey.findUnique({
      where: { keyHash },
      select: {
        id: true,
        organizationId: true,
        scopes: true,
        name: true,
        isActive: true,
        expiresAt: true,
        rateLimit: true,
      },
    });

    if (!apiKey || !apiKey.isActive) {
      res.status(401).json({ error: 'API key inválida o inactiva' });
      return;
    }

    if (apiKey.expiresAt && apiKey.expiresAt < new Date()) {
      res.status(401).json({ error: 'API key expirada' });
      return;
    }

    // Update lastUsedAt async (non-blocking)
    prisma.aPIKey.update({
      where: { id: apiKey.id },
      data: { lastUsedAt: new Date() },
    }).catch(() => {});

    req.apiKey = {
      id: apiKey.id,
      organizationId: apiKey.organizationId,
      scopes: apiKey.scopes,
      name: apiKey.name,
    };

    next();
  } catch (err) {
    next(err);
  }
};

/**
 * Check that the API key has required scope(s).
 */
export const requireScope = (...scopes: string[]) => (req: APIKeyRequest, res: Response, next: NextFunction): void => {
  const keyScopes = req.apiKey?.scopes || [];

  // Wildcard scope check (e.g. "ai:*" covers "ai:inference")
  const hasScope = scopes.every(required => {
    const [ns, action] = required.split(':');
    return keyScopes.includes(required) ||
      keyScopes.includes(`${ns}:*`) ||
      keyScopes.includes('*');
  });

  if (!hasScope) {
    res.status(403).json({
      error: 'Scope insuficiente',
      required: scopes,
      granted: req.apiKey?.scopes,
    });
    return;
  }

  next();
};
