import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import * as ctrl from '../controllers/challenge.controller';

const router = Router();

// Public
router.get('/', ctrl.getChallenges);
router.get('/my', authenticate, ctrl.myChallenges);
router.get('/:id', ctrl.getChallenge);
router.get('/:id/leaderboard', ctrl.getLeaderboard);

// Authenticated
router.post('/:id/join', authenticate, ctrl.join);
router.post('/:id/progress', authenticate, ctrl.submitProgress);

export default router;
