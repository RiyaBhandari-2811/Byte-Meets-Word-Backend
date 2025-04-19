import { VercelRequest, VercelResponse } from "@vercel/node";
import connectDB from "../../utils/mongodb";
import courseController from "../../controllers/course/courseController";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { method, query } = req;
  const { courseId } = query;

  try {
    await connectDB();
    switch (method) {
      case "POST":
        await courseController.createCourse(req, res);
        break;
      case "GET":
        await courseController.getAllCourses(req, res);
        break;
      case "PATCH":
        await courseController.updateCourseById(req, res, courseId as string);
        break;
      case "DELETE":
        await courseController.deleteCourseById(req, res, courseId as string);
        break;
    }
  } catch (error) {
    res.status(500).json({ error: (error as any).message });
  }
}
