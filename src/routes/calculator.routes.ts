import { Router } from 'express';
import * as controller from '../controllers/calculator.controller';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { oneRMCalculatorSchema } from '../schemas/training.schema';

const router = Router();

router.use(authenticate);

router.post('/1rm', validate(oneRMCalculatorSchema), controller.calculate1RM);
router.post('/percentages', controller.calculatePercentages);
router.post('/volume', controller.calculateVolume);
router.get('/progression', controller.getProgression);

export default router;
