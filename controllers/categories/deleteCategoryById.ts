import { VercelRequest, VercelResponse } from "@vercel/node";
import Category from "../../models/Category";
import withAuth from "../../middlewares/AuthenticatedRequest";
import logger from "../../utils/logger";
import connectDB from "../../utils/mongodb";

const deleteCategoryById = async (
  req: VercelRequest,
  res: VercelResponse,
  categoryId: string
) => {
  try {
    if (!withAuth(req, res)) {
      logger.error(`[Category] Unauthorized access attempt to delete category | ID: ${categoryId}`);
      return;
    }

    logger.debug(`[Category] Delete request received | ID: ${categoryId}`);

    await connectDB();
    logger.debug("[Category] Connected to MongoDB");

    const deletedCategory = await Category.findByIdAndDelete(categoryId);

    if (!deletedCategory) {
      logger.error(`[Category] Category not found for deletion | ID: ${categoryId}`);
      return res.status(404).json({ message: "Category not found" });
    }

    logger.info(`[Category] Category deleted successfully | ID: ${categoryId}`);
    return res.status(200).json({
      message: "Category deleted successfully",
      category: deletedCategory,
    });
  } catch (error) {
    logger.error(`[Category] Error deleting category | ID: ${categoryId} | Error: ${(error as Error).message}`, {
      error,
    });
    return res.status(500).json({
      message: "Internal server error",
      error: (error as Error).message,
    });
  }
};

export default deleteCategoryById;
