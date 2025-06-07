import { createClient, RedisClientType } from "redis";
import logger from "./logger";

let globalRedis = globalThis as unknown as {
  redis: RedisClientType | null;
  isConnected: boolean;
};

globalRedis.redis ??= createClient({ url: process.env.REDIS_URL! });
globalRedis.isConnected ??= false;

export async function getRedisClient(): Promise<RedisClientType> {
  const redis = globalRedis.redis!;

  if (!globalRedis.isConnected) {
    try {
      await redis.connect();
      globalRedis.isConnected = true;
      logger.debug("Successfully connected to Redis");
    } catch (error) {
      logger.error("Failed to connect to Redis", { error });
      throw new Error("Redis connection failed");
    }
  } else {
    logger.debug("Using existing Redis connection");
  }

  return redis;
}
