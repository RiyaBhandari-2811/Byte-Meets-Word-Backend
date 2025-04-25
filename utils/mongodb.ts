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
  logger.info("Connecting to MongoDB... : ", start);
  if (globalCache.conn) {
    console.log("Using cached DB connection");
    return globalCache.conn;
  }

  if (!globalCache.promise) {
    globalCache.promise = mongoose
      .connect(MONGO_URI as string, {
        bufferCommands: false,
        maxPoolSize: 10,
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
      })
      .then((mongooseInstance) => {
        console.log("New DB connection established" , Date.now() - start);
        return mongooseInstance.connection;
      });
  }

  globalCache.conn = await globalCache.promise;
  globalThis.mongoose = globalCache;

  return globalCache.conn;
}

export default connectDB;
