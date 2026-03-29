import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { requireAdmin } from '../middleware/rbac';
import {
  getStats,
  listUsers,
  getUserDetail,
  updateUser,
  banUser,
  unbanUser,
  listTickets,
  replyToTicket,
  closeTicket,
  getAuditLogs,
  getRevenue,
} from '../controllers/admin.controller';

const router = Router();

// Todas las rutas de admin requieren auth + rol admin/superadmin
router.use(authenticate, requireAdmin);

// Dashboard
router.get('/stats', getStats);
router.get('/revenue', getRevenue);

// Users
router.get('/users', listUsers);
router.get('/users/:id', getUserDetail);
router.put('/users/:id', updateUser);
router.post('/users/:id/ban', banUser);
router.post('/users/:id/unban', unbanUser);

// Support
router.get('/tickets', listTickets);
router.post('/tickets/:id/reply', replyToTicket);
router.post('/tickets/:id/close', closeTicket);

// Audit
router.get('/audit-logs', getAuditLogs);

export default router;
