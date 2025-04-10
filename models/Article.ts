import mongoose, { Document, Schema, Model } from "mongoose";
import { IArticleDetail } from "../types/article";

const ArticleSchema: Schema<IArticleDetail> = new Schema(
  {
    title: { type: String, required: true },
    subtitle: { type: String },
    description: { type: String, required: true },
    featureImage: { type: String, required: true },
    mainContent: { type: String, required: true },
    readTime: { type: Number, required: true },
    category: { type: Schema.Types.ObjectId, ref: "Category", default: null },
    tags: [{ type: mongoose.Schema.Types.ObjectId, ref: "Tag" }],
    isActive: { type: Boolean, default: true },
  },
  {
    timestamps: true,
  }
);

const Article: Model<IArticleDetail> = mongoose.model<IArticleDetail>(
  "Article",
  ArticleSchema
);
export default Article;
