import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import * as ctrl from '../controllers/backup.controller';

const router = Router();

router.post('/', authenticate, ctrl.createBackup);
router.get('/', authenticate, ctrl.listBackups);
router.delete('/:id', authenticate, ctrl.deleteBackup);

export default router;
