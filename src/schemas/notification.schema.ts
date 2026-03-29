import { z } from 'zod';

export const createNotificationSchema = z.object({
  type: z.string(),
  category: z.string(),
  title: z.string().min(1),
  body: z.string().min(1),
  data: z.any().optional(),
  priority: z.enum(['low', 'normal', 'high']).default('normal'),
  channel: z.enum(['push', 'email', 'in-app']).default('push'),
});

export const updateNotificationPreferencesSchema = z.object({
  enablePush: z.boolean().optional(),
  enableEmail: z.boolean().optional(),
  enableInApp: z.boolean().optional(),
  categories: z.any().optional(),
  language: z.string().optional(),
});

// Aliases for backward-compatible route imports
export const sendNotificationSchema = createNotificationSchema;
export const notificationPreferenceSchema = updateNotificationPreferencesSchema;

export const campaignSchema = z.object({
  title: z.string().min(2),
  body: z.string().min(2),
  targetAudience: z.enum(['all', 'pro', 'premium', 'enterprise']).optional().default('all'),
  scheduledAt: z.string().datetime().optional(),
  data: z.record(z.string()).optional(),
});

export const notificationScheduleSchema = z.object({
  title: z.string().min(2),
  body: z.string().min(2),
  scheduledAt: z.string().datetime(),
  targetUserId: z.string().uuid().optional(),
  data: z.record(z.string()).optional(),
});

export const notificationTemplateSchema = z.object({
  name: z.string().min(2),
  title: z.string().min(2),
  body: z.string().min(2),
  type: z.string(),
  data: z.record(z.string()).optional(),
});

export const notificationTokenSchema = z.object({
  token: z.string().min(10),
  platform: z.enum(['ios', 'android', 'web']),
  deviceId: z.string().optional(),
});
