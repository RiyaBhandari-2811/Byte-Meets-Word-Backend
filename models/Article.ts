import mongoose, { Schema, Model } from "mongoose";
import { IArticleDetail } from "../types/article";

const CategorySchema = new Schema(
  {
    _id: { type: Schema.Types.ObjectId, required: true },
    name: { type: String, required: true },
    showOnHome: { type: Boolean, required: true },
  },
  { _id: false }
);

const TagSchema = new Schema(
  {
    _id: { type: Schema.Types.ObjectId, required: true },
    name: { type: String, required: true },
  },
  { _id: false }
);

const ArticleSchema: Schema<IArticleDetail> = new Schema(
  {
    title: { type: String, required: true },
    subtitle: { type: String },
    description: { type: String, required: true },
    featureImage: { type: String, required: true },
    mainContent: { type: String, required: true },
    readTime: { type: Number, required: true },

    category: { type: CategorySchema, required: true },
    tags: { type: [TagSchema], required: true },

    isActive: { type: Boolean, default: true },
  },
  {
    timestamps: true,
  }
);

const Article: Model<IArticleDetail> =
  mongoose.models.Article ||
  mongoose.model<IArticleDetail>("Article", ArticleSchema);

export default Article;
