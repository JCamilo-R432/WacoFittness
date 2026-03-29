import { Request, Response } from 'express';
import * as profileService from '../services/nutritionProfile.service';

interface AuthRequest extends Request {
    user?: { id: string };
}

export const getProfile = async (req: AuthRequest, res: Response) => {
    try {
        const profile = await profileService.getProfile(req.user!.id);
        if (!profile) return res.status(404).json({ error: 'Profile not found' });
        res.json(profile);
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
};

export const createOrUpdateProfile = async (req: AuthRequest, res: Response) => {
    try {
        const profile = await profileService.createOrUpdateProfile(req.user!.id, req.body);
        res.status(200).json(profile);
    } catch (error) {
        res.status(500).json({ error: 'Server error', details: error });
    }
};

export const updateGoals = async (req: AuthRequest, res: Response) => {
    try {
        const profile = await profileService.updateGoals(req.user!.id, req.body);
        res.status(200).json(profile);
    } catch (error) {
        res.status(500).json({ error: 'Server error', details: error });
    }
};

export const calculateMacrosPreview = async (req: Request, res: Response) => {
    // Can be used to just calculate TMB/TDEE without saving to DB
    try {
        res.json({ message: "In development, but logic exists in service createOrUpdateProfile." });
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
};
