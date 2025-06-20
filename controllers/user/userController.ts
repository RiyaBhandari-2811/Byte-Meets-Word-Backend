import { VercelRequest, VercelResponse } from "@vercel/node";
import User from "../../models/User";
import { IUser } from "../../types/user";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import logger from "../../utils/logger";

export const userController = {
  signUpUser: async (req: VercelRequest, res: VercelResponse) => {
    try {
      const user: IUser = req.body;

      logger.info(`Creating user with data: ${user}`);

      if (user.role !== "admin") {
        logger.info("Access denied");
        return res.status(403).json({ message: "Access denied." });
      }

      await User.create(user);
      res.status(201).json({
        message: "User created successfully",
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

      logger.info("Signing in user with email:", email);

      const user: IUser | null = await User.findOne({ email });

      if (!user) {
        logger.info("Invalid email or password");
        return res.status(401).json({
          message: "Invalid email or password",
        });
      }

      if (user.role !== "admin") {
        return res.status(403).json({ message: "Access denied." });
      }

      const isMatch: boolean = await bcrypt.compare(password, user.password);

      if (isMatch) {
        const payload = user._id;
        const JWT_SECRET: string | undefined = process.env.JWT_SECRET;
        const token = jwt.sign({ payload }, JWT_SECRET as string, {
          expiresIn: "1Day",
        });

        // Decode the token to extract the `exp` field
        const decoded = jwt.decode(token) as jwt.JwtPayload;
        const exp = decoded.exp; // UNIX timestamp (in seconds)

        return res.status(200).json({
          token,
          exp,
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
