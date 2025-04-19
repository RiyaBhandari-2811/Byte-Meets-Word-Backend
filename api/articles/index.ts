import { VercelRequest, VercelResponse } from "@vercel/node";
import { articlesController } from "../../controllers/articlesController";
import connectDB from "../../utils/mongodb";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { method, query } = req;
  const { articleId, categoryId, tagId } = query;

  try {
    await connectDB();
    switch (method) {
      case "POST":
        await articlesController.create(req, res);
        break;
      case "GET":
        if (articleId)
          return await articlesController.getById(req, res, articleId);
        else if (categoryId)
          return await articlesController.getByCategory(req, res, categoryId);
        else if (tagId)
          return await articlesController.getByTag(req, res, tagId);
        else await articlesController.getAll(req, res);
        break;
      case "PATCH":
        if (articleId) await articlesController.update(req, res, articleId);
        break;
      case "DELETE":
        if (articleId) await articlesController.delete(req, res, articleId);
        break;
    }
  } catch (error) {
    res.status(500).json({ error: (error as any).message });
  }
}
