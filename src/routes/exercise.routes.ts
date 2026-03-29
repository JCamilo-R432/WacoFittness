import { Router } from 'express';
import * as controller from '../controllers/exercise.controller';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { exerciseSchema } from '../schemas/training.schema';

const router = Router();

router.use(authenticate);

router.get('/', controller.getExercises);
router.get('/:id', controller.getExerciseById);
router.post('/', validate(exerciseSchema), controller.createCustomExercise);

export default router;
