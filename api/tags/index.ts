import { VercelRequest, VercelResponse } from "@vercel/node";
import tagsController from "../../controllers/tags/tagsController";
import getAllTags from "../../controllers/tags/functions/getAllTags";
import createTags from "../../controllers/tags/functions/CreateTags";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { method, query } = req;
  const { tagId } = query;

  try {
    switch (method) {
      case "POST":
        await createTags(req, res);
        break;
      case "GET":
        await getAllTags(req, res);
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
