import { VercelRequest, VercelResponse } from "@vercel/node";
import getAllRails from "../../controllers/contentRail/getAllRails";
import logger from "../../utils/logger";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { method, url } = req;
  const logPrefix = "[ContentRail Handler]";

  logger.info(`${logPrefix} Incoming ${method} request: ${url}`);

  try {
    switch (method) {
      case "GET":
        logger.info(`${logPrefix} Handling GET request`);
        await getAllRails(req, res);
        break;
      default:
        logger.warn(`${logPrefix} Method ${method} not allowed`);
        res.setHeader("Allow", ["GET"]);
        res.status(405).end(`Method ${method} Not Allowed`);
    }
  } catch (error) {
    logger.error(`${logPrefix} Unexpected error: ${error}`);
    res.status(500).json({ error: (error as any).message });
  }
}
