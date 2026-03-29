import { Router } from 'express';
import * as controller from '../controllers/trainingProfile.controller';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { trainingProfileSchema } from '../schemas/training.schema';

const router = Router();

router.use(authenticate);
router.get('/', controller.getProfile);
router.post('/', validate(trainingProfileSchema), controller.createOrUpdateProfile);
router.get('/recommendations', controller.getRecommendations);

export default router;
