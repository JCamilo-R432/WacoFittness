import { Router } from 'express';
import * as controller from '../controllers/notification.controller';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validate';
import {
    campaignSchema,
    notificationPreferenceSchema,
    notificationScheduleSchema,
    notificationTemplateSchema,
    notificationTokenSchema,
    sendNotificationSchema,
} from '../schemas/notification.schema';

const router = Router();

router.use(authenticate);

// Tokens
router.post('/tokens', validate(notificationTokenSchema), controller.registerToken);
router.get('/tokens', controller.listTokens);
router.delete('/tokens/:id', controller.deleteToken);
router.put('/tokens/:id/refresh', controller.refreshToken);

// Preferences
router.get('/preferences', controller.getPreferences);
router.put('/preferences', validate(notificationPreferenceSchema), controller.updatePreferences);
router.put('/preferences/categories', validate(notificationPreferenceSchema), controller.updatePreferences);
router.put('/preferences/quiet-hours', validate(notificationPreferenceSchema), controller.updatePreferences);

// Notifications
router.get('/', controller.listNotifications);
router.get('/:id', controller.getNotification);
router.put('/:id/read', controller.markRead);
router.put('/:id/click', controller.markClick);
router.delete('/:id', controller.deleteNotification);
router.get('/unread/count', controller.countUnread);
router.put('/read-all', controller.markAllRead);

// Templates
router.get('/templates', controller.listTemplates);
router.get('/templates/:id', controller.getTemplate);
router.post('/templates', validate(notificationTemplateSchema), controller.createTemplate);
router.put('/templates/:id', validate(notificationTemplateSchema), controller.updateTemplate);
router.delete('/templates/:id', controller.deleteTemplate);
router.get('/templates/predefined', controller.listPredefinedTemplates);
router.post('/templates/:id/preview', controller.previewTemplate);

// Schedules
router.get('/schedules', controller.listSchedules);
router.post('/schedules', validate(notificationScheduleSchema), controller.createSchedule);
router.put('/schedules/:id', validate(notificationScheduleSchema), controller.updateSchedule);
router.delete('/schedules/:id', controller.deleteSchedule);
router.put('/schedules/:id/toggle', controller.toggleSchedule);

// Campaigns
router.get('/campaigns', controller.listCampaigns);
router.post('/campaigns', validate(campaignSchema), controller.createCampaign);
router.get('/campaigns/:id', controller.getCampaign);
router.put('/campaigns/:id/send', controller.sendCampaign);
router.get('/campaigns/:id/analytics', controller.getCampaignAnalytics);

// Analytics
router.get('/analytics/summary', controller.analyticsSummary);
router.get('/analytics/by-category', controller.analyticsByCategory);
router.get('/analytics/by-channel', controller.analyticsByChannel);
router.get('/analytics/trends', controller.analyticsTrends);
router.get('/analytics/engagement', controller.analyticsEngagement);

// Test
router.post('/test/send', validate(sendNotificationSchema), controller.testSend);
router.post('/test/preview', validate(sendNotificationSchema), controller.testPreview);

export default router;

