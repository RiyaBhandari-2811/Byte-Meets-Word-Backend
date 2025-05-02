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

    if (updateData.category) {
      logger.debug(`Resolving category name: ${updateData.Category}`);
      const categoryDoc = await Category.findOne({
        name: updateData.category as string,
      });
      if (!categoryDoc) {
        logger.debug(`Invalid Category name: ${updateData.category}`);
        return res.status(400).json({ message: "Invalid Category name" });
      }
      updateData.category = categoryDoc._id;
      logger.debug(`Resolved Category ID: ${categoryDoc._id}`);
    }

    if (updateData.tags && Array.isArray(updateData.tags)) {
      logger.debug("Resolving tag names to IDs");
      try {
        updateData.tags = await getTagIdsByNames(updateData.tags as string[]);
        logger.debug("Resolved tag IDs", { tagIds: updateData.tags });
      } catch (err) {
        const message = (err as Error).message;
        if (message.startsWith("TagNotFound:")) {
          const missingTag = message.split(":")[1];
          logger.debug(`Tag not found: ${missingTag}`);
          return res.status(400).json({
            message: "Tag not found",
            tag: missingTag,
          });
        }
        logger.error("Error resolving tag names", { error: err });
        throw err;
      }
    }

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
