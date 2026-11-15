import { asyncHandler } from "../../lib/asyncHandler.js";
import { env } from "../../config/env.js";
import { sendContactMail } from "../../lib/mailer.js";
import { contactSchema } from "./contact.validation.js";

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (character) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  })[character]);
}

function buildContactEmail({ name, email, message }) {
  const safeName = escapeHtml(name);
  const safeEmail = escapeHtml(email);
  const safeMessage = escapeHtml(message).replace(/\r?\n/g, "<br>");

  return `
    <!doctype html>
    <html lang="en">
      <body style="margin:0;padding:32px 12px;background:#f3f7f4;font-family:Arial,Helvetica,sans-serif;color:#18372b;">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:640px;margin:0 auto;background:#ffffff;border:1px solid #dceae1;border-radius:16px;overflow:hidden;">
          <tr><td style="padding:26px 30px;background:#073b2b;color:#ffffff;">
            <div style="font-size:12px;letter-spacing:1.5px;text-transform:uppercase;color:#b9e4ce;">Rakan Shop</div>
            <h1 style="margin:8px 0 0;font-size:23px;line-height:1.3;">New contact message</h1>
            <p style="margin:8px 0 0;font-size:14px;color:#e0f2e8;">Someone has sent a message through your website.</p>
          </td></tr>
          <tr><td style="padding:28px 30px;">
            <p style="margin:0 0 18px;font-size:14px;color:#587064;">Contact details</p>
            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="font-size:14px;">
              <tr><td style="padding:11px 0;color:#6b8176;width:90px;border-bottom:1px solid #edf2ee;">Name</td><td style="padding:11px 0;font-weight:600;border-bottom:1px solid #edf2ee;">${safeName}</td></tr>
              <tr><td style="padding:11px 0;color:#6b8176;border-bottom:1px solid #edf2ee;">Email</td><td style="padding:11px 0;border-bottom:1px solid #edf2ee;"><a href="mailto:${safeEmail}" style="color:#008f59;text-decoration:none;">${safeEmail}</a></td></tr>
            </table>
            <h2 style="margin:26px 0 10px;font-size:16px;">Message</h2>
            <div style="padding:18px;background:#f5faf7;border:1px solid #dceae1;border-radius:10px;font-size:14px;line-height:1.7;white-space:normal;">${safeMessage}</div>
            <p style="margin:24px 0 0;font-size:12px;color:#81948a;">You can reply directly to this email to respond to ${safeName}.</p>
          </td></tr>
        </table>
      </body>
    </html>
  `;
}

export const submitContact = asyncHandler(async (req, res) => {
  const input = contactSchema.parse(req.body);
  await sendContactMail({
    to: env.contactEmail,
    replyTo: input.email,
    subject: `New website message from ${input.name}`,
    text: `New message from your Rakan Shop website\n\nName: ${input.name}\nEmail: ${input.email}\n\nMessage:\n${input.message}`,
    html: buildContactEmail(input),
  });
  res.status(200).json({ message: "Your message has been sent." });
});
