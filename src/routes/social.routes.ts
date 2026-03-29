import { Router } from 'express';
import { SocialController } from '../controllers/social.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

router.use(authenticate);

router.get('/feed', SocialController.getFeed);
router.post('/posts', SocialController.createPost);
router.delete('/posts/:id', SocialController.deletePost);
router.post('/posts/:id/like', SocialController.toggleLike);
router.get('/posts/:id/comments', SocialController.getComments);
router.post('/posts/:id/comments', SocialController.addComment);
router.post('/follow/:targetId', SocialController.toggleFollow);
router.get('/users/:id/stats', SocialController.getUserStats);

export default router;
