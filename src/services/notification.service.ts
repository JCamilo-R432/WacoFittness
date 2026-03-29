import * as repo from '../repositories/notification.repository';
import { shouldSendNotification } from '../utils/notification';

export const registerToken = (userId: string, body: any) =>
    repo.registerToken(userId, body);

export const listTokens = (userId: string) => repo.listTokens(userId);

export const deleteToken = (userId: string, id: string) =>
    repo.deleteToken(id, userId);

export const refreshToken = (userId: string, id: string, token: string) =>
    repo.refreshToken(id, userId, token);

export const getPreferences = (userId: string) =>
    repo.getPreferences(userId);

export const updatePreferences = (userId: string, body: any) =>
    repo.upsertPreferences(userId, body);

export const listNotifications = (
    userId: string,
    page = 1,
    pageSize = 50,
) => {
    const skip = (page - 1) * pageSize;
    return repo.listNotifications(userId, skip, pageSize);
};

export const getNotification = (userId: string, id: string) =>
    repo.getNotificationById(id, userId);

export const markRead = (userId: string, id: string) =>
    repo.markNotificationRead(id, userId);

export const markClick = (userId: string, id: string) =>
    repo.markNotificationClicked(id, userId);

export const deleteNotification = (userId: string, id: string) =>
    repo.deleteNotification(id, userId);

export const countUnread = (userId: string) => repo.countUnread(userId);

export const markAllRead = (userId: string) => repo.markAllRead(userId);

export const listTemplates = () => repo.listTemplates();
export const getTemplate = (id: string) => repo.getTemplateById(id);
export const createTemplate = (body: any) => repo.createTemplate(body);
export const updateTemplate = (id: string, body: any) =>
    repo.updateTemplate(id, body);
export const deleteTemplate = (id: string) => repo.deleteTemplate(id);
export const listPredefinedTemplates = () => repo.listPredefinedTemplates();

export const listSchedules = (userId: string) => repo.listSchedules(userId);
export const createSchedule = (userId: string, body: any) =>
    repo.createSchedule(userId, body);
export const updateSchedule = (userId: string, id: string, body: any) =>
    repo.updateSchedule(id, userId, body);
export const deleteSchedule = (userId: string, id: string) =>
    repo.deleteSchedule(id, userId);
export const toggleSchedule = (userId: string, id: string) =>
    repo.toggleSchedule(id, userId);

export const listCampaigns = () => repo.listCampaigns();
export const createCampaign = (body: any) => repo.createCampaign(body);
export const getCampaign = (id: string) => repo.getCampaignById(id);

export const getAnalyticsSummary = async () => {
    return { message: 'Analytics summary not yet implemented' };
};

export const getAnalyticsByCategory = async () => {
    return { message: 'Analytics by category not yet implemented' };
};

export const getAnalyticsByChannel = async () => {
    return { message: 'Analytics by channel not yet implemented' };
};

export const getAnalyticsTrends = async () => {
    return { message: 'Analytics trends not yet implemented' };
};

export const getAnalyticsEngagement = async () => {
    return { message: 'Analytics engagement not yet implemented' };
};

