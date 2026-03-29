import { createClient } from 'redis';

const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
export const redisClient = createClient({ url: redisUrl });

redisClient.on('error', (err: Error) => console.error('Redis Client Error', err));

let connected = false;

export const connectRedis = async () => {
    if (!connected) {
        await redisClient.connect();
        connected = true;
    }
};

export const clearCache = async (key: string) => {
    if (!connected) await connectRedis();
    await redisClient.del(key);
};
