import * as repo from '../repositories/exercise.repository';
import { redisClient, connectRedis } from '../utils/redis';

export const getExercises = async (query = '', category = '', equipment = '', page = 1, limit = 20, userId: string) => {
    const cacheKey = `exercises:${userId}:${query}:${category}:${equipment}:${page}:${limit}`;
    await connectRedis();

    try {
        const cached = await redisClient.get(cacheKey);
        if (cached) return JSON.parse(cached);
    } catch (error) {
        console.error('Redis error', error);
    }

    const result = await repo.searchExercises(query, category, equipment, page, limit, userId);

    try {
        await redisClient.setEx(cacheKey, 86400, JSON.stringify(result)); // TTL 24h
    } catch (error) {
        console.error('Redis set error', error);
    }

    return result;
};

export const getExerciseById = async (id: string, userId: string) => {
    const item = await repo.findById(id);
    if (!item) throw new Error('Exercise not found');
    if (item.isCustom && item.creatorId !== userId) throw new Error('Unauthorized');
    return item;
};

export const createCustomExercise = async (userId: string, data: any) => {
    return await repo.createCustom(userId, data);
};
