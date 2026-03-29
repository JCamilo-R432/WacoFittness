import { Response, NextFunction } from 'express';
import { AuthRequest } from './auth';
import prisma from '../config/database';

// Extend AuthRequest with org context
export interface OrgRequest extends AuthRequest {
  organization?: {
    id: string;
    slug: string;
    plan: string;
    memberRole: string;
    allowOverage: boolean;
  };
}

/**
 * Resolves organization from header X-Organization-Id or X-Organization-Slug.
 * Verifies the authenticated user is a member of that org.
 * Attaches org context to req.organization.
 */
export const multiTenant = async (req: OrgRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const orgId = req.headers['x-organization-id'] as string;
    const orgSlug = req.headers['x-organization-slug'] as string;

    if (!orgId && !orgSlug) {
      next();
      return; // Optional middleware — personal use without org context is fine
    }

    const org = await prisma.organization.findFirst({
      where: {
        ...(orgId ? { id: orgId } : { slug: orgSlug }),
        isActive: true,
      },
      select: { id: true, slug: true, plan: true, allowOverage: true },
    });

    if (!org) {
      res.status(404).json({ error: 'Organización no encontrada o inactiva' });
      return;
    }

    // Verify user membership
    const membership = await prisma.orgMember.findUnique({
      where: {
        organizationId_userId: { organizationId: org.id, userId: req.user!.id },
      },
      select: { role: true, isActive: true },
    });

    if (!membership || !membership.isActive) {
      res.status(403).json({ error: 'No eres miembro de esta organización' });
      return;
    }

    req.organization = {
      id: org.id,
      slug: org.slug,
      plan: org.plan,
      memberRole: membership.role,
      allowOverage: org.allowOverage,
    };

    next();
  } catch (err) {
    next(err);
  }
};

/**
 * Require org context — for routes that MUST have an org.
 */
export const requireOrg = (req: OrgRequest, res: Response, next: NextFunction): void => {
  if (!req.organization) {
    res.status(400).json({ error: 'X-Organization-Id o X-Organization-Slug requerido' });
    return;
  }
  next();
};

/**
 * Require org role at minimum level.
 */
export const requireOrgRole = (...roles: string[]) => (req: OrgRequest, res: Response, next: NextFunction): void => {
  const ROLE_HIERARCHY: Record<string, number> = { member: 0, coach: 1, admin: 2, owner: 3 };
  const userLevel = ROLE_HIERARCHY[req.organization?.memberRole || ''] ?? -1;
  const minRequired = Math.min(...roles.map(r => ROLE_HIERARCHY[r] ?? 99));

  if (userLevel < minRequired) {
    res.status(403).json({ error: `Se requiere rol: ${roles.join(' o ')}` });
    return;
  }
  next();
};
