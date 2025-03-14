import type { VercelRequest, VercelResponse } from "@vercel/node";
import connectToDatabase from "../lib/mongodb";
import { Db } from "mongodb";

const handler = async (req: VercelRequest, res: VercelResponse) => {
  if (req.method === "GET") {
    const db: Db | void = await connectToDatabase();
    const collection = (db as Db).collection("byte_meets_word_collection");

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
