import { VercelRequest, VercelResponse } from "@vercel/node";
import { CACHE_KEYS, TTL } from "../../constants/redisConstants";
import connectDB from "../../utils/mongodb";
import { getRedisClient } from "../../utils/redis";
import logger from "../../utils/logger";
import Category from "../../models/Category";

const getAllRails = async (req: VercelRequest, res: VercelResponse) => {
  const cacheKey = CACHE_KEYS.CONTENT_RAIL;
  logger.debug("[Rails] Fetching content rails...");

  try {
    const redis = await getRedisClient();
    const cachedData = await redis.get(cacheKey);

    if (cachedData) {
      logger.info("[Rails] Cache hit - serving content rails from Redis");
      return res.status(200).json(JSON.parse(cachedData));
    }

    logger.debug("[Rails] Cache miss - querying database");
    await connectDB();

    const rails = await Category.aggregate([
      { $match: { showOnHome: true } },
      {
        $lookup: {
          from: "articles",
          let: { categoryId: "$_id" },
          pipeline: [
            { $match: { $expr: { $eq: ["$category", "$$categoryId"] } } },
            { $sort: { createdAt: -1 } },
            { $limit: 3 },
            {
              $project: {
                _id: 1,
                title: 1,
                summary: 1,
                featureImage: 1,
                readTime: 1,
                createdAt: 1,
              },
            },
          ],
          as: "articles",
        },
      },
      {
        $lookup: {
          from: "articles",
          let: { categoryId: "$_id" },
          pipeline: [
            { $match: { $expr: { $eq: ["$category", "$$categoryId"] } } },
            { $count: "total" },
          ],
          as: "totalDocs",
        },
      },
      {
        $addFields: {
          total: { $arrayElemAt: ["$totalDocs.total", 0] },
          showViewAll: {
            $gt: [{ $arrayElemAt: ["$totalDocs.total", 0] }, 3],
          },
        },
      },
      {
        $project: {
          _id: 1,
          name: 1,
          articles: 1,
          showViewAll: 1,
        },
      },
    ]);

    logger.info(`[Rails] Fetched ${rails.length} rails successfully`);
    res.status(200).json(rails);

    await redis.set(cacheKey, JSON.stringify(rails), { EX: TTL.CONTENT_RAIL });
    logger.debug("[Rails] Cached content rails in Redis", {
      cacheKey,
      ttl: TTL.CONTENT_RAIL,
    });
  } catch (error) {
    logger.error("[Rails] Failed to fetch content rails", {
      error: (error as Error).message,
    });

    res.status(500).json({
      message: "Internal server error",
      error: (error as Error).message,
    });
  }
};

export default getAllRails;
