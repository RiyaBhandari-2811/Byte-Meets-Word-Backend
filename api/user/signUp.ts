import { VercelRequest, VercelResponse } from "@vercel/node";
import connectDB from "../../utils/mongodb";
import { userController } from "../../controllers/user/userController";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { method } = req;

  try {
    await connectDB();
    switch (method) {
      case "POST":
        await userController.signUpUser(req, res);
        break;
    }
  } catch (error) {
    res.status(500).json({ error: (error as any).message });
  }
}
