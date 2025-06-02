import logger from "./logger";
import nodemailer from "nodemailer";

const transport = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: Number(process.env.EMAIL_PORT),
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const sendEmail = (to: string, subject: string, html: string) => {
  logger.debug(`Sending email to ${to} with subject: ${subject}`);
  return transport.sendMail({
    from: process.env.EMAIL_FROM,
    to,
    subject,
    html,
  });
};

export default sendEmail;
