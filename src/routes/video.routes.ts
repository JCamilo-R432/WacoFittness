import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import * as ctrl from '../controllers/video.controller';

const router = Router();

// Public
router.get('/categories', ctrl.getCategories);
router.get('/', ctrl.getVideos);
router.get('/history', authenticate, ctrl.getHistory);
router.get('/recommended', authenticate, ctrl.getRecommended);
router.get('/:id', ctrl.getVideo);

// Authenticated
router.post('/:id/watch', authenticate, ctrl.logWatch);
router.post('/:id/like', authenticate, ctrl.toggleLike);

export default router;
