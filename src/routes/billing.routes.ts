import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { requireAdmin } from '../middleware/rbac';
import { multiTenant, requireOrg, requireOrgRole } from '../middleware/multiTenant';
import {
  getCurrentUsage, getUsageByPeriod,
  listInvoices, generateInvoice,
  getRevenueMetrics,
} from '../controllers/billing.controller';

const router = Router();

router.use(authenticate);

// Global revenue (admin only)
router.get('/revenue', requireAdmin, getRevenueMetrics);

// Org-scoped billing
router.use(multiTenant);

router.get('/usage', requireOrg, requireOrgRole('admin', 'owner'), getCurrentUsage);
router.get('/usage/period', requireOrg, requireOrgRole('admin', 'owner'), getUsageByPeriod);
router.get('/invoices', requireOrg, requireOrgRole('admin', 'owner'), listInvoices);
router.post('/invoices/generate', requireOrg, requireOrgRole('owner'), generateInvoice);

export default router;
