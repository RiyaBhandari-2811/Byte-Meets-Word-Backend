import { VercelRequest, VercelResponse } from "@vercel/node";
import categoriesController from "../../controllers/categories/categoriesController";
import connectDB from "../../utils/mongodb";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { method } = req;

  try {
    await connectDB();
    switch (method) {
      case "POST":
        await categoriesController.createCategories(req, res);
        break;
      case "GET":
        await categoriesController.getAllCategories(req, res);
        break;
    }
  } catch (error) {
    res.status(500).json({ error: (error as any).message });
  }
}
