import mongoose, { Document, Schema, Model } from "mongoose";

export interface IArticle extends Document {
  title: string;
  summary: string;
  featureImage: string;
  mainContent: string;
  readTime: number;
  category?: mongoose.Types.ObjectId | null;
  tags: string[];
  isActive: boolean;
  createdAt: Date;
  modifiedAt: Date;
}

const ArticleSchema: Schema<IArticle> = new Schema(
  {
    title: { type: String, required: true },
    summary: { type: String, required: true },
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

const Article: Model<IArticle> = mongoose.model<IArticle>(
  "Article",
  ArticleSchema
);
export default Article;
