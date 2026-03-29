import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth';
import { OrgRequest } from '../middleware/multiTenant';
import billingService from '../services/billing.service';

type Req = AuthRequest & OrgRequest;

export const getCurrentUsage = async (req: Req, res: Response, next: NextFunction): Promise<void> => {
  try {
    const usage = await billingService.getCurrentMonthUsage(req.organization!.id);
    res.json({ success: true, usage });
  } catch (err) { next(err); }
};

export const getUsageByPeriod = async (req: Req, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { start, end } = req.query;
    if (!start || !end) {
      res.status(400).json({ error: 'start y end son requeridos (ISO dates)' });
      return;
    }

    const usage = await billingService.getUsage(req.organization!.id, {
      start: new Date(String(start)),
      end: new Date(String(end)),
    });

    res.json({ success: true, usage });
  } catch (err) { next(err); }
};

export const listInvoices = async (req: Req, res: Response, next: NextFunction): Promise<void> => {
  try {
    const invoices = await billingService.listInvoices(req.organization!.id);
    res.json({ success: true, invoices });
  } catch (err) { next(err); }
};

export const generateInvoice = async (req: Req, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { periodStart, periodEnd } = req.body;
    if (!periodStart || !periodEnd) {
      res.status(400).json({ error: 'periodStart y periodEnd son requeridos' });
      return;
    }

    const invoice = await billingService.generateInvoice(req.organization!.id, {
      start: new Date(periodStart),
      end: new Date(periodEnd),
    });

    res.status(201).json({ success: true, invoice });
  } catch (err) { next(err); }
};

export const getRevenueMetrics = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    const end = new Date(now.getFullYear(), now.getMonth() + 1, 1);

    const metrics = await billingService.getRevenueMetrics({ start, end });
    res.json({ success: true, metrics });
  } catch (err) { next(err); }
};
