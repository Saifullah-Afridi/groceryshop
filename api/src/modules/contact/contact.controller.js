import { asyncHandler } from "../../lib/asyncHandler.js";
import { env } from "../../config/env.js";
import { sendContactMail } from "../../lib/mailer.js";
import { contactSchema } from "./contact.validation.js";

export const submitContact = asyncHandler(async (req, res) => {
  const input = contactSchema.parse(req.body);
  await sendContactMail({
    to: env.contactEmail,
    replyTo: input.email,
    subject: `Website contact message from ${input.name}`,
    text: `${input.message}\n\nFrom: ${input.name}\nEmail: ${input.email}`,
  });
  res.status(200).json({ message: "Your message has been sent." });
});
