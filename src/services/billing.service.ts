import prisma from '../config/database';
import { ENTERPRISE_TIERS, USAGE_PRICING } from '../shared/constants/EnterpriseTiers';
import { InvoiceLineItem } from '../shared/types/EnterpriseTypes';

class BillingService {

  // ── Usage Queries ──────────────────────────────────────────────────────

  async getUsage(organizationId: string, period: { start: Date; end: Date }) {
    const records = await prisma.usageRecord.groupBy({
      by: ['category'],
      where: {
        organizationId,
        timestamp: { gte: period.start, lt: period.end },
      },
      _sum: { quantity: true, totalCost: true },
      _count: { id: true },
    });

    const byCategory: Record<string, { quantity: number; totalCost: number; calls: number }> = {};
    let totalCost = 0;

    for (const r of records) {
      byCategory[r.category] = {
        quantity: Number(r._sum.quantity) || 0,
        totalCost: Number(r._sum.totalCost) || 0,
        calls: r._count.id,
      };
      totalCost += Number(r._sum.totalCost) || 0;
    }

    return { byCategory, totalCost, period, organizationId };
  }

  async getCurrentMonthUsage(organizationId: string) {
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    const end = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    return this.getUsage(organizationId, { start, end });
  }

  // ── Invoice Generation ─────────────────────────────────────────────────

  async generateInvoice(organizationId: string, period: { start: Date; end: Date }) {
    const org = await prisma.organization.findUnique({
      where: { id: organizationId },
      include: { whiteLabelConfig: true },
    });

    if (!org) throw new Error('Organización no encontrada');

    const tier = ENTERPRISE_TIERS[org.plan.toUpperCase() as keyof typeof ENTERPRISE_TIERS];
    const basePrice = tier?.monthlyPrice ?? 49900; // Default to Business

    // Aggregate unbilled usage
    const usage = await prisma.usageRecord.groupBy({
      by: ['category'],
      where: {
        organizationId,
        timestamp: { gte: period.start, lt: period.end },
        billedAt: null,
      },
      _sum: { quantity: true, totalCost: true },
    });

    const lineItems: InvoiceLineItem[] = [
      {
        description: `${tier?.name || org.plan} Plan — Base`,
        category: 'subscription',
        quantity: 1,
        unitPrice: basePrice / 100,
        total: basePrice / 100,
      },
    ];

    let subtotal = basePrice / 100;

    for (const u of usage) {
      const unitPrice = USAGE_PRICING[u.category as keyof typeof USAGE_PRICING] ?? 0;
      const qty = Number(u._sum.quantity) || 0;
      const total = Number(u._sum.totalCost) || 0;

      if (total > 0) {
        lineItems.push({
          description: `${this.formatCategory(u.category)} — Overage`,
          category: u.category,
          quantity: qty,
          unitPrice,
          total,
        });
        subtotal += total;
      }
    }

    const tax = subtotal * 0; // Configure tax per org if needed
    const total = subtotal + tax;
    const invoiceNumber = `INV-${organizationId.slice(0, 8).toUpperCase()}-${Date.now()}`;

    const invoice = await prisma.invoice.create({
      data: {
        organizationId,
        invoiceNumber,
        periodStart: period.start,
        periodEnd: period.end,
        status: 'draft',
        subtotal,
        tax,
        total,
        currency: org.currency || 'USD',
        lineItems: lineItems as any,
        dueDate: new Date(period.end.getTime() + 30 * 24 * 60 * 60 * 1000),
      },
    });

    // Mark usage as billed
    await prisma.usageRecord.updateMany({
      where: {
        organizationId,
        timestamp: { gte: period.start, lt: period.end },
        billedAt: null,
      },
      data: { billedAt: new Date() },
    });

    return invoice;
  }

  async listInvoices(organizationId: string, limit = 12) {
    return prisma.invoice.findMany({
      where: { organizationId },
      orderBy: { createdAt: 'desc' },
      take: limit,
      select: {
        id: true,
        invoiceNumber: true,
        periodStart: true,
        periodEnd: true,
        status: true,
        total: true,
        currency: true,
        dueDate: true,
        paidAt: true,
        pdfUrl: true,
        createdAt: true,
      },
    });
  }

  async markInvoicePaid(invoiceId: string) {
    return prisma.invoice.update({
      where: { id: invoiceId },
      data: { status: 'paid', paidAt: new Date() },
    });
  }

  // ── Dunning Management ─────────────────────────────────────────────────

  async getOverdueInvoices() {
    return prisma.invoice.findMany({
      where: {
        status: 'sent',
        dueDate: { lt: new Date() },
      },
      include: {
        organization: {
          select: { name: true, billingEmail: true, contactEmail: true },
        },
      },
    });
  }

  async handleDunning(invoiceId: string, attempt: number) {
    const invoice = await prisma.invoice.findUnique({
      where: { id: invoiceId },
      include: { organization: true },
    });

    if (!invoice) return;

    // Mark overdue after grace period
    if (attempt >= 3) {
      await prisma.invoice.update({
        where: { id: invoiceId },
        data: { status: 'overdue' },
      });

      // Downgrade org plan if payment repeatedly fails
      await prisma.organization.update({
        where: { id: invoice.organizationId },
        data: { plan: 'free' },
      });
    }
  }

  // ── Revenue Summary ────────────────────────────────────────────────────

  async getRevenueMetrics(period: { start: Date; end: Date }) {
    const invoices = await prisma.invoice.aggregate({
      where: {
        status: 'paid',
        paidAt: { gte: period.start, lt: period.end },
      },
      _sum: { total: true },
      _count: { id: true },
    });

    const newOrgs = await prisma.organization.count({
      where: { createdAt: { gte: period.start, lt: period.end } },
    });

    const activeOrgs = await prisma.organization.count({
      where: { isActive: true },
    });

    return {
      period,
      mrr: Number(invoices._sum.total) || 0,
      invoiceCount: invoices._count.id,
      newOrganizations: newOrgs,
      activeOrganizations: activeOrgs,
    };
  }

  private formatCategory(category: string): string {
    const labels: Record<string, string> = {
      api_call: 'API Calls',
      ai_inference: 'AI Inferences',
      storage_gb: 'Storage (GB)',
      active_user: 'Active Users',
    };
    return labels[category] || category;
  }
}

export const billingService = new BillingService();
export default billingService;
