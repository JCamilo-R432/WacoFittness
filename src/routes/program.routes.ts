import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import * as ctrl from '../controllers/program.controller';

const router = Router();

// Public
router.get('/', ctrl.getPrograms);
router.get('/my', authenticate, ctrl.myPrograms);
router.get('/:id', ctrl.getProgram);

// Authenticated
router.post('/:id/enroll', authenticate, ctrl.enroll);
router.put('/:id/progress', authenticate, ctrl.updateProgress);
router.post('/:id/complete', authenticate, ctrl.completeProgram);

export default router;
