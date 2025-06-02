import { VercelRequest, VercelResponse } from "@vercel/node";
import logger from "../../../utils/logger";
import verifySubscriber from "../../../controllers/newsletter/verifySubscriber";

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
      logger.debug("Routing to Verify handler.");
      if (token) {
        await verifySubscriber(req, res, token as string);
      }
      break;
    default:
      logger.debug(`Unsupported HTTP method: ${method}`);
      res.setHeader("Allow", ["POST", "GET", "PATCH", "DELETE"]);
      res.status(405).end(`Method ${method} Not Allowed`);
  }
}
