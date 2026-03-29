import prisma from '../config/database';

export class NotificationsService {
  static async getUserNotifications(userId: string) {
    return await prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 50
    });
  }

  static async markAsRead(notificationId: string, userId: string) {
    const notification = await prisma.notification.findUnique({
      where: { id: notificationId }
    });

    if (!notification || notification.userId !== userId) {
      throw new Error('Notificación no encontrada');
    }

    return await prisma.notification.update({
      where: { id: notificationId },
      data: {
        status: 'read',
        openedAt: new Date()
      }
    });
  }

  static async deleteNotification(notificationId: string, userId: string) {
    const notification = await prisma.notification.findUnique({
      where: { id: notificationId }
    });

    if (!notification || notification.userId !== userId) {
      throw new Error('Notificación no encontrada');
    }

    return await prisma.notification.delete({
      where: { id: notificationId }
    });
  }

  static async getPreferences(userId: string) {
    let prefs = await prisma.notificationPreference.findUnique({
      where: { userId }
    });

    if (!prefs) {
      prefs = await prisma.notificationPreference.create({
        data: {
          userId,
          categories: {
            nutrition: true,
            training: true,
            hydration: true,
            rest: true,
            supplements: true
          }
        }
      });
    }
    return prefs;
  }

  static async updatePreferences(userId: string, data: any) {
    return await prisma.notificationPreference.upsert({
      where: { userId },
      update: data,
      create: {
        userId,
        ...data,
        categories: data.categories || {}
      }
    });
  }

  static async createNotification(userId: string, data: any) {
    return await prisma.notification.create({
      data: {
        ...data,
        userId,
        status: 'pending',
        priority: data.priority || 'normal',
        channel: data.channel || 'push'
      }
    });
  }
}
