import { VercelRequest, VercelResponse } from "@vercel/node";
import { CACHE_KEYS, TTL } from "../../constants/redisConstants";
import connectDB from "../../utils/mongodb";
import logger from "../../utils/logger";
import Category from "../../models/Category";
import { getDataWithCache } from "../../utils/cacheUtils";

const getAllRails = async (req: VercelRequest, res: VercelResponse) => {
  try {

    logger.debug("[Rails] Fetching content rails...");

    const fetchRailsFromDB = async () => {
      await connectDB();
      logger.debug("Connected to MongoDB - querying content rails collection");

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
      return rails;
    };

    const response = await getDataWithCache(fetchRailsFromDB, {
      cacheKey: CACHE_KEYS.CONTENT_RAIL,
      ttl: TTL.CONTENT_RAIL,
    });

    res.status(200).json(response);

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
