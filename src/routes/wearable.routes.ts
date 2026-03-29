import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import {
  getConnections,
  initiateOAuth,
  oauthCallback,
  syncData,
  pushHealthKitData,
  disconnect,
} from '../controllers/wearable.controller';

const router = Router();

// OAuth callback is public (redirect from provider)
router.get('/callback/:provider', oauthCallback);

// All other routes require auth
router.use(authenticate);

router.get('/', getConnections);
router.get('/connect/:provider', initiateOAuth);
router.post('/sync', syncData);
router.post('/healthkit', pushHealthKitData);
router.delete('/:provider', disconnect);

export default router;
