import { VercelRequest, VercelResponse } from "@vercel/node";
import { articlesController } from "../../controllers/articlesController";
import connectDB from "../../utils/mongodb";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { method, query } = req;

  try {
    await connectDB();
    switch (method) {
      case "POST":
        await articlesController.create(req, res);
        break;
      case "GET":
        await articlesController.getAll(req, res);
        break;
    }
  } catch (error) {
    res.status(500).json({ error: (error as any).message });
  }
}
