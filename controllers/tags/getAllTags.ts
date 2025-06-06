import { VercelRequest, VercelResponse } from "@vercel/node";
import { CACHE_KEYS, TTL } from "../../constants/redisConstants";
import Tag from "../../models/Tag";
import { IGetTagsResponse } from "../../types/tag";
import { getPagination } from "../../utils/getPagination";
import logger from "../../utils/logger";
import connectDB from "../../utils/mongodb";
import { getRedisClient } from "../../utils/redis";

const getAllTags = async (req: VercelRequest, res: VercelResponse) => {
  const redis = await getRedisClient();
  const { page, limit, skip } = getPagination(req, true);
  const cacheKey = CACHE_KEYS.TAGS(page, limit);

  try {
    const cachedData = await redis.get(cacheKey);
    if (cachedData) {
      logger.debug(`Cache hit: Serving tags from Redis. Page: ${page}, Limit: ${limit}, CacheKey: ${cacheKey}`);
      return res.status(200).json(JSON.parse(cachedData));
    }

    logger.debug(`Cache miss: Fetching tags from DB. Page: ${page}, Limit: ${limit}`);

    await connectDB();
    logger.debug("Connected to MongoDB - querying tags collection");

    const [aggregationResult] = await Tag.aggregate([
      {
        $facet: {
          data: [
            { $skip: skip },
            { $limit: limit },
            {
              $project: {
                _id: 1,
                name: 1,
              },
            },
          ],
          total: [{ $count: "count" }],
        },
      },
    ]);

    const total = aggregationResult?.total?.[0]?.count || 0;
    const totalPages = Math.ceil(total / limit);

    const response: IGetTagsResponse = {
      name: "Tags",
      tags: aggregationResult.data,
      total,
      page: page || "all",
      totalPages,
    };

    await redis.set(cacheKey, JSON.stringify(response), { EX: TTL.TAGS });
    logger.debug(`Data cached in Redis. CacheKey: ${cacheKey}, TTL: ${TTL.TAGS}`);

    return res.status(200).json(response);
  } catch (error) {
    logger.error(`Failed to fetch tags. Error: ${error}`);
    return res.status(500).json({ error: "Failed to fetch tags" });
  }
};

export default getAllTags;
