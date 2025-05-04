import { VercelRequest, VercelResponse } from "@vercel/node";
import Category from "../../models/Category";
import logger from "../../utils/logger";
import withAuth from "../../middlewares/AuthenticatedRequest";
import connectDB from "../../utils/mongodb";

const createCategories = async (req: VercelRequest, res: VercelResponse) => {
  try {
    if (!withAuth(req, res)) {
      logger.debug("[Category] Unauthorized access attempt.");
      return;
    }

    const  category  = req.body;

    if (!category || (typeof category !== "object" && !Array.isArray(category))) {
      return res.status(400).json({
        message: "'category' must be an object or an array of objects.",
      });
    }

    const categories = Array.isArray(category) ? category : [category];

    if (!categories.every(cat => cat && typeof cat.name === "string")) {
      return res.status(400).json({
        message: "Each category must have a valid 'name' string.",
      });
    }

    logger.debug(`[Category] Creating ${categories.length > 1 ? "bulk" : "single"} category(ies):`, categories);

    logger.debug("[Category] Connecting to MongoDB...");
    await connectDB();
    logger.debug("[Category] Connected to MongoDB.");

    const created = await Category.insertMany(categories);

    return res.status(201).json({
      message: `Category${created.length > 1 ? "ies" : ""} created successfully.`,
      [created.length > 1 ? "categories" : "category"]: created.length > 1 ? created : created[0],
    });

  } catch (error) {
    logger.error("[Category] Creation failed:", error);
    res.status(500).json({
      message: "Failed to create category.",
      error: (error as Error).message,
    });
  }
};

export default createCategories;
