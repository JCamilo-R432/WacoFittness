import * as foodItemRepo from '../repositories/foodItem.repository';
import { redisClient, connectRedis } from '../utils/redis';

export const getFoods = async (
    query: string = '',
    category: string = '',
    page: number = 1,
    limit: number = 20,
    userId: string
) => {
    const cacheKey = `foods:${userId}:${query}:${category}:${page}:${limit}`;
    await connectRedis();

    try {
        const cached = await redisClient.get(cacheKey);
        if (cached) {
            return JSON.parse(cached);
        }
    } catch (error) {
        console.error('Redis get error', error);
    }

    const result = await foodItemRepo.searchFoods(query, category, page, limit, userId);

    try {
        await redisClient.setEx(cacheKey, 86400, JSON.stringify(result)); // TTL 24h
    } catch (error) {
        console.error('Redis set error', error);
    }

    return result;
};

export const getFoodById = async (id: string, userId: string) => {
    const item = await foodItemRepo.findById(id);
    if (!item) throw new Error('Food item not found');
    if (item.isCustom && item.userId !== userId) throw new Error('Unauthorized');
    return item;
};

export const getFoodByBarcode = async (barcode: string, userId: string) => {
    const item = await foodItemRepo.findByBarcode(barcode);
    if (!item) throw new Error('Food item not found');
    if (item.isCustom && item.userId !== userId) throw new Error('Unauthorized');
    return item;
};

export const createCustomFood = async (userId: string, data: any) => {
    return await foodItemRepo.createCustomFood(userId, data);
};

export const getMyCustomFoods = async (userId: string) => {
    return await foodItemRepo.findUserCustomFoods(userId);
};

export const getSuggestions = async (userId: string) => {
    // Mock logic: return top items
    const res = await foodItemRepo.searchFoods('', '', 1, 10, userId);
    return res.items;
};
