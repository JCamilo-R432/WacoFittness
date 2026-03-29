import Stripe from 'stripe';
import prisma from '../config/database';
import { SUBSCRIPTION_PLANS, getPlanById } from '../shared/constants/subscriptionPlans';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2023-10-16',
  typescript: true,
});

export class StripeService {
  // ── Customer ──────────────────────────────────────────────────────────────

  async getOrCreateCustomer(userId: string, email: string, name: string): Promise<string> {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (user?.stripeCustomerId) return user.stripeCustomerId;

    const customer = await stripe.customers.create({
      email,
      name,
      metadata: { userId },
    });

    await prisma.user.update({
      where: { id: userId },
      data: { stripeCustomerId: customer.id },
    });

    return customer.id;
  }

  // ── Checkout ──────────────────────────────────────────────────────────────

  async createCheckoutSession(
    userId: string,
    email: string,
    name: string,
    planId: 'pro' | 'premium',
    successUrl: string,
    cancelUrl: string,
    couponCode?: string,
  ): Promise<{ url: string; sessionId: string }> {
    const plan = SUBSCRIPTION_PLANS[planId.toUpperCase()];
    if (!plan || plan.price === 0) throw new Error('Plan inválido');

    const customerId = await this.getOrCreateCustomer(userId, email, name);

    const sessionParams: Stripe.Checkout.SessionCreateParams = {
      customer: customerId,
      payment_method_types: ['card'],
      mode: 'subscription',
      line_items: [{ price: plan.stripePriceId, quantity: 1 }],
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: { userId, planId },
      subscription_data: {
        trial_period_days: plan.trialDays > 0 ? plan.trialDays : undefined,
        metadata: { userId, planId },
      },
      allow_promotion_codes: true,
      billing_address_collection: 'auto',
    };

    if (couponCode) {
      const coupon = await stripe.coupons.retrieve(couponCode).catch(() => null);
      if (coupon) sessionParams.discounts = [{ coupon: coupon.id }];
    }

    const session = await stripe.checkout.sessions.create(sessionParams);
    return { url: session.url!, sessionId: session.id };
  }

  // ── Billing Portal ────────────────────────────────────────────────────────

  async createBillingPortalSession(
    userId: string,
    returnUrl: string,
  ): Promise<string> {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user?.stripeCustomerId) throw new Error('No hay suscripción activa');

    const session = await stripe.billingPortal.sessions.create({
      customer: user.stripeCustomerId,
      return_url: returnUrl,
    });

    return session.url;
  }

  // ── Subscription ──────────────────────────────────────────────────────────

  async cancelSubscription(userId: string): Promise<void> {
    const sub = await prisma.userSubscription.findUnique({ where: { userId } });
    if (!sub?.stripeSubscriptionId) throw new Error('No hay suscripción activa');

    await stripe.subscriptions.update(sub.stripeSubscriptionId, {
      cancel_at_period_end: true,
    });

    await prisma.userSubscription.update({
      where: { userId },
      data: { cancelAtPeriodEnd: true },
    });
  }

  async getSubscription(userId: string) {
    return prisma.userSubscription.findUnique({ where: { userId } });
  }

  // ── Webhooks ──────────────────────────────────────────────────────────────

  verifyWebhookSignature(payload: Buffer, signature: string): Stripe.Event {
    const secret = process.env.STRIPE_WEBHOOK_SECRET || '';
    return stripe.webhooks.constructEvent(payload, signature, secret);
  }

  async handleWebhookEvent(event: Stripe.Event): Promise<void> {
    switch (event.type) {
      case 'checkout.session.completed':
        await this.onCheckoutCompleted(event.data.object as Stripe.Checkout.Session);
        break;
      case 'invoice.paid':
        await this.onInvoicePaid(event.data.object as Stripe.Invoice);
        break;
      case 'invoice.payment_failed':
        await this.onInvoicePaymentFailed(event.data.object as Stripe.Invoice);
        break;
      case 'customer.subscription.deleted':
        await this.onSubscriptionDeleted(event.data.object as Stripe.Subscription);
        break;
      case 'customer.subscription.updated':
        await this.onSubscriptionUpdated(event.data.object as Stripe.Subscription);
        break;
    }
  }

  private async onCheckoutCompleted(session: Stripe.Checkout.Session): Promise<void> {
    const { userId, planId } = session.metadata || {};
    if (!userId || !planId) return;

    const stripeSubscription = session.subscription
      ? await stripe.subscriptions.retrieve(session.subscription as string)
      : null;

    await prisma.$transaction([
      prisma.userSubscription.upsert({
        where: { userId },
        create: {
          userId,
          planId,
          stripeSubscriptionId: stripeSubscription?.id,
          stripeCustomerId: session.customer as string,
          status: stripeSubscription?.status || 'active',
          currentPeriodStart: stripeSubscription
            ? new Date(stripeSubscription.current_period_start * 1000)
            : undefined,
          currentPeriodEnd: stripeSubscription
            ? new Date(stripeSubscription.current_period_end * 1000)
            : undefined,
          trialEnd: stripeSubscription?.trial_end
            ? new Date(stripeSubscription.trial_end * 1000)
            : undefined,
        },
        update: {
          planId,
          stripeSubscriptionId: stripeSubscription?.id,
          status: stripeSubscription?.status || 'active',
          cancelAtPeriodEnd: false,
          canceledAt: null,
        },
      }),
      prisma.user.update({
        where: { id: userId },
        data: {
          role: planId,
          stripeCustomerId: session.customer as string,
        },
      }),
      prisma.payment.create({
        data: {
          userId,
          stripePaymentIntentId: session.payment_intent as string | undefined,
          amount: session.amount_total || 0,
          currency: session.currency || 'usd',
          status: 'succeeded',
          planId,
          description: `Suscripción ${planId} - WacoPro Fitness`,
        },
      }),
    ]);
  }

  private async onInvoicePaid(invoice: Stripe.Invoice): Promise<void> {
    const customerId = invoice.customer as string;
    const user = await prisma.user.findFirst({ where: { stripeCustomerId: customerId } });
    if (!user) return;

    await prisma.payment.create({
      data: {
        userId: user.id,
        stripeInvoiceId: invoice.id,
        amount: invoice.amount_paid,
        currency: invoice.currency,
        status: 'succeeded',
        receiptUrl: invoice.hosted_invoice_url || undefined,
        description: `Renovación de suscripción`,
      },
    });

    // Renovar período
    if (invoice.subscription) {
      const sub = await stripe.subscriptions.retrieve(invoice.subscription as string);
      await prisma.userSubscription.updateMany({
        where: { stripeSubscriptionId: sub.id },
        data: {
          status: 'active',
          currentPeriodStart: new Date(sub.current_period_start * 1000),
          currentPeriodEnd: new Date(sub.current_period_end * 1000),
        },
      });
    }
  }

  private async onInvoicePaymentFailed(invoice: Stripe.Invoice): Promise<void> {
    const customerId = invoice.customer as string;
    const user = await prisma.user.findFirst({ where: { stripeCustomerId: customerId } });
    if (!user) return;

    await prisma.userSubscription.updateMany({
      where: { userId: user.id },
      data: { status: 'past_due' },
    });

    await prisma.payment.create({
      data: {
        userId: user.id,
        stripeInvoiceId: invoice.id,
        amount: invoice.amount_due,
        currency: invoice.currency,
        status: 'failed',
        failureReason: invoice.last_finalization_error?.message || 'Payment failed',
      },
    });
  }

  private async onSubscriptionDeleted(subscription: Stripe.Subscription): Promise<void> {
    await prisma.userSubscription.updateMany({
      where: { stripeSubscriptionId: subscription.id },
      data: { status: 'canceled', canceledAt: new Date() },
    });

    const sub = await prisma.userSubscription.findFirst({
      where: { stripeSubscriptionId: subscription.id },
    });
    if (sub) {
      await prisma.user.update({
        where: { id: sub.userId },
        data: { role: 'user' },
      });
    }
  }

  private async onSubscriptionUpdated(subscription: Stripe.Subscription): Promise<void> {
    await prisma.userSubscription.updateMany({
      where: { stripeSubscriptionId: subscription.id },
      data: {
        status: subscription.status,
        cancelAtPeriodEnd: subscription.cancel_at_period_end,
        currentPeriodEnd: new Date(subscription.current_period_end * 1000),
      },
    });
  }

  // ── Revenue Analytics ─────────────────────────────────────────────────────

  async getRevenueMetrics() {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

    const [mrr, totalRevenue, activeSubscriptions, planBreakdown] = await Promise.all([
      // MRR: suma de suscripciones activas
      prisma.userSubscription.groupBy({
        by: ['planId'],
        where: { status: 'active' },
        _count: { id: true },
      }),
      // Revenue total
      prisma.payment.aggregate({
        where: { status: 'succeeded' },
        _sum: { amount: true },
      }),
      // Suscriptores activos
      prisma.userSubscription.count({ where: { status: 'active' } }),
      // Breakdown por plan
      prisma.userSubscription.groupBy({
        by: ['planId'],
        where: { status: 'active' },
        _count: true,
      }),
    ]);

    const mrrCents = mrr.reduce((total, group) => {
      const plan = SUBSCRIPTION_PLANS[group.planId.toUpperCase()];
      return total + (plan?.price || 0) * group._count.id;
    }, 0);

    return {
      mrr: mrrCents / 100,
      arr: (mrrCents * 12) / 100,
      totalRevenue: (totalRevenue._sum.amount || 0) / 100,
      activeSubscriptions,
      planBreakdown,
    };
  }
}

export default new StripeService();
