import { VercelRequest, VercelResponse } from "@vercel/node";
import tagsController from "../../controllers/tags/tagsController";
import connectDB from "../../utils/mongodb";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { method, query } = req;
  const { tagId } = query;

  try {
    await connectDB();

    switch (method) {
      case "PATCH":
        await tagsController.updateTagById(req, res, tagId as string);
        break;
      case "DELETE":
        await tagsController.deleteTagById(req, res, tagId as string);
        break;
      default:
        console.log(`Unsupported method: ${method}`);
        res.status(405).json({ error: "Method not allowed" });
    }
  } catch (error) {
    console.error("Error occurred:", error);
    res.status(500).json({ error: (error as any).message });
  }
}
