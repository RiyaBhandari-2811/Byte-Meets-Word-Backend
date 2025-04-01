import { VercelRequest, VercelResponse } from "@vercel/node";
import Tag from "../../models/Tag";

const tagsController = {
  createTags: async (req: VercelRequest, res: VercelResponse) => {
    try {
      const { tagsName } = req.body;

      // Handle bulk insert (array of strings)
      if (Array.isArray(tagsName)) {
        console.log("Creating bulk tags with data:", tagsName);
        for (const name of tagsName) {
          await Tag.create({ name });
        }
        return res
          .status(201)
          .json({ message: "Tags created successfully", tags: tagsName });
      }

      // Handle single insert (single string)
      else if (typeof tagsName === "string") {
        console.log("Creating single tag with data:", tagsName);
        const savedTag = await Tag.create({ name: tagsName });
        return res
          .status(201)
          .json({ message: "Tag created successfully", tag: tagsName });
      }

      // Invalid request body format
      else {
        return res.status(400).json({
          message:
            "Invalid request format. Provide either 'name' (string) or 'tagNames' (array of strings).",
        });
      }
    } catch (error) {
      console.error("Error creating tag:", error);
      res.status(500).json({
        message: "Internal server error",
        error: (error as any).message,
      });
    }
  },
  getAllTags: async (req: VercelRequest, res: VercelResponse) => {
    try {
      console.log("Fetching all tags...");
      const tags = await Tag.find({});
      console.log("Fetched tags successfully");
      res.status(200).json(tags);
    } catch (error) {
      console.error("Error fetching tags:", error);
      res.status(500).json({
        message: "Internal server error",
        error: (error as any).message,
      });
    }
  },
  updateTagById: async (
    req: VercelRequest,
    res: VercelResponse,
    tagId: string
  ) => {
    try {
      const { tagName } = req.body;
      console.log("Updating tag with ID:", tagId, "to name:", tagName);
      const updatedTag = await Tag.findByIdAndUpdate(
        tagId,
        { name: tagName },
        { new: true }
      );
      if (!updatedTag) {
        return res.status(404).json({ message: "Tag not found" });
      }
      res.status(200).json({
        message: "Tag updated successfully",
        tag: updatedTag,
      });
    } catch (error) {
      console.error("Error updating tag:", error);
      res.status(500).json({
        message: "Internal server error",
        error: (error as any).message,
      });
    }
  },
  deleteTagById: async (
    req: VercelRequest,
    res: VercelResponse,
    tagId: string
  ) => {
    try {
      console.log("Deleting tag with ID:", tagId);
      const deletedTag = await Tag.findByIdAndDelete(tagId);
      if (!deletedTag) {
        return res.status(404).json({ message: "Tag not found" });
      }
      res.status(200).json({
        message: "Tag deleted successfully",
        tag: deletedTag,
      });
    } catch (error) {
      console.error("Error updating tag:", error);
      res.status(500).json({
        message: "Internal server error",
        error: (error as any).message,
      });
    }
  },
};
export default tagsController;
