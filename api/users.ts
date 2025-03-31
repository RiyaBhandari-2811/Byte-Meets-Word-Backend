import type { VercelRequest, VercelResponse } from "@vercel/node";
import connectToDatabase from "../utils/mongodb";
import { Db } from "mongodb";

const handler = async (req: VercelRequest, res: VercelResponse) => {
  if (req.method === "GET") {
    console.log("GET");
    const db: Db | void = await connectToDatabase();
    console.log("DB", db);

    const collection = (db as Db).collection("byte_meets_word_collection");
    console.log("Collection", collection);

    const users: any = await collection.find({}).toArray();

    res.status(200).json({ users });
  } else if (req.method === "POST") {
    const newuser = req.body;
    const db: Db | void = await connectToDatabase();
    const collection = (db as Db).collection("byte_meets_word_collection");

    const users: any = await collection.insertOne(newuser);

    res.status(200).json({ users });
  } else {
    res.status(404).json({ status: "Method not allowed" });
  }
};

export default handler;
