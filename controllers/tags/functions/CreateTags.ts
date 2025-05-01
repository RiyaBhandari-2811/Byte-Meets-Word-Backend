import { VercelRequest, VercelResponse } from "@vercel/node";
import AppError from "../../../utils/AppError";
import Tag from "../../../models/Tag";
import logger from "../../../utils/logger";
import withAuth from "../../../middlewares/AuthenticatedRequest";
import connectDB from "../../../utils/mongodb";

const createTags = async (req: VercelRequest, res: VercelResponse) => {
  try {
    if (!withAuth(req, res)) return;

    const { tagsName } = req.body;

    if (
      !tagsName ||
      (typeof tagsName !== "string" && !Array.isArray(tagsName))
    ) {
      throw new AppError(
        "'tagsName' must be a string or an array of strings.",
        400
      );
    }

    const names = Array.isArray(tagsName) ? tagsName : [tagsName];

    if (!names.every((name) => typeof name === "string")) {
      throw new AppError("All tag names must be strings.", 400);
    }

    logger.debug(
      `Creating ${names.length > 1 ? "bulk" : "single"} tag(s):`,
      names
    );

    await connectDB();

    const created = await Tag.insertMany(names.map((name) => ({ name })));

    return res.status(201).json({
      message: `Tag${created.length > 1 ? "s" : ""} created successfully`,
      [created.length > 1 ? "tags" : "tag"]:
        created.length > 1 ? created : created[0],
    });
  } catch (error) {
    logger.error("Tag creation failed:", error);
    throw new AppError("Failed to create tag", 500);
  }
};

export default createTags;
