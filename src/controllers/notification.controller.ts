import { Request, Response } from 'express';
import * as service from '../services/notification.service';

interface AuthRequest extends Request {
    user?: { id: string; role?: string };
}

export const registerToken = async (req: AuthRequest, res: Response) => {
    try {
        const token = await service.registerToken(req.user!.id, req.body);
        res.status(201).json(token);
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
};

export const listTokens = async (req: AuthRequest, res: Response) => {
    try {
        const tokens = await service.listTokens(req.user!.id);
        res.json(tokens);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const deleteToken = async (req: AuthRequest, res: Response) => {
    try {
        await service.deleteToken(req.user!.id, req.params.id);
        res.status(204).send();
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
};

export const refreshToken = async (req: AuthRequest, res: Response) => {
    try {
        const token = await service.refreshToken(
            req.user!.id,
            req.params.id,
            req.body.token,
        );
        res.json(token);
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
};

export const getPreferences = async (req: AuthRequest, res: Response) => {
    try {
        const prefs = await service.getPreferences(req.user!.id);
        res.json(prefs);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const updatePreferences = async (req: AuthRequest, res: Response) => {
    try {
        const prefs = await service.updatePreferences(req.user!.id, req.body);
        res.json(prefs);
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
};

export const listNotifications = async (req: AuthRequest, res: Response) => {
    try {
        const page = Number(req.query.page ?? 1);
        const notifications = await service.listNotifications(req.user!.id, page);
        res.json(notifications);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const getNotification = async (req: AuthRequest, res: Response) => {
    try {
        const notification = await service.getNotification(
            req.user!.id,
            req.params.id,
        );
        if (!notification) return res.status(404).json({ error: 'Not found' });
        res.json(notification);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const markRead = async (req: AuthRequest, res: Response) => {
    try {
        const notification = await service.markRead(
            req.user!.id,
            req.params.id,
        );
        res.json(notification);
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
};

export const markClick = async (req: AuthRequest, res: Response) => {
    try {
        const notification = await service.markClick(
            req.user!.id,
            req.params.id,
        );
        res.json(notification);
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
};

export const deleteNotification = async (
    req: AuthRequest,
    res: Response,
) => {
    try {
        await service.deleteNotification(req.user!.id, req.params.id);
        res.status(204).send();
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
};

export const countUnread = async (req: AuthRequest, res: Response) => {
    try {
        const count = await service.countUnread(req.user!.id);
        res.json({ count });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const markAllRead = async (req: AuthRequest, res: Response) => {
    try {
        await service.markAllRead(req.user!.id);
        res.status(204).send();
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
};

export const listTemplates = async (req: AuthRequest, res: Response) => {
    try {
        const templates = await service.listTemplates();
        res.json(templates);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const getTemplate = async (req: AuthRequest, res: Response) => {
    try {
        const template = await service.getTemplate(req.params.id);
        if (!template) return res.status(404).json({ error: 'Not found' });
        res.json(template);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const createTemplate = async (req: AuthRequest, res: Response) => {
    try {
        const template = await service.createTemplate(req.body);
        res.status(201).json(template);
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
};

export const updateTemplate = async (req: AuthRequest, res: Response) => {
    try {
        const template = await service.updateTemplate(req.params.id, req.body);
        res.json(template);
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
};

export const deleteTemplate = async (req: AuthRequest, res: Response) => {
    try {
        await service.deleteTemplate(req.params.id);
        res.status(204).send();
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
};

export const listPredefinedTemplates = async (
    req: AuthRequest,
    res: Response,
) => {
    try {
        const templates = await service.listPredefinedTemplates();
        res.json(templates);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const previewTemplate = async (req: AuthRequest, res: Response) => {
    try {
        const template = await service.getTemplate(req.params.id);
        if (!template) return res.status(404).json({ error: 'Not found' });
        res.json({ template, variables: req.body.variables || {} });
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
};

export const listSchedules = async (req: AuthRequest, res: Response) => {
    try {
        const items = await service.listSchedules(req.user!.id);
        res.json(items);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const createSchedule = async (req: AuthRequest, res: Response) => {
    try {
        const item = await service.createSchedule(req.user!.id, req.body);
        res.status(201).json(item);
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
};

export const updateSchedule = async (req: AuthRequest, res: Response) => {
    try {
        const item = await service.updateSchedule(
            req.user!.id,
            req.params.id,
            req.body,
        );
        res.json(item);
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
};

export const deleteSchedule = async (req: AuthRequest, res: Response) => {
    try {
        await service.deleteSchedule(req.user!.id, req.params.id);
        res.status(204).send();
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
};

export const toggleSchedule = async (req: AuthRequest, res: Response) => {
    try {
        const item = await service.toggleSchedule(req.user!.id, req.params.id);
        res.json(item);
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
};

export const listCampaigns = async (req: AuthRequest, res: Response) => {
    try {
        const items = await service.listCampaigns();
        res.json(items);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const createCampaign = async (req: AuthRequest, res: Response) => {
    try {
        const item = await service.createCampaign(req.body);
        res.status(201).json(item);
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
};

export const getCampaign = async (req: AuthRequest, res: Response) => {
    try {
        const item = await service.getCampaign(req.params.id);
        if (!item) return res.status(404).json({ error: 'Not found' });
        res.json(item);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const sendCampaign = async (req: AuthRequest, res: Response) => {
    try {
        const item = await service.getCampaign(req.params.id);
        if (!item) return res.status(404).json({ error: 'Not found' });
        res.json({ message: 'Send not implemented', campaign: item });
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
};

export const getCampaignAnalytics = async (
    req: AuthRequest,
    res: Response,
) => {
    try {
        res.json({ message: 'Campaign analytics not yet implemented' });
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
};

export const analyticsSummary = async (req: AuthRequest, res: Response) => {
    const data = await service.getAnalyticsSummary();
    res.json(data);
};

export const analyticsByCategory = async (req: AuthRequest, res: Response) => {
    const data = await service.getAnalyticsByCategory();
    res.json(data);
};

export const analyticsByChannel = async (req: AuthRequest, res: Response) => {
    const data = await service.getAnalyticsByChannel();
    res.json(data);
};

export const analyticsTrends = async (req: AuthRequest, res: Response) => {
    const data = await service.getAnalyticsTrends();
    res.json(data);
};

export const analyticsEngagement = async (
    req: AuthRequest,
    res: Response,
) => {
    const data = await service.getAnalyticsEngagement();
    res.json(data);
};

export const testSend = async (req: AuthRequest, res: Response) => {
    res.json({ message: 'Test send not yet implemented' });
};

export const testPreview = async (req: AuthRequest, res: Response) => {
    res.json({ message: 'Test preview not yet implemented' });
};

