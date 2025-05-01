import { VercelRequest, VercelResponse } from "@vercel/node";
import Tag from "../../models/Tag";
import { IGetTagsResponse } from "../../types/tag";
import { getRedisClient } from "../../utils/redis";
import connectDB from "../../utils/mongodb";
import { CACHE_KEYS, TTL } from "../../constants/redisConstants";
import { getPagination } from "../../utils/getPagination";
import logger from "../../utils/logger";
import AppError from "../../utils/AppError";

const tagsController = {
  createTags: async (req: VercelRequest, res: VercelResponse) => {
    try {
      const { tagsName } = req.body;
      // Bulk create
      if (Array.isArray(tagsName)) {
        console.log("Creating bulk tags");
        const created = await Tag.insertMany(
          tagsName.map((name: string) => ({ name }))
        );
        return res.status(201).json({
          message: "Tags created successfully",
          tags: created,
        });
      }

      // Single create
      if (typeof tagsName === "string") {
        console.log("Creating single tag with data:", tagsName);
        const savedTag = await Tag.create({ name: tagsName });
        return res.status(201).json({
          message: "Tag created successfully",
          tag: savedTag,
        });
      }

      // Invalid format
      return res.status(400).json({
        message:
          "Invalid request format. Provide either 'tagsName' as a string or an array of strings.",
      });
    } catch (error) {
      console.error("Error creating tag:", error);
      res.status(500).json({
        message: "Internal server error",
        error: (error as Error).message,
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
        error: (error as Error).message,
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
      console.error("Error deleting tag:", error);
      res.status(500).json({
        message: "Internal server error",
        error: (error as Error).message,
      });
    }
  },
};

export default tagsController;
