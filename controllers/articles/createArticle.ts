import { VercelRequest, VercelResponse } from "@vercel/node";
import Article from "../../models/Article";
import { IArticleDetail } from "../../types/article";
import withAuth from "../../middlewares/AuthenticatedRequest";
import logger from "../../utils/logger";
import connectDB from "../../utils/mongodb";

const createArticle = async (req: VercelRequest, res: VercelResponse) => {
  try {
    if (!withAuth(req, res)) {
      logger.debug("Unauthorized access attempt to create article.");
      return;
    }

    logger.debug("Connecting to MongoDB...");
    await connectDB();
    logger.debug("Successfully connected to MongoDB.");

    const payload = req.body as IArticleDetail;
    logger.debug("Received article payload", { payload });

    const savedArticle = await Article.create({
      ...payload,
    });

    logger.info("Article created successfully", {
      articleId: savedArticle._id.toString(),
    });

    res.status(201).json({
      message: "Article created successfully",
      article: savedArticle,
    });
  } catch (error) {
    logger.error("Error creating article", { error });
    res.status(500).json({
      message: "Internal server error",
      error: (error as Error).message,
    });
  }
};

export default createArticle;
