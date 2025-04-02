import { VercelRequest, VercelResponse } from "@vercel/node";
import Category from "../../models/Category";

const categoriesController = {
  createCategories: async (req: VercelRequest, res: VercelResponse) => {
    try {
      const category = req.body;

      // Handle bulk insert (array of strings)
      if (Array.isArray(category)) {
        for (const { name, isActive } of category) {
          console.log("Creating bulk categories with data:", name);
          await Category.create({ name, isActive });
        }
        return res.status(201).json({
          message: "Category created successfully",
          category: category,
        });
      }

      // Handle single insert (single string)
      else if (typeof category === "object") {
        console.log("Creating single category with data:", category);
        const savedCategory = await Category.create({
          name: category.name,
          isActive: category.isActive,
        });
        return res.status(201).json({
          message: "Category created successfully",
          category: savedCategory,
        });
      } else {
        return res.status(400).json({
          message:
            "Invalid request format. Provide either 'name' (string) or 'categoryNames' (array of strings).",
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
  getAllCategories: async (req: VercelRequest, res: VercelResponse) => {
    try {
      console.log("Fetching all categories...");
      const categories = await Category.find({});
      console.log("Fetched categories successfully");
      res.status(200).json(categories);
    } catch (error) {
      console.error("Error fetching categories:", error);
      res.status(500).json({
        message: "Internal server error",
        error: (error as any).message,
      });
    }
  },
  updateCategoryById: async (
    req: VercelRequest,
    res: VercelResponse,
    categoryId: string
  ) => {
    try {
      const category = req.body;
      console.log("body: ", req.body);
      console.log("Updating category with ID:", categoryId);

      const updatedCategory = await Category.findByIdAndUpdate(
        categoryId,
        { name: category.name, isActive: category.isActive },
        { new: true }
      );
      if (!updatedCategory) {
        return res.status(404).json({
          message: "Category not found",
        });
      }
      res.status(200).json({
        message: "Category updated successfully",
        category: updatedCategory,
      });
    } catch (error) {
      console.error("Error updating tag:", error);
      res.status(500).json({
        message: "Internal server error",
        error: (error as any).message,
      });
    }
  },
  deleteCategoryById: async (
    req: VercelRequest,
    res: VercelResponse,
    categoryId: string
  ) => {
    try {
      console.log("Deleting category with ID:", categoryId);
      const deletedCategory = await Category.findByIdAndDelete(categoryId);
      if (!deletedCategory) {
        return res.status(404).json({ message: "Category not found" });
      }
      res.status(200).json({
        message: "Category deleted successfully",
        category: deletedCategory,
      });
    } catch (error) {
      console.error("Error deleting category:", error);
      res.status(500).json({
        message: "Internal server error",
        error: (error as any).message,
      });
    }
  },
};

export default categoriesController;
