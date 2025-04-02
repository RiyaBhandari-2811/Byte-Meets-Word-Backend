import { VercelRequest, VercelResponse } from "@vercel/node";
import { articlesController } from "../../controllers/articlesController";
import connectDB from "../../utils/mongodb";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { method, query } = req;
  const { articleId } = query;

  try {
    await connectDB();
    switch (method) {
      case "GET":
        await articlesController.getById(req, res, articleId);
        break;
      case "PATCH":
        await articlesController.update(req, res, articleId);
        break;
      case "DELETE":
        await articlesController.delete(req, res, articleId);
        break;
    }
  } catch (error) {
    res.status(500).json({ error: (error as any).message });
  }
}
