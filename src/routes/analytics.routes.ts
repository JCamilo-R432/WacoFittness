import { Router } from 'express';
import { AnalyticsController } from '../controllers/analytics.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

router.use(authenticate);

router.get('/overview', AnalyticsController.getOverview);
router.get('/body-measurements', AnalyticsController.getBodyMeasurements);
router.post('/body-measurements', AnalyticsController.addBodyMeasurement);
router.get('/nutrition-summary', AnalyticsController.getNutritionSummary);
router.get('/training-summary', AnalyticsController.getTrainingSummary);

export default router;
