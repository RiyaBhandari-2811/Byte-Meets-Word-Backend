import { VercelRequest, VercelResponse } from "@vercel/node";
import { userController } from "../../controllers/user/userController";
import connectDB from "../../utils/mongodb";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { method } = req;
  try {
    await connectDB();
    switch (method) {
      case "OPTIONS":
        return res.status(200).end();
      case "POST":
        await userController.signInUser(req, res);
        break;
      case "GET":
        break;
    }
  } catch (error) {
    res.status(500).json({ error: (error as any).message });
  }
}
