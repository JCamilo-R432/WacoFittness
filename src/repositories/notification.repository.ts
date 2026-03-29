import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const registerToken = (userId: string, data: any) => {
    return prisma.notificationToken.upsert({
        where: { token: data.token },
        update: {
            userId,
            platform: data.platform,
            deviceId: data.deviceId,
            deviceName: data.deviceName,
            appVersion: data.appVersion,
            isActive: true,
            lastUsedAt: new Date(),
        },
        create: {
            userId,
            token: data.token,
            platform: data.platform,
            deviceId: data.deviceId,
            deviceName: data.deviceName,
            appVersion: data.appVersion,
            isActive: true,
            lastUsedAt: new Date(),
        },
    });
};

export const listTokens = (userId: string) => {
    return prisma.notificationToken.findMany({
        where: { userId, isActive: true },
        orderBy: { createdAt: 'desc' },
    });
};

export const deleteToken = (id: string, userId: string) => {
    return prisma.notificationToken.delete({
        where: { id },
    });
};

export const refreshToken = (id: string, userId: string, token: string) => {
    return prisma.notificationToken.update({
        where: { id },
        data: {
            token,
            lastUsedAt: new Date(),
            isActive: true,
        },
    });
};

export const getPreferences = (userId: string) => {
    return prisma.notificationPreference.findUnique({
        where: { userId },
    });
};

export const upsertPreferences = (userId: string, data: any) => {
    const categories = {
        nutrition: true,
        training: true,
        rest: true,
        hydration: true,
        supplements: true,
        shopping: true,
        system: true,
        ...(data.categories ?? {}),
    };

    return prisma.notificationPreference.upsert({
        where: { userId },
        update: { ...data, categories },
        create: {
            userId,
            enablePush: data.enablePush ?? true,
            enableEmail: data.enableEmail ?? false,
            enableSms: data.enableSms ?? false,
            enableInApp: data.enableInApp ?? true,
            categories,
            quietHoursStart: data.quietHoursStart,
            quietHoursEnd: data.quietHoursEnd,
            timezone: data.timezone ?? 'UTC',
            language: data.language ?? 'es',
            frequency: data.frequency ?? 'normal',
            maxDaily: data.maxDaily ?? 10,
        },
    });
};

export const listNotifications = (userId: string, skip = 0, take = 50) => {
    return prisma.notification.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        skip,
        take,
    });
};

export const getNotificationById = (id: string, userId: string) => {
    return prisma.notification.findFirst({
        where: { id, userId },
    });
};

export const markNotificationRead = (id: string, userId: string) => {
    return prisma.notification.update({
        where: { id },
        data: { status: 'opened', openedAt: new Date() },
    });
};

export const markNotificationClicked = (id: string, userId: string) => {
    return prisma.notification.update({
        where: { id },
        data: { openedAt: new Date() },
    });
};

export const deleteNotification = (id: string, userId: string) => {
    return prisma.notification.delete({
        where: { id },
    });
};

export const countUnread = (userId: string) => {
    return prisma.notification.count({
        where: { userId, status: { in: ['sent', 'delivered'] } },
    });
};

export const markAllRead = (userId: string) => {
    return prisma.notification.updateMany({
        where: { userId, status: { in: ['sent', 'delivered'] } },
        data: { status: 'opened', openedAt: new Date() },
    });
};

export const listTemplates = () => {
    return prisma.notificationTemplate.findMany({
        orderBy: { createdAt: 'desc' },
    });
};

export const getTemplateById = (id: string) => {
    return prisma.notificationTemplate.findUnique({ where: { id } });
};

export const createTemplate = (data: any) => {
    return prisma.notificationTemplate.create({ data });
};

export const updateTemplate = (id: string, data: any) => {
    return prisma.notificationTemplate.update({ where: { id }, data });
};

export const deleteTemplate = (id: string) => {
    return prisma.notificationTemplate.delete({ where: { id } });
};

export const listPredefinedTemplates = () => {
    return prisma.notificationTemplate.findMany({
        where: { isPredefined: true, isActive: true },
        orderBy: { createdAt: 'asc' },
    });
};

export const listSchedules = (userId: string) => {
    return prisma.notificationSchedule.findMany({
        where: { userId },
        orderBy: { time: 'asc' },
    });
};

export const createSchedule = (userId: string, data: any) => {
    return prisma.notificationSchedule.create({
        data: { userId, ...data },
    });
};

export const updateSchedule = (id: string, userId: string, data: any) => {
    return prisma.notificationSchedule.update({
        where: { id },
        data,
    });
};

export const deleteSchedule = (id: string, userId: string) => {
    return prisma.notificationSchedule.delete({
        where: { id },
    });
};

export const toggleSchedule = (id: string, userId: string) => {
    return prisma.notificationSchedule.update({
        where: { id },
        data: { isActive: { set: undefined } },
    });
};

export const createCampaign = (data: any) => {
    return prisma.notificationCampaign.create({ data });
};

export const listCampaigns = () => {
    return prisma.notificationCampaign.findMany({
        orderBy: { createdAt: 'desc' },
    });
};

export const getCampaignById = (id: string) => {
    return prisma.notificationCampaign.findUnique({ where: { id } });
};

