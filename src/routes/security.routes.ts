import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import {
  get2FAStatus,
  setup2FA,
  verify2FA,
  disable2FA,
  regenerateBackupCodes,
  getMyAuditLog,
  createSupportTicket,
  getMySupportTickets,
} from '../controllers/security.controller';

const router = Router();
router.use(authenticate);

// 2FA
router.get('/2fa/status', get2FAStatus);
router.post('/2fa/setup', setup2FA);
router.post('/2fa/verify', verify2FA);
router.delete('/2fa/disable', disable2FA);
router.post('/2fa/backup-codes/regenerate', regenerateBackupCodes);

// Audit log personal
router.get('/audit-log', getMyAuditLog);

// Support tickets
router.post('/tickets', createSupportTicket);
router.get('/tickets', getMySupportTickets);

export default router;
