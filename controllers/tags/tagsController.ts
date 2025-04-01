import { VercelRequest, VercelResponse } from "@vercel/node";
import Tag from "../../models/Tag";

const tagsController = {
  create: async (req: VercelRequest, res: VercelResponse) => {
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
          .json({ message: "Tags added successfully", tagsName });
      }

      // Handle single insert (single string)
      else if (typeof tagsName === "string") {
        console.log("Creating single tag with data:", tagsName);
        const savedTag = await Tag.create({ name: tagsName });
        return res
          .status(201)
          .json({ message: "Tag created successfully", tag: savedTag });
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
  getAll: async (req: VercelRequest, res: VercelResponse) => {
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
};
export default tagsController;
