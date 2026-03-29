import { Router } from 'express';
import * as controller from '../controllers/recovery.controller';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { sleepLogSchema, relaxationLogSchema, stressLogSchema } from '../schemas/recovery.schema';

const router = Router();

router.use(authenticate);

router.post('/sleep/log', validate(sleepLogSchema), controller.logSleep);
router.post('/relaxation/techniques/:id/log', validate(relaxationLogSchema), controller.logRelaxation);
router.post('/stress/log', validate(stressLogSchema), controller.logStress);

router.get('/score', controller.getRecoveryScore);

export default router;
