import * as repo from '../repositories/workoutLog.repository';

export const createLog = async (userId: string, data: any) => {
    // Validate date is not highly past or future
    const parsedDate = new Date(data.workoutDate);
    const diffDays = (Date.now() - parsedDate.getTime()) / (1000 * 3600 * 24);
    if (diffDays > 90) throw new Error('Cannot log workouts older than 90 days');
    if (diffDays < -1) throw new Error('Cannot log future workouts');

    // Calculates volume per workout logic here or in controller
    const saved = await repo.createWorkout(userId, data);
    // Also PR detection could be fired from here
    return saved;
};

export const getLogs = async (userId: string, dateStr: string) => {
    const d = dateStr ? new Date(dateStr) : new Date();
    d.setUTCHours(0, 0, 0, 0);
    return await repo.getDailyLogs(userId, d);
};

export const getLogById = async (userId: string, id: string) => {
    const log = await repo.getWorkoutById(id, userId);
    if (!log) throw new Error('Log not found');
    return log;
};

export const deleteLog = async (userId: string, id: string) => {
    return await repo.deleteWorkout(id, userId);
};
