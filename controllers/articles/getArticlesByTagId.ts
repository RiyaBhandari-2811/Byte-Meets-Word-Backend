import { VercelRequest, VercelResponse } from "@vercel/node";
import logger from "../../utils/logger";
import fetchArticlesByTagOrCategory from "./helpers/fetchArticlesByTagOrCategory";

const getArticlesByTagId = async (
  req: VercelRequest,
  res: VercelResponse,
  tagId: string | string[]
) => {
  try {
    logger.info("Feching articles by category...");

    return await fetchArticlesByTagOrCategory({
      tagId,
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

export default getArticlesByTagId;
