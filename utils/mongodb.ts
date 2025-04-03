import mongoose from "mongoose";

const MONGO_URI = process.env.MONGODB_URI;

console.log("ENV: ", process.env);

if (!MONGO_URI) {
  throw new Error(
    "Please define the MONGO_URI environment variable inside .env"
  );
}

let cached = (global as any).mongoose || { conn: null, promise: null };

async function connectDB() {
  if (cached.conn) {
    console.log("Using existing database connection");
    return cached.conn;
  }

  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGO_URI as string, {}).then((mongoose) => {
      console.log("New database connection established");
      return mongoose;
    });
  }

  cached.conn = await cached.promise;
  return cached.conn;
}

(global as any).mongoose = cached; // Store connection globally to avoid reconnecting

export default connectDB;
