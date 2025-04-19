import { VercelRequest, VercelResponse } from "@vercel/node";
import tagsController from "../../controllers/tags/tagsController";
import connectDB from "../../utils/mongodb";
import { withAuth } from "../../middlewares/AuthenticatedRequest";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { method, query } = req;
  const { tagId } = query;

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
      case "PATCH":
        await tagsController.updateTagById(req, res, tagId as string);
        break;
      case "DELETE":
        await tagsController.deleteTagById(req, res, tagId as string);
        break;
      default:
        console.log(`Unsupported method: ${method}`);
        res.status(405).json({ error: "Method not allowed" });
    }
  } catch (error) {
    res.status(500).json({ error: (error as any).message });
  }
}
