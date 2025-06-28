import { VercelRequest, VercelResponse } from "@vercel/node";
import Article from "../../models/Article";
import { CACHE_KEYS, TTL } from "../../constants/redisConstants";
import logger from "../../utils/logger";
import connectDB from "../../utils/mongodb";
import { getRedisClient } from "../../utils/redis";
import { getDataWithCache } from "../../utils/cacheUtil";

const getArticleById = async (
  req: VercelRequest,
  res: VercelResponse,
  id: string | string[]
) => {
  const articleId = id as string;

  try {

    const fetchArticleByIdFromDB = async () => {
      await connectDB();
      logger.debug("Connected to MongoDB - querying articles by id collection");

      const article = await Article.findById(articleId);

      if (!article) {
        logger.error(`Article not found in DB. ID: ${articleId}`);
        return res.status(404).json({ message: "Article not found" });
      }

      return article;
    }

    const response = await getDataWithCache(fetchArticleByIdFromDB, {
      cacheKey: CACHE_KEYS.ARTICLE_BY_ID(articleId),
      ttl: TTL.ARTICLES
    })

    return res.status(200).json(response);
  } catch (error) {
    logger.error(
      `Error fetching article by ID: ${articleId}. Reason: ${(error as Error).message
      }\nStack: ${(error as Error).stack}`
    );
    return res.status(500).json({
      message: "Failed to fetch article",
      error: (error as Error).message,
    });
  }
};

export default getArticleById;
