import { VercelRequest, VercelResponse } from "@vercel/node";
import Tag from "../../models/Tag";
import { ITag, IGetTagsResponse } from "../../types/tag";

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

  getAllTags: async (req: VercelRequest, res: VercelResponse) => {
    try {
      const page = req.query.page ? Number(req.query.page) : 0;
      const limit = req.query.limit ? Number(req.query.limit) : 30;

      let tags: ITag[];
      let total: number;
      let totalPages: number;

      if (page > 0) {
        const skip = (page - 1) * limit;

        const [fetchedTags, count] = await Promise.all([
          (
            await Tag.find({}).select("_id name").lean().skip(skip).limit(limit)
          ).map((tag) => ({
            _id: tag._id.toString(),
            name: tag.name,
          })) as ITag[],
          Tag.countDocuments(),
        ]);

        tags = fetchedTags;
        total = count;
        totalPages = Math.ceil(total / limit);
      } else {
        tags = (await Tag.find({}).select("_id name").lean()).map((tag) => ({
          _id: tag._id.toString(),
          name: tag.name,
        })) as ITag[];
        total = tags.length;
        totalPages = 1;
      }

      const response: IGetTagsResponse = {
        tags,
        total,
        page: page || "all",
        totalPages,
      };

      res.status(200).json(response);
    } catch (error) {
      console.error("Error fetching tags:", error);
      res.status(500).json({
        message: "Failed to fetch tags",
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
