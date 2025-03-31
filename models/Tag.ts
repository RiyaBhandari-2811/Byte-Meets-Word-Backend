import mongoose, { Document, Model, Schema } from "mongoose";

interface ITag extends Document {
  name: string;
  createdAt: Date;
  modifiedAt: Date;
}

const TagSchema: Schema<ITag> = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true },
  },
  {
    timestamps: true,
  }
);

const Tag: Model<ITag> = mongoose.model("Tag", TagSchema);
