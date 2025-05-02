import { VercelRequest, VercelResponse } from "@vercel/node";
import jsonwebtoken, { JwtPayload } from "jsonwebtoken";
import logger from "../utils/logger";

export interface AuthenticatedRequest {
  user?: string | JwtPayload;
}

const withAuth = (
  req: VercelRequest,
  res: VercelResponse
): string | JwtPayload | undefined => {
  const token = req.headers.authorization;

  logger.debug("Authenticating request...");

  if (!token) {
    logger.debug("Authorization header missing or empty");
    res.status(401).json({ message: "Unauthorized: No token provided" });
    return;
  }

  try {
    const decoded = jsonwebtoken.verify(
      token as string,
      process.env.JWT_SECRET as string
    );
    logger.debug("Token verified successfully", { decoded });
    return decoded;
  } catch (error) {
    logger.debug("Token verification failed", { error });
    res.status(401).json({ message: "Unauthorized: Invalid token" });
    return;
  }
};

export default withAuth;
