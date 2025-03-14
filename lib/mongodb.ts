import { Db, MongoClient } from "mongodb";

let cachedDb: Db | null = null;

const connectToDatabase = async () => {
  if (cachedDb) {
    console.log("use exisiting connection");
    return Promise.resolve(cachedDb);
  } else {
    return MongoClient.connect(process.env.MONGODB_URI as string, {})
      .then((client) => {
        cachedDb = client.db("byte_meets_word_db");
        console.log("New DB Connection");
        return cachedDb;
      })
      .catch((err) => {
        console.log(err);
        console.log("Error connecting to DB");
      });
  }
};

export default connectToDatabase;
