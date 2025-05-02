import { VercelRequest, VercelResponse } from "@vercel/node";
import Article from "../models/Article";
import Category from "../models/Category";
import Tag from "../models/Tag";
import { IArticleDetail } from "../types/article";
import { getPagination } from "../utils/getPagination";

// Helpers
const getCategoryIdByName = async (name: string): Promise<string | null> => {
  const category = await Category.findOne({ name });
  return category?._id?.toString() ?? null;
};

const getTagIdsByNames = async (tagNames: string[]): Promise<string[]> => {
  const tagsId: string[] = [];
  for (const tag of tagNames) {
    const tagDoc = await Tag.findOne({ name: tag });
    if (!tagDoc) throw new Error(`TagNotFound:${tag}`);
    tagsId.push(tagDoc._id as string);
  }
  return tagsId;
};

export const fetchArticles = async ({
  categoryId,
  tagId,
  req,
}: {
  categoryId?: string | string[];
  tagId?: string | string[];
  req: VercelRequest;
}) => {
  const { page, limit, skip } = getPagination(req);
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

  return { articles, total, totalPages, page };
};

export const articlesController = {
  create: async (req: VercelRequest, res: VercelResponse) => {
    try {
      const payload = req.body as IArticleDetail;
      const categoryId: string | null = await getCategoryIdByName(
        payload.category as string
      );

      if (!categoryId) {
        return res.status(400).json({ message: "Category not found" });
      }

      let tagsId: string[];
      try {
        tagsId = await getTagIdsByNames(payload.tags);
      } catch (err) {
        const message = (err as Error).message;
        if (message.startsWith("TagNotFound:")) {
          return res.status(400).json({
            message: "Tag not found",
            tag: message.split(":")[1],
          });
        }
        throw err;
      }

      const savedArticle = await Article.create({
        ...payload,
        category: categoryId,
        tags: tagsId,
      });

      res.status(201).json({
        message: "Article created successfully",
        article: savedArticle,
      });
    } catch (error) {
      res.status(500).json({
        message: "Internal server error",
        error: (error as Error).message,
      });
    }
  },

  getById: async (
    _req: VercelRequest,
    res: VercelResponse,
    id: string | string[]
  ) => {
    try {
      const articleId = id as string;
      const article = await Article.findById(articleId).populate("tags");
      if (!article) {
        return res.status(404).json({ message: "Article not found" });
      }
      res.status(200).json(article);
    } catch (error) {
      res.status(500).json({
        message: "Failed to fetch article",
        error: (error as Error).message,
      });
    }
  },

  getByCategory: async (
    req: VercelRequest,
    res: VercelResponse,
    categoryId: string | string[]
  ) => {
    try {
      const category = await Category.findById(categoryId);
      if (!category) {
        return res.status(404).json({ message: "Category not found" });
      }

      const { articles, total, totalPages, page } = await fetchArticles({
        categoryId,
        req,
      });

      res.status(200).json({
        name: category.name,
        articles,
        total,
        page: page || "all",
        totalPages,
      });
    } catch (error) {
      res.status(500).json({
        message: "Failed to fetch articles",
        error: (error as Error).message,
      });
    }
  },

  getByTag: async (
    req: VercelRequest,
    res: VercelResponse,
    tagId: string | string[]
  ) => {
    try {
      const tag = await Tag.findById(tagId);
      if (!tag) {
        return res.status(404).json({ message: "Tag not found" });
      }

      const { articles, total, totalPages, page } = await fetchArticles({
        tagId,
        req,
      });

      res.status(200).json({
        name: tag.name,
        articles,
        total,
        page: page || "all",
        totalPages,
      });
    } catch (error) {
      res.status(500).json({
        message: "Failed to fetch articles",
        error: (error as Error).message,
      });
    }
  },

  getAll: async (req: VercelRequest, res: VercelResponse) => {
    try {
      const page = req.query.page ? Number(req.query.page as string) : 0;
      const limit = req.query.limit ? Number(req.query.limit as string) : 6;
      const skip = page ? (page - 1) * limit : 0;

      const [articles, total] = await Promise.all([
        Article.find({}).skip(skip).limit(limit),
        Article.countDocuments(),
      ]);

      const totalPages = Math.ceil(total / limit);
      res.status(200).json({
        name: "Articles",
        articles,
        total,
        page: page || "all",
        totalPages,
      });
    } catch (error) {
      res.status(500).json({
        message: "Failed to fetch articles",
        error: (error as Error).message,
      });
    }
  },

  update: async (
    req: VercelRequest,
    res: VercelResponse,
    id: string | string[]
  ) => {
    try {
      const updateData: Record<string, unknown> = { ...req.body };

      if (updateData.Category) {
        const categoryDoc = await Category.findOne({
          name: updateData.Category as string,
        });
        if (!categoryDoc) {
          return res.status(400).json({ message: "Invalid Category name" });
        }
        updateData.Category = categoryDoc._id;
      }

      if (updateData.tags && Array.isArray(updateData.tags)) {
        try {
          updateData.tags = await getTagIdsByNames(updateData.tags as string[]);
        } catch (err) {
          const message = (err as Error).message;
          if (message.startsWith("TagNotFound:")) {
            return res.status(400).json({
              message: "Tag not found",
              tag: message.split(":")[1],
            });
          }
          throw err;
        }
      }

      const updatedArticle = await Article.findByIdAndUpdate(id, updateData, {
        new: true,
      });
      if (!updatedArticle) {
        return res.status(404).json({ message: "Article not found" });
      }

      res.status(200).json({
        message: "Article updated successfully",
        article: updatedArticle,
      });
    } catch (error) {
      res.status(500).json({
        message: "Failed to update article",
        error: (error as Error).message,
      });
    }
  },

  delete: async (
    _req: VercelRequest,
    res: VercelResponse,
    id: string | string[]
  ) => {
    try {
      const articleId = id as string;
      const deletedArticle = await Article.findByIdAndDelete(articleId);
      if (!deletedArticle) {
        return res.status(404).json({ message: "Article not found" });
      }
      res.status(200).json({
        message: "Article deleted successfully",
        article: deletedArticle,
      });
    } catch (error) {
      res.status(500).json({
        message: "Failed to delete article",
        error: (error as Error).message,
      });
    }
  },
};
