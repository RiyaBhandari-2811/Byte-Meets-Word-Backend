import { VercelRequest } from "@vercel/node";
import Article from "../../../models/Article";
import { getPagination } from "../../../utils/getPagination";
import { getRedisClient } from "../../../utils/redis";

const fetchArticlesByTagOrCategory = async ({
  categoryId,
  tagId,
  req,
}: {
  categoryId?: string | string[];
  tagId?: string | string[];
  req: VercelRequest;
}) => {
  const { page, limit, skip } = getPagination(req);

  const redis = await getRedisClient();

//   if(categoryId){
//     const cachedData = await redis.get();

//   }else {

//   }

  let filter: { category?: string; tags?: string } = {};
  if (typeof categoryId === "string") filter["category"] = categoryId;
  if (typeof tagId === "string") filter["tags"] = tagId;

  const result = await Article.aggregate([
    { $match: filter },
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
              summary: 1,
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

  const articles = result[0].data;
  const total = result[0].total[0]?.count || 0;
  const totalPages = Math.ceil(total / limit);

  return { articles, total, totalPages, page , name };
};

export default fetchArticlesByTagOrCategory;
