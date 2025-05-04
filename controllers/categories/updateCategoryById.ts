import { VercelRequest, VercelResponse } from "@vercel/node";
import withAuth from "../../middlewares/AuthenticatedRequest";
import Category from "../../models/Category";
import logger from "../../utils/logger";
import connectDB from "../../utils/mongodb";

const updateCategoryById = async (
  req: VercelRequest,
  res: VercelResponse,
  categoryId: string
) => {
  try {
    if (!withAuth(req, res)) {
      logger.error(
        `[Category] Unauthorized attempt to update category with ID: ${categoryId}`
      );
      return;
    }

    logger.debug(
      `[Category] Update request received | ID: ${categoryId} | Body: ${JSON.stringify(
        req.body
      )}`
    );

    await connectDB();

    logger.debug("[Category] Connected to MongoDB");

    const updatedCategory = await Category.findByIdAndUpdate(
      categoryId,
      { ...req.body },
      { new: true }
    );

    if (!updatedCategory) {
      logger.error(
        `[Category] Category not found for update | ID: ${categoryId}`
      );
      return res.status(404).json({ message: "Category not found" });
    }

    logger.info(`[Category] Category updated successfully | ID: ${categoryId}`);
    return res.status(200).json({
      message: "Category updated successfully",
      category: updatedCategory,
    });
  } catch (error) {
    logger.error(
      `[Category] Error updating category | ID: ${categoryId} | Error: ${
        (error as Error).message
      }`,
      {
        error,
      }
    );
    return res.status(500).json({
      message: "Internal server error",
      error: (error as Error).message,
    });
  }
};

export default updateCategoryById;
