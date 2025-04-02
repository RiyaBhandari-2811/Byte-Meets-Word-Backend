import { VercelRequest, VercelResponse } from "@vercel/node";
import { articlesController } from "../../../controllers/articlesController";
import connectDB from "../../../utils/mongodb";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { method, query } = req;
  const { categoryId } = query;

  try {
    await connectDB();
    switch (method) {
      case "GET":
        await articlesController.getByCategory(req, res, categoryId);
        break;
    }
  } catch (error) {
    res.status(500).json({ error: (error as any).message });
  }
}
