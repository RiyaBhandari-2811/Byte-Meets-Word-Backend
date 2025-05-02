import { VercelRequest, VercelResponse } from "@vercel/node";
import Article from "../../models/Article";
import { IArticleDetail } from "../../types/article";
import getCategoryIdByName from "./helpers/getCategoryIdByName";
import getTagIdsByNames from "./helpers/getTagIdsByNames";
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
    
    logger.debug(`Resolving category name: ${payload.category}`);
    const categoryId: string | null = await getCategoryIdByName(
      payload.category as string
    );
    logger.debug(`Resolved Category ID: ${categoryId}`);

    if (!categoryId) {
      logger.debug(`Category not found: ${payload.category}`);
      return res.status(400).json({ message: "Category not found" });
    }

    let tagsId: string[];
    try {
      tagsId = await getTagIdsByNames(payload.tags);
      logger.debug(`Resolved tag IDs: ${JSON.stringify(tagsId)}`);
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
      logger.error("Unexpected error while resolving tags", { error: err });
      throw err;
    }

    const savedArticle = await Article.create({
      ...payload,
      category: categoryId,
      tags: tagsId,
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
