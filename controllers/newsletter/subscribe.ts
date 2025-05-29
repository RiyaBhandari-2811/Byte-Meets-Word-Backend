import { VercelRequest, VercelResponse } from "@vercel/node";
import logger from "../../utils/logger";
import connectDB from "../../utils/mongodb";
import nodemailer from 'nodemailer';

const transport = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: Number(process.env.EMAIL_PORT),
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
})

const subscribe = async (req: VercelRequest, res: VercelResponse) => {
  logger.debug("Connecting to MongoDB...");
  await connectDB();
  logger.debug("Successfully connected to MongoDB.");
};

export default subscribe;
