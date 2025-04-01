import { VercelRequest, VercelResponse } from "@vercel/node";
import tagsController from "../controllers/tags/tagsController";
import connectDB from "../utils/mongodb";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { method, query } = req;
  const { tagId } = query;

  try {
    await connectDB();
    switch (method) {
      case "POST":
        await tagsController.createTags(req, res);
        break;
      case "GET":
        await tagsController.getAllTags(req, res);
        break;
      case "PATCH":
        await tagsController.updateTagById(req, res, tagId as string);
        break;
      case "DELETE":
        await tagsController.deleteTagById(req, res, tagId as string);
        break;
    }
  } catch (error) {
    res.status(500).json({ error: (error as any).message });
  }
}
