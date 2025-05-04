import { VercelRequest, VercelResponse } from "@vercel/node";
import Category from "../../models/Category";
import logger from "../../utils/logger";
import { getRedisClient } from "../../utils/redis";
import { getPagination } from "../../utils/getPagination";
import { CACHE_KEYS, TTL } from "../../constants/redisConstants";
import connectDB from "../../utils/mongodb";
import { IGetCategoriesResponse } from "../../types/categories";

const getAllCategories = async (req: VercelRequest, res: VercelResponse) => {
  logger.info(`[Category] Fetching all categories...`);

  try {
    const redis = await getRedisClient();
    const { page, limit, skip } = getPagination(req);
    const cacheKey = CACHE_KEYS.CATEGORIES(page, limit);

    const cachedData = await redis.get(cacheKey);
    if (cachedData) {
      logger.info(`[Category] Cache hit: serving categories from Redis | page: ${page}, limit: ${limit}`);
      return res.status(200).json(JSON.parse(cachedData) as IGetCategoriesResponse);
    }

    logger.debug(`[Category] Cache miss: querying MongoDB | page: ${page}, limit: ${limit}`);

    await connectDB();
    
    logger.debug("[Category] Connected to MongoDB");

    const [aggregationResult] = await Category.aggregate([
      {
        $facet: {
          data: [
            { $skip: skip },
            { $limit: limit },
            {
              $project: {
                _id: 1,
                name: 1,
                showOnHome: 1,
              },
            },
          ],
          total: [{ $count: "count" }],
        },
      },
    ]);

    const total = aggregationResult?.total?.[0]?.count || 0;
    const totalPages = Math.ceil(total / limit);
    const response: IGetCategoriesResponse = {
      name: "Categories",
      categories: aggregationResult.data,
      total,
      page: page || "all",
      totalPages,
    };

    await redis.set(cacheKey, JSON.stringify(response), { EX: TTL.CATEGORIES });
    logger.debug(`[Category] Cached result in Redis | key: ${cacheKey}, ttl: ${TTL.CATEGORIES}s`);

    return res.status(200).json(response);
  } catch (error) {
    logger.error(`[Category] Error fetching categories: ${(error as Error).message}`, { error });
    return res.status(500).json({
      message: "Internal server error",
      error: (error as Error).message,
    });
  }
};

export default getAllCategories;
