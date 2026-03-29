import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import {
  getPlans,
  getCurrentSubscription,
  createCheckout,
  createBillingPortal,
  cancelSubscription,
  getPaymentHistory,
} from '../controllers/payment.controller';

const router = Router();

// Pública — ver planes
router.get('/plans', getPlans);

// Requieren auth
router.use(authenticate);
router.get('/subscription', getCurrentSubscription);
router.post('/checkout', createCheckout);
router.post('/portal', createBillingPortal);
router.delete('/subscription', cancelSubscription);
router.get('/history', getPaymentHistory);

export default router;
