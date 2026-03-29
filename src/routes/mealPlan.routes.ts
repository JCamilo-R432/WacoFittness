import { Router } from 'express';
import * as controller from '../controllers/mealPlan.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

router.use(authenticate);

router.post('/generate', controller.generatePlan);
router.get('/', controller.getActivePlans); // assuming active=true inside
router.get('/:id', controller.getPlanById);
router.put('/:id/swap', controller.swapFood);
router.get('/:id/shopping-list', controller.getShoppingList);
router.put('/:id/activate', controller.activatePlan);
router.put('/:id/deactivate', controller.deactivatePlan);
router.delete('/:id', controller.deletePlan);

export default router;
