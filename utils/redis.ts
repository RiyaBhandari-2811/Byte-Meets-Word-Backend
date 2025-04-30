import { createClient } from "redis";

let redis: Awaited<ReturnType<typeof createClient>> | null = null;

export async function getRedisClient() {
	if (!redis) {
		console.log("Creating a new Redis client...");
		const redisUrl = process.env.REDIS_URL;

		if (!redisUrl) {
			throw new Error("REDIS_URL environment variable is not set");
		}

		const client = createClient({ url: redisUrl });
		client.on("error", (err) => console.error("Redis Client Error", err));
		redis = await client.connect();
		console.log("Redis client connected successfully.");
	} else {
		console.log("Reusing existing Redis client...");
	}
	return redis;
}
