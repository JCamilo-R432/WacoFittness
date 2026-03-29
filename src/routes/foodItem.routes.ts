import { Router } from 'express';
import * as controller from '../controllers/foodItem.controller';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { foodItemSchema } from '../schemas/foodItem.schema';

const router = Router();

router.use(authenticate);

router.get('/', controller.getFoods);
router.post('/', validate(foodItemSchema), controller.createCustomFood);
router.get('/suggestions', controller.getSuggestions);
router.get('/my-customs', controller.getMyCustomFoods);
router.get('/barcode/:code', controller.getFoodByBarcode);
router.get('/:id', controller.getFoodById);

export default router;
