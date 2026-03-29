import { Router } from 'express';
import { NutritionController } from '../controllers/nutrition.controller';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { foodQuerySchema, createFoodSchema, mealLogSchema } from '../schemas/nutrition.schema';

const router = Router();

// Alimentos
router.get('/food', authenticate, validate(foodQuerySchema as any), NutritionController.getFoods);
router.post('/food', authenticate, validate(createFoodSchema as any), NutritionController.createFood);

// Recetas
router.get('/recipes', authenticate, NutritionController.getRecipes);
router.get('/recipes/:id', authenticate, NutritionController.getRecipeById);

// Registro de Comidas
router.post('/meal-logs', authenticate, validate(mealLogSchema as any), NutritionController.logMeal);
router.get('/meal-logs', authenticate, NutritionController.getMealLogs);

export default router;
