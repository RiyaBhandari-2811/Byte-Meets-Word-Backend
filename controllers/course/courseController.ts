import Course from "../../models/Course";
import { ICourse } from "../../types/course";

const courseController = {
  createCourse: async (req: any, res: any) => {
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
};

export default courseController;
