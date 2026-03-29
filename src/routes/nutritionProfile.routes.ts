import { Router } from 'express';
import * as controller from '../controllers/nutritionProfile.controller';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { createProfileSchema, updateGoalsSchema } from '../schemas/nutrition.schema';

const router = Router();

router.post('/', authenticate, validate(createProfileSchema), controller.createOrUpdateProfile);
router.get('/', authenticate, controller.getProfile);
router.get('/calculate', controller.calculateMacrosPreview);
router.put('/update-goals', authenticate, validate(updateGoalsSchema), controller.updateGoals);

export default router;
