import { Router } from 'express';
import * as controller from '../controllers/workoutLog.controller';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { workoutLogSchema } from '../schemas/training.schema';

const router = Router();

router.use(authenticate);

router.post('/log', validate(workoutLogSchema), controller.createLog);
router.get('/log', controller.getLogs);
router.get('/log/:id', controller.getLogById);
router.delete('/log/:id', controller.deleteLog);

export default router;
