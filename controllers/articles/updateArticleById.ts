import { VercelRequest, VercelResponse } from "@vercel/node";
import Article from "../../models/Article";
import Category from "../../models/Category";
import getTagIdsByNames from "./helpers/getTagIdsByNames";
import withAuth from "../../middlewares/AuthenticatedRequest";
import logger from "../../utils/logger";
import connectDB from "../../utils/mongodb";

const updatedArticleById = async (
  req: VercelRequest,
  res: VercelResponse,
  id: string | string[]
) => {
  try {
    if (!withAuth(req, res)) {
      logger.debug("Unauthorized access attempt to update article.");
      return;
    }

    logger.debug(`Request to update article. ID: ${id}`);
    const updateData: Record<string, unknown> = { ...req.body };
    logger.debug("Update payload received", { updateData });

    logger.debug("Connecting to MongoDB...");
    await connectDB();
    logger.debug("Successfully connected to MongoDB.");

    logger.debug("Updating article in database...");
    const updatedArticle = await Article.findByIdAndUpdate(id, updateData, {
      new: true,
    });

    if (!updatedArticle) {
      logger.debug(`Article not found for ID: ${id}`);
      return res.status(404).json({ message: "Article not found" });
    }

    logger.info("Article updated successfully", {
      articleId: updatedArticle._id.toString(),
    });

    res.status(200).json({
      message: "Article updated successfully",
      article: updatedArticle,
    });
  } catch (error) {
    logger.error("Failed to update article", { error });
    res.status(500).json({
      message: "Failed to update article",
      error: (error as Error).message,
    });
  }
};

export default updatedArticleById;
