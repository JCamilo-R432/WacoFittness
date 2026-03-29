import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { requireAdmin } from '../middleware/rbac';
import { multiTenant, requireOrg, requireOrgRole } from '../middleware/multiTenant';
import {
  runControls, getComplianceReport, getAuditHistory,
  exportDataGDPR, deleteDataGDPR,
  getDataResidencyConfig, setDataResidency,
} from '../controllers/compliance.controller';

const router = Router();

router.use(authenticate);

// GDPR self-service (any authenticated user)
router.get('/gdpr/export', exportDataGDPR);
router.post('/gdpr/delete', deleteDataGDPR);

// Platform-level compliance (admin)
router.get('/controls/:framework', requireAdmin, runControls);
router.get('/report/:framework', requireAdmin, getComplianceReport);
router.get('/history', requireAdmin, getAuditHistory);

// Org-scoped compliance
router.use(multiTenant);

router.get('/org/controls/:framework', requireOrg, requireOrgRole('admin', 'owner'), runControls);
router.get('/org/report/:framework', requireOrg, requireOrgRole('admin', 'owner'), getComplianceReport);
router.get('/org/residency', requireOrg, requireOrgRole('admin', 'owner'), getDataResidencyConfig);
router.put('/org/residency', requireOrg, requireOrgRole('owner'), setDataResidency);

export default router;
