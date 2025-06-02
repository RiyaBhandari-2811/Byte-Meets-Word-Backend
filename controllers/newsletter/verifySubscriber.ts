import { VercelRequest, VercelResponse } from "@vercel/node";
import logger from "../../utils/logger";
import connectDB from "../../utils/mongodb";
import Subscriber from "../../models/Subscriber";

const verifySubscriber = async (
  req: VercelRequest,
  res: VercelResponse,
  verificationToken: string
) => {
  try {
    logger.debug("Connecting to MongoDB...");
    await connectDB();
    logger.debug("MongoDB connected.");

    logger.info(`Verifying subscriber with token: ${verificationToken}`);

    const user = await Subscriber.findOne({
      verifyToken: verificationToken,
      verifyTokenExpiry: { $gt: Date.now() },
    });

    if (!user) {
      logger.warn("Invalid or expired verification token.");
      return res.status(400).json({ error: "Invalid or expired token" });
    }

    user.verified = true;
    user.verifyToken = null;
    user.verifyTokenExpiry = null;

    await user.save();
    logger.info(`Subscriber ${user.email} verified successfully.`);

    const html = `
      <html>
        <head><title>Thank You</title></head>
        <body>
          <h1>Thank you for verifying your email!</h1>
          <p>You are now subscribed to our newsletter.</p>
        </body>
      </html>
    `;

    return res.setHeader("Content-Type", "text/html").status(200).send(html);
  } catch (error: any) {
    logger.error("Error verifying subscriber:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

export default verifySubscriber;
