import { VercelRequest, VercelResponse } from "@vercel/node";
import tagsController from "../../controllers/tags/tagsController";
import connectDB from "../../utils/mongodb";
import { withAuth } from "../../middlewares/AuthenticatedRequest";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { method } = req;

  try {
    await connectDB();
    switch (method) {
      case "POST":
        if (withAuth(req, res)) {
          await tagsController.createTags(req, res);
          break;
        }
      case "GET":
        await tagsController.getAllTags(req, res);
        break;
    }
  } catch (error) {
    res.status(500).json({ error: (error as any).message });
  }
}
