import { VercelRequest, VercelResponse } from "@vercel/node";
import unsubscribe from "../../../controllers/newsletter/unsubscribe";
import logger from "../../../utils/logger";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { method, query, url } = req;

  logger.info(`Incoming request`, {
    method,
    url,
    query,
  });

  const { token } = query;

  switch (method) {
    case "GET":
      logger.debug("Handling GET request for unsubscribe.");

      if (!token || typeof token !== "string") {
        logger.error("Missing or invalid unsubscribe token in query.");
        return res
          .status(400)
          .json({ error: "Token is required for unsubscription." });
      }

      await unsubscribe(req, res, token);

      break;
    default:
      logger.debug(`Unsupported HTTP method: ${method}`);
      res.setHeader("Allow", ["POST", "GET", "PATCH", "DELETE"]);
      res.status(405).end(`Method ${method} Not Allowed`);
  }
}
