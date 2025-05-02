import mongoose, { Connection } from "mongoose";
import logger from "./logger";

const MONGO_URI: string | undefined = process.env.MONGODB_URI;

if (!MONGO_URI) {
  throw new Error(
    "Please define the MONGODB_URI environment variable inside .env"
  );
}

interface MongooseCache {
  conn: Connection | null;
  promise: Promise<Connection> | null;
}

declare global {
  var mongoose: MongooseCache | undefined;
}

const globalCache: MongooseCache = globalThis.mongoose ?? {
  conn: null,
  promise: null,
};

async function connectDB(): Promise<Connection> {
  const start = Date.now();
  logger.info("Attempting to connect to MongoDB...");

  if (globalCache.conn) {
    logger.info("Using cached MongoDB connection.");
    return globalCache.conn;
  }

  if (!globalCache.promise) {
    logger.debug("No cached promise found. Creating new connection promise.");
    globalCache.promise = mongoose
      .connect(MONGO_URI as string, {
        bufferCommands: false,
        maxPoolSize: 10,
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
      })
      .then((mongooseInstance) => {
        const duration = Date.now() - start;
        logger.info(`New MongoDB connection established in ${duration}ms.`);
        return mongooseInstance.connection;
      })
      .catch((error) => {
        logger.error("MongoDB connection failed", { error });
        throw error;
      });
  } else {
    logger.debug("Using existing connection promise.");
  }

  try {
    globalCache.conn = await globalCache.promise;
    globalThis.mongoose = globalCache;
    logger.info("MongoDB connection ready.");
    return globalCache.conn;
  } catch (error) {
    logger.error("Error awaiting MongoDB connection promise", { error });
    throw error;
  }
}

export default connectDB;
