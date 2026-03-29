import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { sendSuccess, sendError } from '../utils/response';
import stripeService from '../services/stripe.service';
import auditService from '../services/audit.service';
import { SUBSCRIPTION_PLANS } from '../shared/constants/subscriptionPlans';
import prisma from '../config/database';

const APP_URL = process.env.APP_URL || 'http://localhost:3000';

export const getPlans = async (_req: AuthRequest, res: Response) => {
  const plans = Object.values(SUBSCRIPTION_PLANS).map(({ stripePriceId: _, ...p }) => p);
  return sendSuccess(res, plans, 'Planes obtenidos');
};

export const getCurrentSubscription = async (req: AuthRequest, res: Response) => {
  try {
    const subscription = await prisma.userSubscription.findUnique({
      where: { userId: req.user!.id },
    });
    const plan = subscription
      ? SUBSCRIPTION_PLANS[subscription.planId.toUpperCase()]
      : SUBSCRIPTION_PLANS.FREE;

    return sendSuccess(res, { subscription, plan }, 'Suscripción obtenida');
  } catch (err: any) {
    return sendError(res, err.message, 'SUBSCRIPTION_ERROR', 500);
  }
};

export const createCheckout = async (req: AuthRequest, res: Response) => {
  try {
    const { planId, couponCode } = req.body;
    if (!['pro', 'premium'].includes(planId)) {
      return sendError(res, 'Plan inválido', 'INVALID_PLAN', 400);
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
      select: { email: true, name: true },
    });
    if (!user) return sendError(res, 'Usuario no encontrado', 'NOT_FOUND', 404);

    const { url, sessionId } = await stripeService.createCheckoutSession(
      req.user!.id,
      user.email,
      user.name,
      planId,
      `${APP_URL}/billing?success=true&plan=${planId}`,
      `${APP_URL}/pricing?canceled=true`,
      couponCode,
    );

    await auditService.logRequest(req, 'payment.checkout.created', 'Subscription', planId, {
      metadata: { planId, sessionId },
    });

    return sendSuccess(res, { url, sessionId }, 'Checkout creado');
  } catch (err: any) {
    return sendError(res, err.message, 'CHECKOUT_ERROR', 500);
  }
};

export const createBillingPortal = async (req: AuthRequest, res: Response) => {
  try {
    const url = await stripeService.createBillingPortalSession(
      req.user!.id,
      `${APP_URL}/billing`,
    );
    return sendSuccess(res, { url }, 'Portal de facturación creado');
  } catch (err: any) {
    return sendError(res, err.message, 'PORTAL_ERROR', 500);
  }
};

export const cancelSubscription = async (req: AuthRequest, res: Response) => {
  try {
    await stripeService.cancelSubscription(req.user!.id);

    await auditService.logRequest(req, 'payment.subscription.canceled', 'Subscription', req.user!.id);

    return sendSuccess(res, null, 'Suscripción cancelada al final del período actual');
  } catch (err: any) {
    return sendError(res, err.message, 'CANCEL_ERROR', 500);
  }
};

export const getPaymentHistory = async (req: AuthRequest, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = Math.min(parseInt(req.query.limit as string) || 10, 50);
    const offset = (page - 1) * limit;

    const [payments, total] = await Promise.all([
      prisma.payment.findMany({
        where: { userId: req.user!.id },
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset,
      }),
      prisma.payment.count({ where: { userId: req.user!.id } }),
    ]);

    return sendSuccess(res, { payments, total, page, limit }, 'Historial de pagos');
  } catch (err: any) {
    return sendError(res, err.message, 'PAYMENTS_ERROR', 500);
  }
};
