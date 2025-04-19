import Redis from "ioredis";

let redis: Redis;

console.log("process: ", process.env.VERCEL_ENV);

if (process.env.NODE_ENV === "development") {
  redis = new Redis({
    maxRetriesPerRequest: 2,
  });
  console.log("🧪 Using local Redis (localhost:6379)");
} else {
  redis = new Redis({
    username: "default",
    password: "1nQvIriWr2RKJvM2Sp9T7ZH8duPtmrjY",
    host: "redis-16842.c301.ap-south-1-1.ec2.redns.redis-cloud.com",
    port: 16842,
    maxRetriesPerRequest: 2,
  });
  console.log("Using production Redis");
}

redis.on("error", (err) => console.error("Redis Client Error:", err));

export default redis;
