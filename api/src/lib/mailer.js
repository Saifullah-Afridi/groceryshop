import nodemailer from "nodemailer";
import { env } from "../config/env.js";
import { httpError } from "./httpError.js";

const { host, port, user, pass } = env.smtp;
const transporter = host
  ? nodemailer.createTransport({ host, port, secure: port === 465, auth: user ? { user, pass } : undefined })
  : null;

export async function sendMail({ to, subject, text, html }) {
  if (!transporter) {
    console.log(`\n[Email is not set up, so it is printed here instead]\nTo: ${to}\nSubject: ${subject}\n${text}\n`);
    return;
  }
  try {
    await transporter.sendMail({ from: env.mailFrom, to, subject, text, html });
  } catch (error) {
    console.error("Email failed:", error.message);
    throw httpError(502, "We could not send the email. Please try again in a moment.");
  }
}


// Contact messages must never report success when SMTP is not configured.
export async function sendContactMail({ to, replyTo, subject, text, html }) {
  if (!transporter) {
    throw httpError(503, "Email service is not configured. Please contact the store by phone.");
  }
  try {
    await transporter.sendMail({ from: env.mailFrom, to, replyTo, subject, text, html });
  } catch (error) {
    console.error("Contact email failed:", error.message);
    throw httpError(502, "We could not send your message. Please try again in a moment.");
  }
}
