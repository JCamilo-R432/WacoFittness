import { Response, NextFunction } from 'express';
import { AuthRequest } from './auth';
import { OrgRequest } from './multiTenant';
import { USAGE_PRICING, UsageCategory } from '../shared/constants/EnterpriseTiers';
import prisma from '../config/database';

type MeteringRequest = AuthRequest & OrgRequest;

/**
 * Records API usage for billing purposes.
 * Usage is tracked per organization (if present) or per user.
 *
 * @param category  - billing category (api_call, ai_inference, etc.)
 * @param quantity  - how many units to charge (default: 1)
 */
export const usageMetering = (category: UsageCategory, quantity = 1) =>
  async (req: MeteringRequest, res: Response, next: NextFunction): Promise<void> => {
    const startTime = Date.now();
    next();

    // Record usage after response finishes (non-blocking)
    res.on('finish', () => {
      if (res.statusCode >= 200 && res.statusCode < 300) {
        const unitCost = USAGE_PRICING[category] ?? 0;
        const totalCost = unitCost * quantity;
        const organizationId = (req as OrgRequest).organization?.id;
        const userId = req.user?.id;

        if (!organizationId && !userId) return;

        prisma.usageRecord.create({
          data: {
            organizationId: organizationId || 'personal',
            userId,
            endpoint: req.path,
            method: req.method,
            category,
            quantity,
            unitCost,
            totalCost,
            responseMs: Date.now() - startTime,
            statusCode: res.statusCode,
          },
        }).catch(() => {}); // Never block request
      }
    });
  };
