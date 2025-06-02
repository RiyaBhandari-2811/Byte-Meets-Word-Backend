import { VercelRequest, VercelResponse } from "@vercel/node";
import logger from "../../utils/logger";
import connectDB from "../../utils/mongodb";
import Subscriber from "../../models/Subscriber";

const unsubscribe = async (
  req: VercelRequest,
  res: VercelResponse,
  unsubToken: string
) => {
  try {
    logger.debug("Connecting to MongoDB...");
    await connectDB();
    logger.debug("MongoDB connected.");

    if (!unsubToken) {
      logger.warn("Unsubscribe token missing from request.");
      return res.status(400).json({ error: "Token missing" });
    }

    const user = await Subscriber.findOne({ unsubToken });
    if (!user) {
      logger.warn("Invalid unsubscribe token provided.");
      return res.status(400).json({ error: "Invalid token" });
    }

    await user.deleteOne();
    logger.info(`Successfully unsubscribed: ${user.email}`);

    const html = `
      <html>
        <head><title>Unsubscribed</title></head>
        <body>
          <h1>You have been unsubscribed</h1>
          <p>We're sorry to see you go. You will no longer receive our newsletter.</p>
        </body>
      </html>
    `;

    return res.setHeader("Content-Type", "text/html").status(200).send(html);
  } catch (error: any) {
    logger.error("Error during unsubscribe process:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

export default unsubscribe;
