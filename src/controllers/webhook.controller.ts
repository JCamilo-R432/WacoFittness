/**
 * Webhook Controller para Stripe.
 * IMPORTANTE: Este endpoint recibe el body SIN parsear (raw buffer)
 * para que Stripe pueda verificar la firma.
 */
import { Request, Response } from 'express';
import stripeService from '../services/stripe.service';
import auditService from '../services/audit.service';
import { dispatchEmail } from '../services/queue.service';
import prisma from '../config/database';

export const stripeWebhook = async (req: Request, res: Response) => {
  const signature = req.headers['stripe-signature'] as string;
  if (!signature) {
    return res.status(400).json({ error: 'No stripe-signature header' });
  }

  let event;
  try {
    // req.body es el Buffer raw (configurado en app.ts)
    event = stripeService.verifyWebhookSignature(req.body as Buffer, signature);
  } catch (err: any) {
    console.error('[Webhook] Firma inválida:', err.message);
    return res.status(400).json({ error: `Webhook Error: ${err.message}` });
  }

  // Responder 200 inmediatamente para que Stripe no haga retry
  res.status(200).json({ received: true });

  try {
    await stripeService.handleWebhookEvent(event);

    // Enviar emails según el evento
    await handleEmailNotifications(event);

    // Log del evento
    await auditService.log({
      action: `stripe.${event.type}`,
      resourceType: 'StripeEvent',
      resourceId: event.id,
      metadata: { eventType: event.type },
    });
  } catch (err: any) {
    console.error(`[Webhook] Error procesando ${event.type}:`, err.message);
  }
};

async function handleEmailNotifications(event: any): Promise<void> {
  const metadata = event.data?.object?.metadata;

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object;
      const userId = metadata?.userId;
      if (!userId) break;

      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { email: true, name: true },
      });
      if (!user) break;

      const planName = metadata?.planId?.charAt(0).toUpperCase() + metadata?.planId?.slice(1) || 'Pro';
      await dispatchEmail('payment-success', {
        to: user.email,
        name: user.name,
        planName,
        amount: session.amount_total || 0,
        receiptUrl: session.url,
      });
      break;
    }

    case 'invoice.payment_failed': {
      const invoice = event.data.object;
      const user = await prisma.user.findFirst({
        where: { stripeCustomerId: invoice.customer },
        select: { email: true, name: true, subscription: { select: { planId: true } } },
      });
      if (!user) break;

      await dispatchEmail('payment-failed', {
        to: user.email,
        name: user.name,
        planName: user.subscription?.planId || 'Pro',
      });
      break;
    }

    case 'customer.subscription.deleted': {
      const subscription = event.data.object;
      const sub = await prisma.userSubscription.findFirst({
        where: { stripeSubscriptionId: subscription.id },
        include: { user: { select: { email: true, name: true } } },
      });
      if (!sub) break;

      const endDate = new Date(subscription.current_period_end * 1000).toLocaleDateString('es-ES');
      await dispatchEmail('subscription-canceled', {
        to: sub.user.email,
        name: sub.user.name,
        endDate,
      });
      break;
    }
  }
}
