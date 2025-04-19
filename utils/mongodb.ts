import mongoose, { Connection } from "mongoose";
import redisClient from "./redisClient";

const MONGO_URI: string | undefined = process.env.MONGODB_URI;

if (!MONGO_URI) {
  throw new Error("Missing MONGODB_URI in environment variables");
}

// In-memory cache for current invocation
let cachedConn: Connection | null = null;

async function connectDB(): Promise<Connection> {
  console.log("name: ", cachedConn?.name);

  if (cachedConn) {
    console.log("Using in-memory cached DB connection");
    return cachedConn;
  }

  const redisKey = "mongo_connected";

  try {
    const isConnected: string | null = await redisClient.get(redisKey);

    if (isConnected) {
      console.log("Redis indicates DB is connected. Proceeding...");
    } else {
      console.log("Redis shows no connection. Connecting to MongoDB...");
    }

    const mongooseInstance = await mongoose.connect(MONGO_URI as string, {
      bufferCommands: false,
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });

    cachedConn = mongooseInstance.connection;

    // Set Redis flag with expiry
    await redisClient.set(redisKey, "1", "EX", 300); // 5-minute expiry

    console.log("MongoDB connection established");
    return cachedConn;
  } catch (error) {
    console.error("Failed to connect to MongoDB:", error);
    throw error;
  }
}

export default connectDB;
