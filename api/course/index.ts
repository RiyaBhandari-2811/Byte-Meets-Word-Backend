import { VercelRequest, VercelResponse } from "@vercel/node";
import connectDB from "../../utils/mongodb";
import courseController from "../../controllers/course/courseController";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { method } = req;

  try {
    await connectDB();
    switch (method) {
      case "POST":
        await courseController.createCourse(req, res);
        break;
      case "GET":
        await courseController.getAllCourses(req, res);
        break;
    }
  } catch (error) {
    res.status(500).json({ error: (error as any).message });
  }
}
