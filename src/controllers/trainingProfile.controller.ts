import { Request, Response } from 'express';
import * as profileRepo from '../repositories/trainingProfile.repository';

interface AuthRequest extends Request {
    user?: { id: string };
}

export const getProfile = async (req: AuthRequest, res: Response) => {
    try {
        const profile = await profileRepo.getProfile(req.user!.id);
        if (!profile) return res.status(404).json({ error: 'Training profile not found' });
        res.json(profile);
    } catch (error: any) {
        res.status(500).json({ error: 'Server error' });
    }
};

export const createOrUpdateProfile = async (req: AuthRequest, res: Response) => {
    try {
        const profile = await profileRepo.upsertProfile(req.user!.id, req.body);
        res.status(200).json(profile);
    } catch (error: any) {
        res.status(500).json({ error: 'Server error', details: error.message });
    }
};

export const getRecommendations = async (req: AuthRequest, res: Response) => {
    const profile = await profileRepo.getProfile(req.user!.id);
    if (!profile) return res.status(404).json({ error: 'Profile not found' });

    // Basic logic mockup
    res.json({
        recommendedDays: profile.experienceLevel === 'beginner' ? 3 : 5,
        recommendedSplit: profile.preferredSplit,
        focus: profile.goals
    });
};
