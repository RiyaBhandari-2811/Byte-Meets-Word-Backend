import mongoose, { Schema, Model } from "mongoose";
import { ICourse } from "../types/course";

const CourseSchema: Schema<ICourse> = new Schema(
  {
    title: { type: String, required: true },
    featureImage: { type: String, required: true },
    description: { type: String, required: true },
    duration: { type: String, required: true },
    youtubeLink: { type: String, required: true },
  },
  {
    timestamps: true,
  }
);

const Course: Model<ICourse> = mongoose.model<ICourse>("Course", CourseSchema);

export default Course;
