import { VercelRequest, VercelResponse } from "@vercel/node";
import Article, { IArticle } from "../models/Article";
import Category from "../models/Category";
import Tag from "../models/Tag";

export const articlesController = {
  create: async (req: VercelRequest, res: VercelResponse) => {
    try {
      console.log("Creating article with data:", req.body);
      const payload: IArticle = req.body as IArticle;

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
      res.status(200).json({
        message: "Article fetched successfully",
        article,
      });
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
      const articles = await Article.find({ category: categoryId })
        .select("_id title summary featureImage readTime createdAt")
        .lean(); // Use .lean() for better performance if you don't need Mongoose documents

      // Transform the _id field to id
      const formattedArticles = articles.map((article) => ({
        id: article._id,
        title: article.title,
        summary: article.summary,
        featureImage: article.featureImage,
        readTime: article.readTime || null, // Ensure readTime is included, even if null
        createdAt: article.createdAt,
      }));

      res.json({
        message: "Articles fetched successfully",
        articles: formattedArticles,
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
      const tagName = await Tag.findById(tagId).select("name");
      const articles = await Article.find({ tags: tagId })
        .select("_id title summary featureImage readTime createdAt")
        .lean(); // Use .lean() for better performance if you don't need Mongoose documents

      // Transform the _id field to id
      const formattedArticles = articles.map((article) => ({
        id: article._id,
        title: article.title,
        summary: article.summary,
        featureImage: article.featureImage,
        readTime: article.readTime || null, // Ensure readTime is included, even if null
        createdAt: article.createdAt,
      }));

      res.json({
        message: "Articles fetched successfully",
        tagName: tagName?.name,
        articles: formattedArticles,
      });
    } catch (error) {
      console.error("Error fetching articles by category:", error);
      res.status(500).json({
        message: "Failed to fetch articles",
        error: (error as any).message,
      });
    }
  },
  getAll: async (req: VercelRequest, res: VercelResponse) => {
    try {
      const articles = await Article.find({});
      res.status(200).json({
        message: "All articles fetched successfully",
        articles,
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
