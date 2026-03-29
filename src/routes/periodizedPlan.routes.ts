import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import * as ctrl from '../controllers/periodizedPlan.controller';

const router = Router();

router.post('/', authenticate, ctrl.create);
router.get('/', authenticate, ctrl.list);
router.get('/:id', authenticate, ctrl.getById);
router.put('/:id', authenticate, ctrl.update);
router.delete('/:id', authenticate, ctrl.remove);
router.get('/:id/progress', authenticate, ctrl.progress);

export default router;
