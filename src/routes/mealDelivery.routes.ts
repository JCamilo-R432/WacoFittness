import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import * as ctrl from '../controllers/mealDelivery.controller';

const router = Router();

router.get('/restaurants', authenticate, ctrl.getRestaurants);
router.get('/meals', authenticate, ctrl.getMeals);
router.post('/order', authenticate, ctrl.createOrder);
router.get('/orders', authenticate, ctrl.getOrders);

export default router;
