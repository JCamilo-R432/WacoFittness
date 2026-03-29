import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getHydrationGoalByUser = (userId: string) => {
    return prisma.hydrationGoal.findUnique({
        where: { userId },
    });
};

export const upsertHydrationGoal = (
    userId: string,
    data: {
        dailyGoalMl: number;
        calculatedGoalMl: number;
        weightFactor: number;
        activityFactor: number;
        climateFactor: number;
        supplementAdjustment: number;
    },
) => {
    return prisma.hydrationGoal.upsert({
        where: { userId },
        update: {
            ...data,
            lastCalculated: new Date(),
        },
        create: {
            userId,
            ...data,
            lastCalculated: new Date(),
        },
    });
};

export const createHydrationLog = (userId: string, payload: any) => {
    return prisma.hydrationLog.create({
        data: {
            userId,
            ...payload,
        },
    });
};

export const deleteHydrationLog = (userId: string, id: string) => {
    return prisma.hydrationLog.delete({
        where: { id },
    });
};

export const getLogsByDateRange = (userId: string, start: Date, end: Date) => {
    return prisma.hydrationLog.findMany({
        where: {
            userId,
            loggedAt: {
                gte: start,
                lt: end,
            },
        },
        orderBy: { loggedAt: 'asc' },
    });
};

export const getTodayLogs = (userId: string, today: Date) => {
    const start = new Date(
        Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate()),
    );
    const end = new Date(start);
    end.setUTCDate(end.getUTCDate() + 1);
    return getLogsByDateRange(userId, start, end);
};

export const listReminders = (userId: string) => {
    return prisma.hydrationReminder.findMany({
        where: { userId },
        orderBy: { time: 'asc' },
    });
};

export const createReminder = (userId: string, data: any) => {
    return prisma.hydrationReminder.create({
        data: {
            userId,
            ...data,
        },
    });
};

export const updateReminder = (userId: string, id: string, data: any) => {
    return prisma.hydrationReminder.update({
        where: { id },
        data: {
            ...data,
        },
    });
};

export const deleteReminder = (userId: string, id: string) => {
    return prisma.hydrationReminder.delete({
        where: { id },
    });
};

export const snoozeReminder = (userId: string, id: string, minutes: number) => {
    const now = new Date();
    const next = new Date(now.getTime() + minutes * 60 * 1000);
    return prisma.hydrationReminder.update({
        where: { id },
        data: { lastTriggered: now, time: next.toISOString().substring(11, 16) },
    });
};

export const createSymptom = (userId: string, data: any) => {
    return prisma.hydrationSymptom.upsert({
        where: {
            userId_date: {
                userId,
                date: new Date(data.date),
            },
        },
        update: {
            hydrationLevel: data.hydrationLevel,
            urineColor: data.urineColor,
            symptoms: data.symptoms ?? [],
            frequency: data.frequency,
            waterIntakeMl: data.waterIntakeMl,
            notes: data.notes,
        },
        create: {
            userId,
            date: new Date(data.date),
            hydrationLevel: data.hydrationLevel,
            urineColor: data.urineColor,
            symptoms: data.symptoms ?? [],
            frequency: data.frequency,
            waterIntakeMl: data.waterIntakeMl,
            notes: data.notes,
        },
    });
};

export const listSymptoms = (userId: string) => {
    return prisma.hydrationSymptom.findMany({
        where: { userId },
        orderBy: { date: 'desc' },
        take: 90,
    });
};

export const getSettings = (userId: string) => {
    return prisma.hydrationSetting.findUnique({
        where: { userId },
    });
};

export const upsertSettings = (userId: string, data: any) => {
    return prisma.hydrationSetting.upsert({
        where: { userId },
        update: data,
        create: {
            userId,
            ...data,
        },
    });
};

export const listChallenges = () => {
    return prisma.hydrationChallenge.findMany({
        where: { isActive: true },
        orderBy: { createdAt: 'asc' },
    });
};

export const listPredefinedChallenges = () => {
    return prisma.hydrationChallenge.findMany({
        where: { isPredefined: true, isActive: true },
        orderBy: { createdAt: 'asc' },
    });
};

export const joinChallenge = (userId: string, challengeId: string, start: Date, end: Date) => {
    return prisma.userChallenge.create({
        data: {
            userId,
            challengeId,
            startDate: start,
            endDate: end,
        },
    });
};

export const getUserChallenges = (userId: string) => {
    return prisma.userChallenge.findMany({
        where: { userId },
        include: { challenge: true },
        orderBy: { startDate: 'desc' },
    });
};

export const updateUserChallengeProgress = (id: string, data: any) => {
    return prisma.userChallenge.update({
        where: { id },
        data,
    });
};

export const getUserChallengeById = (id: string) => {
    return prisma.userChallenge.findUnique({
        where: { id },
        include: { challenge: true },
    });
};

export const listAchievements = (userId: string) => {
    return prisma.hydrationAchievement.findMany({
        where: { userId },
        orderBy: { earnedAt: 'desc' },
    });
};

export const createAchievement = (userId: string, data: any) => {
    return prisma.hydrationAchievement.create({
        data: {
            userId,
            ...data,
        },
    });
};

export const getWeatherByDate = (userId: string, date: Date) => {
    return prisma.weatherData.findUnique({
        where: {
            userId_date: {
                userId,
                date,
            },
        },
    });
};

export const upsertWeather = (userId: string, data: any) => {
    return prisma.weatherData.upsert({
        where: {
            userId_date: {
                userId,
                date: data.date,
            },
        },
        update: data,
        create: {
            userId,
            ...data,
        },
    });
};

