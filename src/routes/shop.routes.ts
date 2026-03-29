import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import * as ctrl from '../controllers/shop.controller';

const router = Router();

router.get('/products', authenticate, ctrl.getProducts);
router.get('/recommendations', authenticate, ctrl.getRecommendations);

export default router;
