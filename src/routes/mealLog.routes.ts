import { Router } from 'express';
import * as controller from '../controllers/mealLog.controller';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { addMealLogSchema } from '../schemas/mealLog.schema';

const router = Router();

router.use(authenticate);

router.post('/', validate(addMealLogSchema), controller.createLog);
router.get('/', controller.getLogs);
router.get('/summary/daily', controller.getDailySummary);
router.get('/summary/weekly', controller.getWeeklySummary);
router.get('/frequent', controller.getFrequentFoods);
router.post('/duplicate/:id', controller.duplicateLog);
router.delete('/:id', controller.deleteLog);

export default router;
