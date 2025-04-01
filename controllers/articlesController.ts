import { VercelRequest, VercelResponse } from "@vercel/node";
import Article from "../models/Article";

export const articlesController = {
  create: async (req: VercelRequest, res: VercelResponse) => {
    try {
      console.log("Creating article with data:", req.body);

      const savedArticle = await Article.create(req.body);

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
    // Implementation for getting an article by ID
  },
  getByCategory: async (
    req: VercelRequest,
    res: VercelResponse,
    categoryId: string | string[]
  ) => {
    // Implementation for getting articles by category
  },
  getByTag: async (
    req: VercelRequest,
    res: VercelResponse,
    tagId: string | string[]
  ) => {
    // Implementation for getting articles by tag
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
    // Implementation for updating an article
  },
  softDelete: async (
    req: VercelRequest,
    res: VercelResponse,
    id: string | string[]
  ) => {
    // Implementation for soft-deleting an article
  },
};
