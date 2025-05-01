import { VercelRequest, VercelResponse } from "@vercel/node";
import jsonwebtoken, { JwtPayload } from "jsonwebtoken";
import logger from "../utils/logger";
import AppError from "../utils/AppError";

export interface AuthenticatedRequest {
  user?: string | JwtPayload;
}

const withAuth = (
  req: VercelRequest,
  res: VercelResponse
): string | JwtPayload | undefined => {
  const token = req.headers.authorization;

  if (!token) {
    throw new AppError("Unauthorized: No token provided", 401);
  }

  try {
    const decoded = jsonwebtoken.verify(
      token,
      process.env.JWT_SECRET as string
    );
    logger.debug("Token verified successfully");
    return decoded;
  } catch (error) {
    throw new AppError("Unauthorized: Invalid token", 401);
  }
};

export default withAuth;
