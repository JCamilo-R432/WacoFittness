import * as repo from '../repositories/recovery.repository';
import * as utils from '../utils/recovery.utils';

export const logSleep = async (userId: string, data: any) => {
    const date = new Date(data.date);

    // Basic validation rules
    const duration = (new Date(data.wakeTime).getTime() - new Date(data.bedtime).getTime()) / (1000 * 3600);
    if (duration <= 0) throw new Error('Wake time must be after bedtime');

    return await repo.createSleepLog(userId, { ...data, date, durationHours: duration });
};

export const logRelaxation = async (userId: string, techniqueId: string, data: any) => {
    return await repo.createRelaxationTechniqueLog(userId, techniqueId, {
        ...data,
        completedAt: new Date()
    });
};

export const logStress = async (userId: string, data: any) => {
    return await repo.createStressLog(userId, { ...data, date: new Date(data.date) });
};

export const fetchRecoveryScore = async (userId: string, dateStr?: string) => {
    const targetDate = dateStr ? new Date(dateStr) : new Date();
    targetDate.setUTCHours(0, 0, 0, 0);

    // Calculate on the fly if not found or get the daily generated
    const score = await repo.getRecoveryScore(userId, targetDate);
    if (score) return score;

    // Placeholder logic for on-the-fly calculating if no background chron has run yet
    return { error: 'No score registered yet for today, will be calculated at EOD.' };
};
