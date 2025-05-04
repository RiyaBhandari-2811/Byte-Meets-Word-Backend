import { VercelRequest, VercelResponse } from "@vercel/node";
import logger from "../../utils/logger";
import createCategories from "../../controllers/categories/createCategories";
import getAllCategories from "../../controllers/categories/getAllCategories";
import updateCategoryById from "../../controllers/categories/updateCategoryById";
import deleteCategoryById from "../../controllers/categories/deleteCategoryById";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { method, query, url } = req;
  const { categoryId } = query;

  logger.debug(`[Category] Incoming request`, {
    method,
    url,
    categoryId,
    query,
  });

  try {
    switch (method) {
      case "POST":
        logger.debug("[Category] Handling POST /categories");
        await createCategories(req, res);
        break;

      case "GET":
        logger.debug("[Category] Handling GET /categories");
        await getAllCategories(req, res);
        break;

      case "PATCH":
        logger.debug(`[Category] Handling PATCH /categories/${categoryId}`);
        await updateCategoryById(req, res, categoryId as string);
        break;

      case "DELETE":
        logger.debug(`[Category] Handling DELETE /categories/${categoryId}`);
        await deleteCategoryById(req, res, categoryId as string);
        break;

      default:
        logger.error(`[Category] Unsupported method: ${method}`);
        res.setHeader("Allow", ["GET", "POST", "PATCH", "DELETE"]);
        res.status(405).json({ error: "Method not allowed" });
    }
  } catch (error) {
    logger.error(`[Category] Handler error: ${(error as Error).message}`, {
      error,
      method,
      url,
    });
    res.status(500).json({ error: "Internal server error" });
  }
}
