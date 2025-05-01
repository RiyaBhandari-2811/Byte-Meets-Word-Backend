import { CACHE_KEYS, TTL } from "../../../constants/redisConstants";
import Tag from "../../../models/Tag";
import { IGetTagsResponse } from "../../../types/tag";
import AppError from "../../../utils/AppError";
import { getPagination } from "../../../utils/getPagination";
import logger from "../../../utils/logger";
import connectDB from "../../../utils/mongodb";
import { getRedisClient } from "../../../utils/redis";

const getAllTags = async (req: any, res: any) => {
  const redis = await getRedisClient();
  const { page, limit, skip } = getPagination(req, true);
  const cacheKey = CACHE_KEYS.GET_TAGS(page, limit);

  try {
    const cachedData = await redis.get(cacheKey);
    if (cachedData) {
      logger.debug("Cache hit: Serving tags from Redis", { page, limit });
      return res.status(200).json(JSON.parse(cachedData));
    }

    logger.debug("Cache miss: Fetching tags from DB", { page, limit });
    await connectDB();

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

    const response: IGetTagsResponse = {
      tags: aggregationResult.data,
      total,
      page: page || "all",
      totalPages: Math.ceil(total / limit),
    };

    await redis.set(cacheKey, JSON.stringify(response), { EX: TTL.TAGS });
    logger.debug("Data cached in Redis", { key: cacheKey, ttl: TTL.TAGS });

    return res.status(200).json(response);
  } catch (error) {
    throw new AppError("Failed to fetch tags");
  }
};
export default getAllTags;
