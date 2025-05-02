import Category from "../../../models/Category";

const getCategoryIdByName = async (name: string): Promise<string | null> => {
  const category = await Category.findOne({ name });
  return category?._id?.toString() ?? null;
};
export default getCategoryIdByName;
