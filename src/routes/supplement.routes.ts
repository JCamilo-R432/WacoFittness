import { Router } from 'express';
import { SupplementController } from '../controllers/supplement.controller';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { supplementQuerySchema, addUserSupplementSchema, logSupplementSchema } from '../schemas/supplement.schema';

const router = Router();

// Catálogo de Suplementos
router.get('/', authenticate, validate(supplementQuerySchema as any), SupplementController.getSupplements);
router.get('/stacks', authenticate, SupplementController.getStacks);
router.get('/:id', authenticate, SupplementController.getSupplementById);

// Gestión de Usuario
router.post('/user', authenticate, validate(addUserSupplementSchema as any), SupplementController.addUserSupplement);
router.get('/user/list', authenticate, SupplementController.getUserSupplements);
router.post('/log', authenticate, validate(logSupplementSchema as any), SupplementController.logSupplement);

export default router;
