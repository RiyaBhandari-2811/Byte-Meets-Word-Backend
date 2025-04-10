import { VercelRequest, VercelResponse } from "@vercel/node";
import Article from "../models/Article";
import Category from "../models/Category";
import Tag from "../models/Tag";
import { IArticleDetail } from "../types/article";

export const articlesController = {
  create: async (req: VercelRequest, res: VercelResponse) => {
    try {
      console.log("Creating article with data:", req.body);
      const payload: IArticleDetail = req.body as IArticleDetail;

      console.log("Finding category ID for category:", payload.category);
      const category: any = await Category.findOne({ name: payload.category });
      const categoryId: string | null = category
        ? category.get("_id").toString()
        : null;
      if (!categoryId) {
        console.error("Category not found:", payload.category);
        return res.status(400).json({
          message: "Category not found",
        });
      }
      console.log("Category ID found:", categoryId);

      let tagsId: string[] = [];
      for (const tag of payload.tags) {
        console.log("Finding tag ID for tag:", tag);
        const tagObject: any = await Tag.findOne({
          name: tag,
        });
        const tagId: string | null = tagObject
          ? tagObject.get("_id").toString()
          : null;
        if (!tagId) {
          console.error("Tag not found:", tag);
          return res.status(400).json({
            message: "Tag not found",
            tag,
          });
        }
        console.log("Tag ID found:", tagId);
        tagsId.push(tagId);
      }

      console.log("Creating article with category ID and tags ID:", {
        categoryId,
        tagsId,
      });
      const savedArticle = await Article.create({
        ...payload,
        category: categoryId,
        tags: tagsId,
      });

      console.log("Article created successfully:", savedArticle);
      res.status(201).json({
        message: "Article created successfully",
        article: savedArticle,
      });
    } catch (error) {
      console.error("Error creating article:", error);
      res.status(500).json({
        message: "Internal server error",
        error: (error as any).message,
      });
    }
  },
  getById: async (
    req: VercelRequest,
    res: VercelResponse,
    id: string | string[]
  ) => {
    try {
      const articleId = id as string;
      const article = await Article.findById(articleId)
        .populate("category")
        .populate("tags");
      if (!article) {
        return res.status(404).json({
          message: "Article not found",
        });
      }
      res.status(200).json(article);
    } catch (error) {
      console.error("Error fetching article by ID:", error);
      res.status(500).json({
        message: "Failed to fetch article",
        error: (error as any).message,
      });
    }
  },
  getByCategory: async (
    req: VercelRequest,
    res: VercelResponse,
    categoryId: string | string[]
  ) => {
    try {
      const page = req.query.page ? Number(req.query.page as string) : 0;
      const limit = req.query.limit ? Number(req.query.limit as string) : 6;

      const category = await Category.findById(categoryId);
      if (!category) {
        return res.status(404).json({
          message: "Category not found",
          categoryId,
        });
      }

      let articles, total, totalPages;

      if (page) {
        const skip = (page - 1) * limit;
        [articles, total] = await Promise.all([
          Article.find({ category: categoryId })
            .select("_id title summary featureImage readTime createdAt")
            .lean()
            .skip(skip)
            .limit(limit),
          Article.countDocuments({ category: categoryId }),
        ]);
        totalPages = Math.ceil(total / limit);
      } else {
        articles = await Article.find({ category: categoryId })
          .select("_id title summary featureImage readTime createdAt")
          .lean();
        total = articles.length;
        totalPages = 1;
      }

      // Transform the _id field to id
      const formattedArticles = articles.map((article) => ({
        _id: article._id,
        title: article.title,
        description: article.description,
        featureImage: article.featureImage,
        readTime: article.readTime,
        createdAt: article.createdAt,
      }));

      res.json({
        name: category.name,
        articles: formattedArticles,
        total,
        page: page || "all",
        totalPages,
      });
    } catch (error) {
      console.error("Error fetching articles by category:", error);
      res.status(500).json({
        message: "Failed to fetch articles",
        error: (error as any).message,
      });
    }
  },
  getByTag: async (
    req: VercelRequest,
    res: VercelResponse,
    tagId: string | string[]
  ) => {
    try {
      const page = req.query.page ? Number(req.query.page as string) : 0;
      const limit = req.query.limit ? Number(req.query.limit as string) : 6;

      // First verify if tag exists
      const tag = await Tag.findById(tagId);
      if (!tag) {
        return res.status(404).json({
          message: "Tag not found",
          tagId,
        });
      }

      let articles, total, totalPages;

      if (page) {
        const skip = (page - 1) * limit;
        [articles, total] = await Promise.all([
          Article.find({ tags: tagId })
            .select("_id title summary featureImage readTime createdAt")
            .lean()
            .skip(skip)
            .limit(limit),
          Article.countDocuments({ tags: tagId }),
        ]);
        totalPages = Math.ceil(total / limit);
      } else {
        // Full dataset response
        articles = await Article.find({ tags: tagId })
          .select("_id title summary featureImage readTime createdAt")
          .lean();
        total = articles.length;
        totalPages = 1;
      }

      res.status(200).json({
        name: tag.name,
        articles,
        total,
        page: page || "all",
        totalPages,
      });
    } catch (error) {
      console.error("Error fetching articles by tag:", error);
      res.status(500).json({
        message: "Failed to fetch articles",
        error: (error as any).message,
      });
    }
  },
  getAll: async (req: VercelRequest, res: VercelResponse) => {
    try {
      const page = req.query.page ? Number(req.query.page as string) : 0;
      const limit = req.query.limit ? Number(req.query.limit as string) : 6;

      let articles, total, totalPages;

      if (page) {
        const skip = (page - 1) * limit;
        [articles, total] = await Promise.all([
          Article.find({}).skip(skip).limit(limit),
          Article.countDocuments(),
        ]);
        totalPages = Math.ceil(total / limit);
      } else {
        // Full dataset response
        articles = await Article.find({});
        total = articles.length;
        totalPages = 1;
      }

      res.status(200).json({
        name: "Articles",
        articles,
        total,
        page: page || "all",
        totalPages,
      });
    } catch (error) {
      console.error("Error fetching articles:", error);
      res.status(500).json({
        message: "Failed to fetch articles",
        error: (error as any).message,
      });
    }
  },
  update: async (
    req: VercelRequest,
    res: VercelResponse,
    id: string | string[]
  ) => {
    try {
      let updateData = { ...req.body };

      // Check if Category exists and replace it with its ID
      if (updateData.Category) {
        const categoryDoc = await Category.findOne({
          name: updateData.Category,
        });
        if (categoryDoc) {
          updateData.Category = categoryDoc._id;
        } else {
          return res.status(400).json({ message: "Invalid Category name" });
        }
      }

      // Check if Tags exist and replace them with their IDs
      if (updateData.tags && Array.isArray(updateData.tags)) {
        let tagsId: string[] = [];
        for (const tag of updateData.tags) {
          console.log("Finding tag ID for tag:", tag);
          const tagObject: any = await Tag.findOne({
            name: tag,
          });
          const tagId: string | null = tagObject
            ? tagObject.get("_id").toString()
            : null;
          if (!tagId) {
            console.error("Tag not found:", tag);
            return res.status(400).json({
              message: "Tag not found",
              tag,
            });
          }
          console.log("Tag ID found:", tagId);
          tagsId.push(tagId);
        }
        updateData.tags = tagsId;
      }

      const updatedArticle = await Article.findByIdAndUpdate(id, updateData, {
        new: true,
      });
      if (!updatedArticle) {
        return res.status(404).json({
          message: "Article not found",
        });
      }
      res.status(200).json({
        message: "Article updated successfully",
        article: updatedArticle,
      });
    } catch (error) {
      console.error("Error updating article:", error);
      res.status(500).json({
        message: "Failed to update article",
        error: (error as any).message,
      });
    }
  },
  delete: async (
    req: VercelRequest,
    res: VercelResponse,
    id: string | string[]
  ) => {
    try {
      const articleId = id as string;
      const deletedArticle = await Article.findByIdAndDelete(articleId);
      if (!deletedArticle) {
        return res.status(404).json({
          message: "Article not found",
        });
      }
      res.status(200).json({
        message: "Article deleted successfully",
        article: deletedArticle,
      });
    } catch (error) {
      console.error("Error deleting article:", error);
      res.status(500).json({
        message: "Failed to delete article",
        error: (error as any).message,
      });
    }
  },
};
