import { Router } from 'express';
import { ShoppingController } from '../controllers/shopping.controller';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { createShoppingListSchema, addShoppingListItemSchema, updateShoppingListItemSchema } from '../schemas/shopping.schema';

const router = Router();

router.post('/lists', authenticate, validate(createShoppingListSchema as any), ShoppingController.createList);
router.get('/lists', authenticate, ShoppingController.getLists);
router.get('/lists/:id', authenticate, ShoppingController.getListById);
router.post('/lists/:id/items', authenticate, validate(addShoppingListItemSchema as any), ShoppingController.addItem);
router.put('/items/:id', authenticate, validate(updateShoppingListItemSchema as any), ShoppingController.updateItem);
router.get('/stores', authenticate, ShoppingController.getStores);

export default router;
