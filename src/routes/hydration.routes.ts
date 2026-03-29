import { Router } from 'express';
import { HydrationController } from '../controllers/hydration.controller';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { hydrationGoalSchema, hydrationLogSchema } from '../schemas/hydration.schema';

const router = Router();

router.get('/goal', authenticate, HydrationController.getGoal);
router.put('/goal', authenticate, validate(hydrationGoalSchema as any), HydrationController.updateGoal);
router.post('/logs', authenticate, validate(hydrationLogSchema as any), HydrationController.logWater);
router.get('/logs', authenticate, HydrationController.getHistory);
router.get('/stats', authenticate, HydrationController.getStats);

export default router;
