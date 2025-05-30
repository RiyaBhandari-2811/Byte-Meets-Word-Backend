import mongoose, { Document, Model, Schema } from "mongoose";

interface ICategory extends Document {
  name: string;
  showOnHome: boolean;
  createdAt: Date;
  modifiedAt: Date;
}

const CategorySchema: Schema<ICategory> = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true },
    showOnHome: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  }
);

const Category: Model<ICategory> = mongoose.model<ICategory>(
  "Category",
  CategorySchema
);

export default Category;
