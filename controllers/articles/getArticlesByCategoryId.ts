import { VercelRequest, VercelResponse } from "@vercel/node";
import logger from "../../utils/logger";
import fetchArticlesByTagOrCategory from "./helpers/fetchArticlesByTagOrCategory";

const getArticlesByCategoryId = async (
  req: VercelRequest,
  res: VercelResponse,
  categoryId: string | string[]
) => {
  try {
    logger.info("Feching articles by category...");

    return await fetchArticlesByTagOrCategory({
      categoryId,
      req,
      res,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch articles",
      error: (error as Error).message,
    });
  }
};

export default getArticlesByCategoryId;
