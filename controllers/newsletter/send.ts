import { VercelRequest, VercelResponse } from "@vercel/node";
import logger from "../../utils/logger";
import connectDB from "../../utils/mongodb";
import Subscriber from "../../models/Subscriber";
import sendEmail from "../../utils/sendEmail";

const send = async (req: VercelRequest, res: VercelResponse) => {
  logger.debug("Connecting to MongoDB...");
  await connectDB();
  logger.debug("MongoDB connected.");

  const { subject, content } = req.body;
  if (!subject || !content)
    return res.status(400).json({ error: "Subject and content required" });

  const subscribers = await Subscriber.find({ verified: true });
  if (!subscribers.length)
    return res.json({ message: "No verified subscribers found" });

  const sendPromises = subscribers.map((sub) => {
    const unsubLink = `${process.env.BASE_URL}/api/newsletter/unsubscribe?token=${sub.unsubToken}`;
    const html = `
      <div>
        ${content}
        <hr />
        <p style="font-size: 12px; color: gray;">
          <a href="${unsubLink}">Unsubscribe</a> if you no longer wish to receive these emails.
        </p>
      </div>
    `;
    return sendEmail(sub.email, subject, html);
  });

  await Promise.all(sendPromises);

  return res.json({
    message: `Bulk email sent to ${subscribers.length} subscribers`,
  });
};

export default send;
