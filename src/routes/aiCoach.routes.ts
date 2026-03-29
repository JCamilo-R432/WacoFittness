import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { aiUsageLimit } from '../middleware/aiUsageLimit';
import { voiceChat, getHistory, clearHistory } from '../controllers/aiCoachController';

const router = Router();

// All routes require authentication
router.use(authenticate);

// POST /api/ai-coach/chat
// Body: { text: string }
// Response: { success: true, text: string, type: string }
// NOTE: El backend NUNCA recibe ni envía audio. Solo texto.
router.post('/chat', aiUsageLimit, voiceChat);

// GET /api/ai-coach/history?limit=20&offset=0
// Response: { success: true, messages: [...], total: number }
router.get('/history', getHistory);

// DELETE /api/ai-coach/history
// Response: { success: true, deleted: number }
router.delete('/history', clearHistory);

export default router;
