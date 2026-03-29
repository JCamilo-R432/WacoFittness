import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { registerSchema, loginSchema, updateProfileSchema } from '../schemas/auth.schema';

const router = Router();

router.post('/register', validate(registerSchema as any), AuthController.register);
router.post('/login', validate(loginSchema as any), AuthController.login);
router.get('/profile', authenticate, AuthController.getProfile);
router.put('/profile', authenticate, validate(updateProfileSchema as any), AuthController.updateProfile);

export default router;
