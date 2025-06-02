import { VercelRequest, VercelResponse } from "@vercel/node";
import logger from "../../utils/logger";
import connectDB from "../../utils/mongodb";
import Subscriber from "../../models/Subscriber";
import crypto from "crypto";
import sendEmail from "../../utils/sendEmail";

const subscribe = async (req: VercelRequest, res: VercelResponse) => {
  try {
    logger.debug("Connecting to MongoDB...");
    await connectDB();
    logger.debug("MongoDB connected.");

    const { email } = req.body;
    if (!email) {
      logger.warn("Email not provided in request body.");
      return res.status(400).json({ error: "Email is required." });
    }

    logger.info(`Received subscription request for: ${email}`);

    const existing = await Subscriber.findOne({ email });
    if (existing?.verified) {
      logger.info(`Email ${email} is already verified.`);
      return res.json({ message: "Already subscribed" });
    }

    const verifyToken = crypto.randomBytes(32).toString("hex");
    const verifyTokenExpiry = Date.now() + 10 * 60 * 1000; // 10 minutes
    const unsubToken = crypto.randomBytes(32).toString("hex");

    logger.debug(`Upserting subscriber with email: ${email}`);
    await Subscriber.findOneAndUpdate(
      { email },
      {
        email,
        verifyToken,
        verifyTokenExpiry,
        unsubToken,
        verified: false,
      },
      { upsert: true, new: true }
    );

    const link = `${process.env.BASE_URL}/api/newsletter/verify?token=${verifyToken}`;
    const html = `<p>Click <a href="${link}">here</a> to verify your email. Expires in 10 minutes.</p>`;

    await sendEmail(email, "Verify your subscription", html);

    logger.info(`Verification email sent to ${email}`);
    return res.json({ message: "Verification email sent" });
  } catch (error: any) {
    logger.error("Error in subscription handler:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

export default subscribe;
