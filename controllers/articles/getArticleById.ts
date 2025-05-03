import { VercelRequest, VercelResponse } from "@vercel/node";
import Article from "../../models/Article";
import { CACHE_KEYS, TTL } from "../../constants/redisConstants";
import logger from "../../utils/logger";
import connectDB from "../../utils/mongodb";
import { getRedisClient } from "../../utils/redis";

const getArticleById = async (
  req: VercelRequest,
  res: VercelResponse,
  id: string | string[]
) => {
  const articleId = id as string;
  const cacheKey = CACHE_KEYS.ARTICLE_BY_ID(articleId);

  try {
    logger.debug(`Fetching article with ID: ${articleId}`);
    const redis = await getRedisClient();

    logger.debug(`Checking Redis for cache key: ${cacheKey}`);
    const cachedData = await redis.get(cacheKey);

    if (cachedData) {
      logger.info(`Cache hit for article ID: ${articleId}`);
      return res.status(200).json(JSON.parse(cachedData));
    }

    logger.info(`Cache miss for article ID: ${articleId}. Connecting to DB...`);
    await connectDB();
    logger.debug("Connected to MongoDB");

    const article = await Article.findById(articleId).populate("tags", "name");

    if (!article) {
      logger.warn(`Article not found in DB. ID: ${articleId}`);
      return res.status(404).json({ message: "Article not found" });
    }

    logger.info(`Article fetched from DB. ID: ${articleId}. Caching...`);
    await redis.set(cacheKey, JSON.stringify(article), { EX: TTL.ARTICLES });

    logger.debug(`Article cached with key: ${cacheKey} for ${TTL.ARTICLES}s`);
    return res.status(200).json(article);
  } catch (error) {
    logger.error(
      `Error fetching article by ID: ${articleId}. Reason: ${
        (error as Error).message
      }\nStack: ${(error as Error).stack}`
    );
    return res.status(500).json({
      message: "Failed to fetch article",
      error: (error as Error).message,
    });
  }
};

export default getArticleById;
