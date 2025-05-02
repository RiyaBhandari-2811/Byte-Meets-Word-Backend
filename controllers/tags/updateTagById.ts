import { VercelRequest, VercelResponse } from "@vercel/node";
import Tag from "../../models/Tag";
import withAuth from "../../middlewares/AuthenticatedRequest";
import logger from "../../utils/logger";
import connectDB from "../../utils/mongodb";

const updateTagById = async (
  req: VercelRequest,
  res: VercelResponse,
  tagId: string
) => {
  try {
    if (!withAuth(req, res)) {
      logger.debug("Unauthorized access attempt to delete tag.");
      return;
    }

    const { name } = req.body;

    if (!name) {
      logger.debug("No name provided in request body.");
      return res.status(400).json({ message: "Tag name is required" });
    }

    logger.debug(`Attempting to update tag. ID: ${tagId}, New Name: ${name}`);

    logger.debug("Connecting to MongoDB...");
    await connectDB();
    logger.debug("Successfully connected to MongoDB.");

    const updatedTag = await Tag.findByIdAndUpdate(
      tagId,
      { name },
      { new: true }
    );

    if (!updatedTag) {
      logger.debug(`Tag with ID ${tagId} not found.`);
      return res.status(404).json({ message: "Tag not found" });
    }

    logger.debug(
      `Tag updated successfully. Updated Tag: ${JSON.stringify(updatedTag)}`
    );

    return res.status(200).json({
      message: "Tag updated successfully",
      tag: updatedTag,
    });
  } catch (error) {
    logger.error("Error updating tag", { error });
    res.status(400).json({ message: "Failed to update tag" });
  }
};

export default updateTagById;
