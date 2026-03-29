import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import * as ctrl from '../controllers/settings.controller';

const router = Router();

router.get('/', authenticate, ctrl.getSettings);
router.put('/', authenticate, ctrl.updateSettings);
router.put('/theme', authenticate, ctrl.updateTheme);
router.put('/language', authenticate, ctrl.updateLanguage);
router.post('/import', authenticate, ctrl.importData);
router.get('/import', authenticate, ctrl.getImportHistory);
router.get('/import/formats', ctrl.getSupportedFormats);

export default router;
