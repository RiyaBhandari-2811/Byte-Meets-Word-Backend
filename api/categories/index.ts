import { VercelRequest, VercelResponse } from "@vercel/node";
import categoriesController from "../../controllers/categories/categoriesController";
import connectDB from "../../utils/mongodb";
import logger from "../../utils/logger";
import createCategories from "../../controllers/categories/createCategories";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { method, query, url } = req;
  const { categoryId } = query;

  logger.debug("Incoming request", {
    method,
    url,
    categoryId,
    query,
  });

  try {
    switch (method) {
      case "POST":
        logger.debug("Handling POST /categories");
        await createCategories(req, res);
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
      default:
        console.log(`Unsupported method: ${method}`);
        res.status(405).json({ error: "Method not allowed" });
    }
  } catch (error) {
    res.status(500).json({ error: (error as any).message });
  }
}
