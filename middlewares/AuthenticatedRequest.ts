import { VercelApiHandler, VercelRequest, VercelResponse } from "@vercel/node";
import jsonwebtoken, { JwtPayload } from "jsonwebtoken";

export interface AuthenticatedRequest {
  user?: string | JwtPayload;
}

export function withAuth(req: VercelRequest, res: VercelResponse) {
  const authHeader: string | undefined = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Unauthorized: No token provided" });
  }

  const token: string = authHeader.split(" ")[1];

  try {
    const decoded: string | JwtPayload = jsonwebtoken.verify(
      token,
      process.env.JWT_SECRET as string
    );

    return decoded && true;
  } catch (error) {
    console.error("Token verification error:", error);
    return res.status(401).json({ message: "Unauthorized: Invalid token" });
  }
}
