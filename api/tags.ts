import { VercelRequest, VercelResponse } from "@vercel/node";
import tagsController from "../controllers/tags/tagsController";
import connectDB from "../utils/mongodb";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { method, query } = req;

  try {
    await connectDB();
    switch (method) {
      case "POST":
        await tagsController.create(req, res);
        break;
      case "GET":
        await tagsController.getAll(req, res);
        break;
    }
  } catch (error) {
    res.status(500).json({ error: (error as any).message });
  }
}
