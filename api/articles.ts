import { VercelRequest, VercelResponse } from "@vercel/node";
import { articlesController } from "../controllers/articlesController";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { method, query } = req;
  const { id, categoryId, tagId } = query;

  try {
    switch (method) {
      case "POST":
        await articlesController.create(req, res);
        break;
      case "GET":
        if (id) {
          await articlesController.getById(req, res, id);
        } else if (categoryId) {
          await articlesController.getByCategory(req, res, categoryId);
        } else if (tagId) {
          await articlesController.getByTag(req, res, tagId);
        } else {
          await articlesController.getAll(req, res, query);
        }
        break;
      case "PUT":
        await articlesController.update(req, res, id);
        break;
      case "DELETE":
        await articlesController.softDelete(req, res, id);
        break;
      default:
        res.setHeader("Allow", ["GET", "POST", "PUT", "DELETE"]);
        res.status(405).json({ error: `Method ${method} not allowed` });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
