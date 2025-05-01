import { VercelRequest } from "@vercel/node";
import { PAGINATION } from "../constants/paginationConstants";

export const getPagination = (req: VercelRequest, forTag: boolean = false) => {
  const page: number = req.query.page
    ? Number(req.query.page as string)
    : PAGINATION.PAGE;
  const limit: number = req.query.limit
    ? Number(req.query.limit as string)
    : forTag
    ? PAGINATION.LIMIT
    : PAGINATION.TAG_LIMIT;
  const skip: number = page ? (page - 1) * limit : 0;
  return { page, limit, skip };
};
