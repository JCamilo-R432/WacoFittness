import { Request, Response } from 'express';
import * as tUtils from '../utils/training';

export const calculate1RM = (req: Request, res: Response) => {
    const { weight, reps, formula } = req.body;
    const oneRM = tUtils.calculate1RM(weight, reps, formula);
    res.json({ oneRM, formulaUsed: formula || 'average' });
};

export const calculatePercentages = (req: Request, res: Response) => {
    const { oneRM } = req.body;
    if (!oneRM) return res.status(400).json({ error: 'oneRM is required' });
    const percentages = tUtils.calculatePercentages(oneRM);
    res.json(percentages);
};

export const calculateVolume = (req: Request, res: Response) => {
    const { sets, reps, weight } = req.body;
    const volume = tUtils.calculateVolume(sets, reps, weight);
    res.json({ totalVolume: volume });
};

export const getProgression = (req: Request, res: Response) => {
    const { experienceLevel } = req.query;
    const increment = tUtils.recommendWeeklyProgression((experienceLevel as string) || 'beginner');
    res.json({ recommendedWeeklyIncrementKg: increment });
};
