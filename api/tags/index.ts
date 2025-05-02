import { VercelRequest, VercelResponse } from "@vercel/node";
import getAllTags from "../../controllers/tags/getAllTags";
import createTags from "../../controllers/tags/createTags";
import deleteTagById from "../../controllers/tags/deleteTagById";
import updateTagById from "../../controllers/tags/updateTagById";
import logger from "../../utils/logger";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { method, query } = req;
  const { tagId } = query;

  logger.debug("Incoming request", {
    method,
    url: req.url,
    tagId,
    query,
  });

  switch (method) {
    case "POST":
      logger.debug("Handling POST /tags");
      await createTags(req, res);
      break;
    case "GET":
      logger.debug("Handling GET /tags");
      await getAllTags(req, res);
      break;
    case "PATCH":
      logger.debug("Handling PATCH /tags", { tagId });
      await updateTagById(req, res, tagId as string);
      break;
    case "DELETE":
      logger.debug("Handling DELETE /tags", { tagId });
      await deleteTagById(req, res, tagId as string);
      break;
    default:
      logger.debug(`Unsupported HTTP method: ${method}`);
      res.setHeader("Allow", ["POST", "GET", "PATCH", "DELETE"]);
      res.status(405).end(`Method ${method} Not Allowed`);
  }
}
