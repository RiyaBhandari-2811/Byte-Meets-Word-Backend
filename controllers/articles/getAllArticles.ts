import { VercelRequest, VercelResponse } from "@vercel/node";
import Article from "../../models/Article";
import { CACHE_KEYS, TTL } from "../../constants/redisConstants";
import { getPagination } from "../../utils/getPagination";
import connectDB from "../../utils/mongodb";
import { IGetArticlesResponse } from "../../types/article";
import logger from "../../utils/logger";
import { getDataWithCache } from "../../utils/cacheUtils";

const getAllArticles = async (req: VercelRequest, res: VercelResponse) => {
  try {
    logger.info("Fetching articles...");
    const { page, limit, skip } = getPagination(req);
    
    const fetchArticlesFromDB = async () => {
      await connectDB();
      logger.debug("Connected to MongoDB - querying articles collection");

      const [aggregationResult] = await Article.aggregate([
        {
          $facet: {
            data: [
              { $skip: skip },
              { $limit: limit },
              {
                $project: {
                  _id: 1,
                  title: 1,
                  description: 1,
                  featureImage: 1,
                  readTime: 1,
                  createdAt: 1,
                },
              },
            ],
            total: [{ $count: "count" }],
          },
        },
      ]);

      const total = aggregationResult?.total?.[0]?.count || 0;
      const totalPages = Math.ceil(total / limit);

      const response: IGetArticlesResponse = {
        name: "Articles",
        articles: aggregationResult.data,
        total,
        page: page || "all",
        totalPages,
      };

      return response;
    };

    const response = await getDataWithCache(fetchArticlesFromDB, {
      cacheKey: CACHE_KEYS.ARTICLES(page, limit),
      ttl: TTL.ARTICLES
    });

    res.status(200).json(response);
  } catch (error) {
    logger.error("Error fetching articles", { error });
    res.status(500).json({
      message: "Failed to fetch articles",
      error: (error as Error).message,
    });
  }
};

export default getAllArticles;
