import { Router } from 'express';
import { TrainingController } from '../controllers/training.controller';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { exerciseQuerySchema, workoutLogSchema } from '../schemas/training.schema';

const router = Router();

// Ejercicios
router.get('/exercises', authenticate, validate(exerciseQuerySchema as any), TrainingController.getExercises);
router.get('/exercises/:id', authenticate, TrainingController.getExerciseById);

// Registro de Workouts
router.post('/workouts', authenticate, validate(workoutLogSchema as any), TrainingController.logWorkout);
router.get('/workouts', authenticate, TrainingController.getWorkouts);

export default router;
