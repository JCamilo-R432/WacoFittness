import { Router } from 'express';
import { RestController } from '../controllers/rest.controller';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { sleepLogSchema, relaxationLogSchema, recoveryToolLogSchema } from '../schemas/rest.schema';

const router = Router();

// Sueño
router.post('/sleep-logs', authenticate, validate(sleepLogSchema as any), RestController.logSleep);
router.get('/sleep-logs', authenticate, RestController.getSleepLogs);

// Recuperación y Relajación
router.get('/recovery-score', authenticate, RestController.getRecoveryScore);
router.get('/relaxation-techniques', authenticate, RestController.getRelaxationTechniques);
router.post('/relaxation-logs', authenticate, validate(relaxationLogSchema as any), RestController.logRelaxation);

export default router;
