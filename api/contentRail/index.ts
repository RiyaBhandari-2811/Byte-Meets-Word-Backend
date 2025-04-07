import { VercelRequest, VercelResponse } from "@vercel/node";
import connectDB from "../../utils/mongodb";
import contentRailController from "../../controllers/contentRail/contentRailController";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { method } = req;

  try {
    await connectDB();
    switch (method) {
      case "GET":
        await contentRailController.getAllRails(req, res);
        break;
    }
  } catch (error) {
    res.status(500).json({ error: (error as any).message });
  }
}
