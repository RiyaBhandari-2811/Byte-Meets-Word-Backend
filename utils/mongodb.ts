import { Db, MongoClient } from "mongodb";

let cachedDb: Db | null = null;

const connectToDatabase = async () => {
  console.log(process.env.MONGODB_URI);
  
  if (cachedDb) {
    console.log("use exisiting connection" , cachedDb);
    return Promise.resolve(cachedDb);
  } else {
    return MongoClient.connect(process.env.MONGODB_URI as string, {})
      .then((client) => {
        cachedDb = client.db("byte_meets_word_db");
        console.log("New DB Connection", cachedDb);
        return cachedDb;
      })
      .catch((err) => {
        console.log(err);
        console.log("Error connecting to DB");
      });
  }
};

export default connectToDatabase;
