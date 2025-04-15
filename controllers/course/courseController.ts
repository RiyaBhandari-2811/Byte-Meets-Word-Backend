import { VercelRequest, VercelResponse } from "@vercel/node";
import Course from "../../models/Course";
import { ICourse } from "../../types/course";

const courseController = {
  createCourse: async (req: VercelRequest, res: VercelResponse) => {
    try {
      const course: ICourse = req.body;
      const savedCourse = await Course.create(course);
      res.status(201).json({
        message: "Course created successfully",
        course: savedCourse,
      });
    } catch (error) {
      res.status(500).json({
        message: "Internal server error",
        error: (error as any).message,
      });
    }
  },
  getAllCourses: async (req: VercelRequest, res: VercelResponse) => {
    const page: number = req.query.page ? Number(req.query.page) : 0;
    const limit: number = req.query.limit ? Number(req.query.limit) : 6;

    let courses: ICourse[];
    let total: number;
    let totalPages: number;

    if (page > 0) {
      const skip: number = (page - 1) * limit;
      [courses, total] = await Promise.all([
        Course.find({}).lean().skip(skip).limit(limit),
        Course.countDocuments(),
      ]);
      totalPages = Math.ceil(total / limit);
    } else {
      courses = await Course.find({}).lean();
      total = courses.length;
      totalPages = 1;
    }

    res.status(200).json({
      name: "Courses",
      courses,
      total,
      page: page || "all",
      totalPages,
    });
  },
  updateCourseById: async (
    req: VercelRequest,
    res: VercelResponse,
    courseId: string
  ) => {
    try {
      const course = req.body;
      const updatedCourse = await Course.findByIdAndUpdate(courseId, course, {
        new: true,
      });
      res.status(200).json({
        message: "Course updated successfully",
        course: updatedCourse,
      });
    } catch (error) {
      res.status(500).json({
        message: "Internal server error",
        error: (error as any).message,
      });
    }
  },
  deleteCourseById: async (
    req: VercelRequest,
    res: VercelResponse,
    courseId: string
  ) => {
    try {
      const deletedCourse = await Course.findByIdAndDelete(courseId);
      res.status(200).json({
        message: "Course deleted successfully",
        course: deletedCourse,
      });
    } catch (error) {
      res.status(500).json({
        message: "Internal server error",
        error: (error as any).message,
      });
    }
  },
};

export default courseController;
