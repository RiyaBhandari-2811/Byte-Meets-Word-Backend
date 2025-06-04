import { VercelRequest, VercelResponse } from "@vercel/node";
import subscribe from "../../../controllers/newsletter/subscribe";
import logger from "../../../utils/logger";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { method, query, url } = req;

  logger.info(`Incoming request`, {
    method,
    url,
    query,
  });

  switch (method) {
    case "POST":
      logger.debug("Routing to subscribe handler.");
      await subscribe(req, res);
      break;
    case "OPTIONS":
      return res.status(200).end();
    default:
      logger.debug(`Unsupported HTTP method: ${method}`);
      res.setHeader("Allow", ["POST", "GET", "PATCH", "DELETE"]);
      res.status(405).end(`Method ${method} Not Allowed`);
  }
}
