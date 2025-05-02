import { VercelRequest, VercelResponse } from "@vercel/node";
import Article from "../../models/Article";
import withAuth from "../../middlewares/AuthenticatedRequest";
import logger from "../../utils/logger";
import connectDB from "../../utils/mongodb";

const deleteArticleById = async (
  req: VercelRequest,
  res: VercelResponse,
  id: string | string[]
) => {
  try {
    if (!withAuth(req, res)) {
      logger.debug("Unauthorized access attempt to delete article.");
      return;
    }

    const articleId = id as string;

    logger.debug(`Attempting to delete article. ID: ${articleId}`);

    logger.debug("Connecting to MongoDB...");
    await connectDB();
    logger.debug("Successfully connected to MongoDB.");

    const deletedArticle = await Article.findByIdAndDelete(articleId);

    if (!deletedArticle) {
      logger.debug(`Article with ID ${articleId} not found.`);
      return res.status(404).json({ message: "Article not found" });
    }

    logger.debug("Article deleted successfully.");

    res.status(200).json({
      message: "Article deleted successfully",
      article: deletedArticle,
    });
  } catch (error) {
    logger.error("Error deleting article", { error });
    res.status(500).json({
      message: "Failed to delete article",
      error: (error as Error).message,
    });
  }
};

export default deleteArticleById;
