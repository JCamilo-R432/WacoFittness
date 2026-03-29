import { Router } from 'express';
import { stripeWebhook } from '../controllers/webhook.controller';

const router = Router();

/**
 * POST /api/webhooks/stripe
 * El body debe ser raw Buffer — configurado en app.ts con express.raw()
 */
router.post('/stripe', stripeWebhook);

export default router;
