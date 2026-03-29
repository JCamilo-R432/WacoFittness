import { Router } from 'express';
import { NotificationsController } from '../controllers/notifications.controller';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { updateNotificationPreferencesSchema } from '../schemas/notification.schema';

const router = Router();

router.get('/', authenticate, NotificationsController.getNotifications);
router.put('/:id/read', authenticate, NotificationsController.markAsRead);
router.delete('/:id', authenticate, NotificationsController.deleteNotification);
router.get('/preferences', authenticate, NotificationsController.getPreferences);
router.put('/preferences', authenticate, validate(updateNotificationPreferencesSchema as any), NotificationsController.updatePreferences);

export default router;
