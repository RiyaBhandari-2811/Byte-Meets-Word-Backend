import { VercelRequest, VercelResponse } from "@vercel/node";
import mongoose from "mongoose";
import Article from "../../../models/Article";
import Category from "../../../models/Category";
import Tag from "../../../models/Tag";
import { getPagination } from "../../../utils/getPagination";
import { getRedisClient } from "../../../utils/redis";
import { CACHE_KEYS, TTL } from "../../../constants/redisConstants";
import logger from "../../../utils/logger";
import connectDB from "../../../utils/mongodb";
import { IGetArticlesResponse } from "../../../types/article";
import { getDataWithCache } from "../../../utils/cacheUtil";

const fetchArticlesByTagOrCategory = async ({
  categoryId,
  tagId,
  req,
  res,
}: {
  categoryId?: string | string[];
  tagId?: string | string[];
  req: VercelRequest;
  res: VercelResponse;
}) => {
  try {
    const { page, limit, skip } = getPagination(req);
    const isCategory = Boolean(categoryId);
    const keyId = (isCategory ? categoryId : tagId) as string;

    const fetchArticlesByTagOrCategoryFromDB = async () => {
      await connectDB();

      logger.debug("Connected to MongoDB - querying articles collection");

      const idToCheck = new mongoose.Types.ObjectId(keyId);

      let name = "";

      if (isCategory) {
        const category = await Category.findById(idToCheck);
        logger.debug(
          `Fetched category by ID ${categoryId}: ${JSON.stringify(category)}`
        );
        if (!category) {
          logger.error(`Category not found: ${categoryId}`);
          return res.status(404).json({ message: "Category not found" });
        }
        name = category.name;
      } else {
        const tag = await Tag.findById(idToCheck);
        logger.debug(`Fetched tag by ID ${tagId}: ${JSON.stringify(tag)}`);
        if (!tag) {
          logger.error(`Tag not found: ${tagId}`);
          return res.status(404).json({ message: "Tag not found" });
        }
        name = tag.name;
      }

      const matchFilter: any = {};
      if (isCategory) matchFilter.category = idToCheck;
      else matchFilter.tags = idToCheck;

      logger.debug(
        `Running aggregation with filter: ${JSON.stringify(
          matchFilter
        )}, skip: ${skip}, limit: ${limit}`
      );

      const result = await Article.aggregate([
        { $match: matchFilter },
        {
          $facet: {
            data: [
              { $sort: { createdAt: -1 } },
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

      const articles = result[0]?.data || [];
      const total = result[0]?.total?.[0]?.count || 0;
      const totalPages = Math.ceil(total / limit);

      logger.debug(
        `Aggregation completed. Found ${articles.length} articles. Total: ${total}`
      );

      const response: IGetArticlesResponse = {
        name,
        articles,
        total,
        page: page || "all",
        totalPages,
      };

      return response;
    };

    const response = await getDataWithCache(
      fetchArticlesByTagOrCategoryFromDB,
      {
        cacheKey: isCategory
          ? CACHE_KEYS.ARTICLES_BY_CATEGORY(keyId, page, limit)
          : CACHE_KEYS.ARTICLES_BY_TAG(keyId, page, limit),
        ttl: TTL.ARTICLES,
      }
    );

    res.status(200).json(response);
  } catch (error) {
    logger.error(
      `Error in fetchArticlesByTagOrCategory: ${(error as Error).message}\n${
        (error as Error).stack
      }`
    );
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export default fetchArticlesByTagOrCategory;
