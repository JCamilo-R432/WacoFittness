import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import * as ctrl from '../controllers/recoveryMetrics.controller';

const router = Router();

router.post('/log', authenticate, ctrl.log);
router.get('/metrics', authenticate, ctrl.getMetrics);
router.get('/score', authenticate, ctrl.getScore);
router.get('/sleep', authenticate, ctrl.getSleep);
router.get('/hrv', authenticate, ctrl.getHRV);
router.post('/recommendations', authenticate, ctrl.getRecommendations);

export default router;
