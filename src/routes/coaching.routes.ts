import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import * as ctrl from '../controllers/coaching.controller';

const router = Router();

// Public
router.get('/', ctrl.getCoaches);
router.get('/:id', ctrl.getCoach);
router.get('/:id/schedule', ctrl.getCoachSchedule);

// Authenticated
router.post('/sessions', authenticate, ctrl.bookSession);
router.get('/sessions/my', authenticate, ctrl.mySessions);
router.put('/sessions/:id/cancel', authenticate, ctrl.cancelSession);
router.put('/sessions/:id/complete', authenticate, ctrl.completeSession);

export default router;
