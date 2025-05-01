import { createClient } from "redis";

let globalRedis = globalThis as unknown as {
  redis: ReturnType<typeof createClient> | null;
  isConnected: boolean;
};

globalRedis.redis ??= createClient({ url: process.env.REDIS_URL! });
globalRedis.isConnected ??= false;

export async function getRedisClient() {
  if (!globalRedis.isConnected) {
    await globalRedis.redis!.connect();
    globalRedis.isConnected = true;
    console.log("Connected to Redis");
  } else {
    console.log("Using existing Redis connection");
  }
  return globalRedis.redis!;
}
