import { getRedisClient } from './redis';
import logger from './logger';

interface CacheOptions {
  ttl: number;
  cacheKey: string;
}

type DataFetcher<T> = () => Promise<T>;

export async function getDataWithCache<T>(
  dataFetcher: DataFetcher<T>,
  options: CacheOptions
): Promise<T> {
  const { cacheKey, ttl } = options;
  let redis;

  // First check if Redis is available
  try {
    redis = await getRedisClient();
  } catch (redisConnectionError) {
    logger.error("Failed to connect to Redis, falling back to data source", { error: redisConnectionError });
    // If Redis is down, immediately fetch from data source
    return await dataFetcher();
  }

  // If we reach here, Redis is available and connected
  try {
    // Check cache
    logger.debug("Checking Redis cache", { cacheKey });
    const cachedData = await redis.get(cacheKey);

    if (cachedData) {
      logger.debug("Cache hit - returning data from Redis", { cacheKey });
      return JSON.parse(cachedData);
    }
    
    logger.debug("Cache miss - falling back to data source");
  } catch (redisCacheError) {
    logger.error("Redis cache operation failed, falling back to data source", { error: redisCacheError });
    // On cache read error, fall back to data source
    return await dataFetcher();
  }

  // If we reach here, either there was a cache miss or cache read error
  const data = await dataFetcher();

  // Try to cache the new data only if we still have Redis connection
  try {
    await redis.set(cacheKey, JSON.stringify(data), { EX: ttl });
    logger.debug("Data cached in Redis", { cacheKey, ttl });
  } catch (redisCacheError) {
    logger.error("Failed to cache data in Redis", { error: redisCacheError });
    // Cache write failure is non-blocking, we still return the data
  }

  return data;
} 