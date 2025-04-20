import { VercelRequest, VercelResponse } from "@vercel/node";
import connectDB from "../../utils/mongodb";
import { userController } from "../../controllers/user/userController";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { method } = req;
  console.log("Request method:", method);

  try {
    await connectDB();
    switch (method) {
      case "OPTIONS":
        return res.status(200).end();
      case "POST":
        console.log("Handling POST request");
        await userController.signUpUser(req, res);
        break;
    }
  } catch (error) {
    res.status(500).json({ error: (error as any).message });
  }
}
