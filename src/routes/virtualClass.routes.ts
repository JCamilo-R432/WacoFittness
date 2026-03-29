import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import * as ctrl from '../controllers/virtualClass.controller';

const router = Router();

// Public
router.get('/categories', ctrl.getCategories);
router.get('/live/upcoming', ctrl.getUpcomingLive);
router.get('/', ctrl.getClasses);
router.get('/:id', ctrl.getClass);

// Authenticated
router.post('/:id/enroll', authenticate, ctrl.enroll);
router.post('/:id/complete', authenticate, ctrl.complete);
router.post('/:id/progress', authenticate, ctrl.progress);
router.post('/:id/rate', authenticate, ctrl.rate);
router.get('/my/enrolled', authenticate, ctrl.myClasses);

export default router;
