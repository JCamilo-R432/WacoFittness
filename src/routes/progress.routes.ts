import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import * as ctrl from '../controllers/progress.controller';

const router = Router();

router.use(authenticate);

router.get('/stats', ctrl.getStats);
router.get('/streak', ctrl.getStreak);
router.get('/photos', ctrl.getPhotos);
router.post('/photos', ctrl.addPhoto);
router.delete('/photos/:id', ctrl.deletePhoto);
router.get('/measurements', ctrl.getMeasurements);
router.post('/measurements', ctrl.logMeasurement);

export default router;
