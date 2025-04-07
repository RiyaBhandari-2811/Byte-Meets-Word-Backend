import Article from "../../models/Article";
import Category from "../../models/Category";

const contentRailController = {
  getAllRails: async (req: any, res: any) => {
    try {
      const categories: any = await Category.find({ showOnHome: true })
        .select("_id name")
        .lean();

      const result = [];

      for (const category of categories) {
        const [articles, total] = await Promise.all([
          Article.find({ category: category._id })
            .select("_id title summary featureImage readTime createdAt")
            .lean()
            .limit(3),
          Article.countDocuments({ category: category._id }),
        ]);

        result.push({
          _id: category._id,
          name: category.name,
          articles: articles,
          showViewAll: total > 3,
        });
      }

      res.status(200).json(result);
    } catch (error) {
      console.error("Error fetching content rails:", error);
      res.status(500).json({
        message: "Internal server error",
        error: (error as any).message,
      });
    }
  },
};

export default contentRailController;
