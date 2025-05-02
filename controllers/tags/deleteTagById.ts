import { VercelRequest, VercelResponse } from "@vercel/node";
import Tag from "../../models/Tag";
import withAuth from "../../middlewares/AuthenticatedRequest";
import logger from "../../utils/logger";
import connectDB from "../../utils/mongodb";

const deleteTagById = async (
  req: VercelRequest,
  res: VercelResponse,
  tagId: string
) => {
  try {
    if (!withAuth(req, res)) {
      logger.debug("Unauthorized access attempt to delete tag.");
      return;
    }

    if (!tagId) {
      logger.debug("No tagId provided in request.");
      return res.status(400).json({ message: "Tag ID is required" });
    }

    logger.debug(`Attempting to delete tag. ID: ${tagId}`);

    logger.debug("Connecting to MongoDB...");
    await connectDB();
    logger.debug("Successfully connected to MongoDB.");

    const deletedTag = await Tag.findByIdAndDelete(tagId);

    if (!deletedTag) {
      logger.debug(`Tag with ID ${tagId} not found.`);
      return res.status(404).json({ message: "Tag not found" });
    }

    logger.debug(
      `Tag deleted successfully. Deleted Tag: ${JSON.stringify(deletedTag)}`
    );

    return res.status(200).json({
      message: "Tag deleted successfully",
      tag: deletedTag,
    });
  } catch (error) {
    logger.error("Error deleting tag", { error });
    res.status(500).json({ message: "Failed to delete tag" });
  }
};

export default deleteTagById;
