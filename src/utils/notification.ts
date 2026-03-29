import * as admin from 'firebase-admin';
import { messaging } from '../config/firebase';

export interface ShouldSendParams {
    preferences: {
        enablePush?: boolean;
        enableEmail?: boolean;
        categories?: Record<string, boolean>;
        quietHoursStart?: string | null;
        quietHoursEnd?: string | null;
        maxDaily?: number;
    };
    category: string;
    channel: 'push' | 'email' | 'sms' | 'inApp';
    currentHourUtc?: number;
    dailyCount: number;
}

export function isQuietHours(
    start: string | null | undefined,
    end: string | null | undefined,
    hour: number,
): boolean {
    if (!start || !end) return false;
    const [sh, sm] = start.split(':').map((v) => Number(v));
    const [eh, em] = end.split(':').map((v) => Number(v));
    const startMinutes = sh * 60 + sm;
    const endMinutes = eh * 60 + em;
    const hMinutes = hour * 60;

    if (endMinutes > startMinutes) {
        return hMinutes >= startMinutes && hMinutes < endMinutes;
    }
    return hMinutes >= startMinutes || hMinutes < endMinutes;
}

export function shouldSendNotification(params: ShouldSendParams): boolean {
    const { preferences, category, channel, currentHourUtc = new Date().getUTCHours(), dailyCount } =
        params;

    if (channel === 'push' && preferences.enablePush === false) return false;
    if (channel === 'email' && preferences.enableEmail === false) return false;

    if (preferences.categories && preferences.categories[category] === false) {
        return false;
    }

    if (
        isQuietHours(
            preferences.quietHoursStart ?? null,
            preferences.quietHoursEnd ?? null,
            currentHourUtc,
        )
    ) {
        if (category !== 'urgent') {
            return false;
        }
    }

    const maxDaily = preferences.maxDaily ?? 10;
    if (dailyCount >= maxDaily) return false;

    return true;
}

export async function sendPushNotificationFCM(tokens: string[], notification: {
    title: string;
    body: string;
    imageUrl?: string;
    data?: Record<string, string>;
    priority: 'high' | 'normal' | 'low';
    category: string;
    actionUrl?: string;
}) {
    if (!messaging) {
        console.warn('Firebase messaging not configured. Skipping push send.');
        return [];
    }

    const results: any[] = [];

    for (const token of tokens) {
        try {
            const message: admin.messaging.Message = {
                token,
                notification: {
                    title: notification.title,
                    body: notification.body,
                    imageUrl: notification.imageUrl,
                },
                data: notification.data,
                android: {
                    priority: notification.priority === 'high' ? 'high' : 'normal',
                    notification: {
                        sound: 'default',
                        clickAction: notification.actionUrl,
                    },
                },
            };

            const response = await messaging.send(message);
            results.push({ token, status: 'sent', messageId: response });
        } catch (error: any) {
            results.push({ token, status: 'failed', error: error.message });
        }
    }

    return results;
}

