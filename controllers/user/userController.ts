import { VercelRequest, VercelResponse } from "@vercel/node";
import User from "../../models/User";
import { IUser } from "../../types/user";
import bcrypt from "bcrypt";

export const userController = {
  signUpUser: async (req: VercelRequest, res: VercelResponse) => {
    try {
      const user = req.body;
      const savedUser = await User.create(user);
      res.status(201).json({
        user: savedUser,
      });
    } catch (error) {
      res.status(500).json({
        message: "Internal server error",
        error: (error as any).message,
      });
    }
  },
  signInUser: async (req: VercelRequest, res: VercelResponse) => {
    try {
      const { email, password } = req.body;

      const user: IUser | null = await User.findOne({ email });

      if (!user) {
        return res.status(401).json({
          message: "Invalid email or password",
        });
      }

      if (user.role !== "admin") {
        return res.status(403).json({ message: "Access denied." });
      }

      const isMatch: boolean = await bcrypt.compare(password, user.password);

      if (isMatch) {
        return res.status(200).json({
          message: "User signed in successfully",
          user,
        });
      } else {
        return res.status(401).json({
          message: "Invalid email or password",
        });
      }
    } catch (error) {
      res.status(500).json({
        message: "Internal server error",
        error: (error as any).message,
      });
    }
  },
};
