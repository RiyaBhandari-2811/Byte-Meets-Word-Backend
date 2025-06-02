import { VercelRequest, VercelResponse } from "@vercel/node";
import logger from "../../../utils/logger";
import send from "../../../controllers/newsletter/send";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { method, query, url } = req;

  logger.info(`Incoming request`, {
    method,
    url,
    query,
  });

  switch (method) {
    case "POST":
      logger.debug("Routing to send  handler.");
      await send(req, res);
      break;
    default:
      logger.debug(`Unsupported HTTP method: ${method}`);
      res.setHeader("Allow", ["POST", "GET", "PATCH", "DELETE"]);
      res.status(405).end(`Method ${method} Not Allowed`);
  }
}
