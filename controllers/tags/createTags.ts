import { VercelRequest, VercelResponse } from "@vercel/node";
import Tag from "../../models/Tag";
import logger from "../../utils/logger";
import withAuth from "../../middlewares/AuthenticatedRequest";
import connectDB from "../../utils/mongodb";

const createTags = async (req: VercelRequest, res: VercelResponse) => {
  try {
    if (!withAuth(req, res)) {
      logger.debug("Unauthorized access attempt to delete tag.");
      return;
    }

    const { tagsName } = req.body;

    if (
      !tagsName ||
      (typeof tagsName !== "string" && !Array.isArray(tagsName))
    ) {
      res.status(400).json({
        message: "'tagsName' must be a string or an array of strings.",
      });
    }

    const names = Array.isArray(tagsName) ? tagsName : [tagsName];

    if (!names.every((name) => typeof name === "string")) {
      res.status(400).json({ message: "All tag names must be strings." });
    }

    logger.debug(
      `Creating ${names.length > 1 ? "bulk" : "single"} tag(s):`,
      names
    );

    logger.debug("Connecting to MongoDB...");
    await connectDB();
    logger.debug("Successfully connected to MongoDB.");

    const created = await Tag.insertMany(names.map((name) => ({ name })));

    return res.status(201).json({
      message: `Tag${created.length > 1 ? "s" : ""} created successfully`,
      [created.length > 1 ? "tags" : "tag"]:
        created.length > 1 ? created : created[0],
    });
  } catch (error) {
    logger.error("Tag creation failed:", error);
    res.status(500).json({ error: "Failed to create tag" });
  }
};

export default createTags;
