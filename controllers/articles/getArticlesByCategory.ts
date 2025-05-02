import { VercelRequest, VercelResponse } from "@vercel/node";
import Category from "../../models/Category";
import { fetchArticles } from "../articlesController";
import logger from "../../utils/logger";
import { getRedisClient } from "../../utils/redis";
import fetchArticlesByTagOrCategory from "./helpers/fetchArticlesByTagOrCategory";

const getByCategory = async (
  req: VercelRequest,
  res: VercelResponse,
  categoryId: string | string[]
) => {
  try {
    logger.info("Feching articles by category...");

    const { articles, total, totalPages, page, name } =
      await fetchArticlesByTagOrCategory({
        categoryId,
        req,
      });

    res.status(200).json({
      name,
      articles,
      total,
      page: page || "all",
      totalPages,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch articles",
      error: (error as Error).message,
    });
  }
};

export default getByCategory;
