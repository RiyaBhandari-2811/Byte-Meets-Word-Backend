import User from "../../models/User";

export const userController = {
  createUser: async (req: any, res: any) => {
    try {
      const user = req.body;
      const savedUser = await User.create(user);
      res.status(201).json({
        message: "User created successfully",
        user: savedUser,
      });
    } catch (error) {
      res.status(500).json({
        message: "Internal server error",
        error: (error as any).message,
      });
    }
  },
  getUser: async (req: any, res: any) => {
    try {
      const users = await User.find({});
      res.status(200).json(users);
    } catch (error) {
      res.status(500).json({
        message: "Internal server error",
        error: (error as any).message,
      });
    }
  },
};
