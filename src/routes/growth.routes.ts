import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { requireAdmin } from '../middleware/rbac';
import { multiTenant, requireOrg, requireOrgRole } from '../middleware/multiTenant';
import {
  listTests, createTest, startTest, endTest, getTestResults,
  assignVariant, recordConversion,
} from '../controllers/growth.controller';

const router = Router();

router.use(authenticate);

// Client-side: get variant assignment + record conversion (any authenticated user)
router.get('/experiments/:testName/variant', assignVariant);
router.post('/experiments/:testName/convert', recordConversion);

// Admin: manage tests
router.get('/experiments', requireAdmin, multiTenant, listTests);
router.post('/experiments', requireAdmin, multiTenant, createTest);
router.post('/experiments/:testId/start', requireAdmin, startTest);
router.post('/experiments/:testId/end', requireAdmin, endTest);
router.get('/experiments/:testId/results', requireAdmin, getTestResults);

export default router;
