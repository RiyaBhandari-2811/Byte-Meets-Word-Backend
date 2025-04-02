import { VercelRequest, VercelResponse } from "@vercel/node";
import categoriesController from "../controllers/categories/categoriesController";
import connectDB from "../utils/mongodb";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { method, query } = req;
  const { categoryId } = query;

  try {
    await connectDB();
    switch (method) {
      case "POST":
        await categoriesController.createCategories(req, res);
        break;
      case "GET":
        await categoriesController.getAllCategories(req, res);
        break;
      case "PATCH":
        await categoriesController.updateCategoryById(
          req,
          res,
          categoryId as string
        );
        break;
      case "DELETE":
        await categoriesController.deleteCategoryById(
          req,
          res,
          categoryId as string
        );
        break;
    }
  } catch (error) {
    res.status(500).json({ error: (error as any).message });
  }
}
