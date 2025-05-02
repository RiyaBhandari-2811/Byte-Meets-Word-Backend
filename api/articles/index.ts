import { VercelRequest, VercelResponse } from "@vercel/node";
import { articlesController } from "../../controllers/articlesController";
import createArticle from "../../controllers/articles/createArticle";
import logger from "../../utils/logger";
import updatedArticleById from "../../controllers/articles/updateArticleById";
import deleteArticleById from "../../controllers/articles/deleteArticleById";
import getAllArticles from "../../controllers/articles/getAllArticles";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { method, query, url } = req;
  const { articleId, categoryId, tagId } = query;

  logger.info(`Incoming request`, {
    method,
    url,
    query,
  });

  switch (method) {
    case "POST":
      logger.debug("Routing to createArticle handler.");
      await createArticle(req, res);
      break;

    case "GET":
      if (articleId) {
        logger.debug(`Routing to get article by ID: ${articleId}`);
        return await articlesController.getById(req, res, articleId);
      } else if (categoryId) {
        logger.debug(`Routing to get articles by Category ID: ${categoryId}`);
        return await articlesController.getByCategory(req, res, categoryId);
      } else if (tagId) {
        logger.debug(`Routing to get articles by Tag ID: ${tagId}`);
        return await articlesController.getByTag(req, res, tagId);
      } else {
        logger.debug("Routing to get all articles.");
        await getAllArticles(req, res);
      }
      break;

    case "PATCH":
      if (articleId) {
        logger.debug(`Routing to update article by ID: ${articleId}`);
        await updatedArticleById(req, res, articleId);
      } else {
        logger.debug("PATCH request missing articleId.");
        res.status(400).json({ message: "Article ID is required for update." });
      }
      break;

    case "DELETE":
      if (articleId) {
        logger.debug(`Routing to delete article by ID: ${articleId}`);
        await deleteArticleById(req, res, articleId);
      } else {
        logger.debug("DELETE request missing articleId.");
        res
          .status(400)
          .json({ message: "Article ID is required for deletion." });
      }
      break;

    default:
      logger.debug(`Unsupported HTTP method: ${method}`);
      res.setHeader("Allow", ["POST", "GET", "PATCH", "DELETE"]);
      res.status(405).end(`Method ${method} Not Allowed`);
  }
}
