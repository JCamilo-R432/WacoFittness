import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { aiUsageLimit } from '../middleware/aiUsageLimit';
import {
  generateMealPlan,
  generateWorkout,
  analyzeFoodImage,
  chat,
  getInsights,
  generateRecipe,
  getAIHistory,
  getUsageStatus,
} from '../controllers/ai.controller';
import * as formCheckService from '../services/formCheck.service';

const router = Router();

// All AI routes require authentication
router.use(authenticate);

// Usage status (no limit consumed)
router.get('/usage', getUsageStatus);

// History (no limit consumed)
router.get('/history', getAIHistory);

// AI generation endpoints (consume 1 AI call each)
router.post('/meal-plan', aiUsageLimit, generateMealPlan);
router.post('/workout', aiUsageLimit, generateWorkout);
router.post('/food-scan', aiUsageLimit, analyzeFoodImage);
router.post('/chat', aiUsageLimit, chat);
router.post('/insights', aiUsageLimit, getInsights);
router.post('/recipe', aiUsageLimit, generateRecipe);

// Form Check endpoints
router.post('/form-check', async (req: any, res) => {
  try {
    const data = await formCheckService.saveFormCheckSession(req.user!.id, req.body);
    res.status(201).json({ success: true, data });
  } catch (e: any) { res.status(400).json({ success: false, error: e.message }); }
});

router.get('/form-check/history', async (req: any, res) => {
  try {
    const data = await formCheckService.getFormCheckHistory(req.user!.id);
    res.json({ success: true, data });
  } catch (e: any) { res.status(400).json({ success: false, error: e.message }); }
});

export default router;
