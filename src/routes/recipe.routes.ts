import { Router } from 'express';
import * as controller from '../controllers/recipe.controller';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { recipeSchema, recipeReviewSchema, generateByMacrosSchema } from '../schemas/recipe.schema';

const router = Router();

router.use(authenticate);

// List / Creation
router.get('/', controller.getRecipes);
router.post('/', validate(recipeSchema), controller.createRecipe);
router.get('/generate-by-macros', validate(generateByMacrosSchema), controller.generateRecipesByMacros);
router.get('/user/favorites', controller.getUserFavorites);

// Instance ID required
router.get('/:id', controller.getRecipeById);
router.put('/:id', validate(recipeSchema), controller.updateRecipe);
router.delete('/:id', controller.deleteRecipe);

// Actions
router.post('/:id/review', validate(recipeReviewSchema), controller.reviewRecipe);
router.post('/:id/favorite', controller.favoriteRecipe);
router.post('/:id/adjust-portions', controller.adjustPortions);

export default router;
