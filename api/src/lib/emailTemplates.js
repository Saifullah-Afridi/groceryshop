// The look of every email Rakan sends. Emails cannot use our website CSS, so styles are written inline
// and the layout uses tables (this is the only layout that works in Gmail, Outlook and phone mail apps).
// Each email is bilingual: English first, Arabic below, because we do not know which one the shopper reads.

const GREEN = "#138040";
const DEEP = "#073B2B";
const MINT = "#00C98D";

const escapeHtml = (value) =>
  String(value).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);

function layout({ preheader, bodyHtml }) {
  return `<!doctype html>
<html lang="en">
<body style="margin:0;padding:0;background:#F5FAF7;">
  <!-- Shown next to the subject in the inbox list -->
  <div style="display:none;max-height:0;overflow:hidden;opacity:0;color:#F5FAF7;">${escapeHtml(preheader)}</div>
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#F5FAF7;padding:24px 12px;">
    <tr><td align="center">
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:480px;background:#ffffff;border:1px solid #DCEAE1;border-radius:16px;overflow:hidden;font-family:Arial,Helvetica,sans-serif;">
        <tr><td style="background:${DEEP};padding:22px 28px;">
          <table role="presentation" cellspacing="0" cellpadding="0"><tr>
            <td style="width:36px;height:36px;background:${GREEN};border-radius:10px;text-align:center;color:#ffffff;font-size:18px;font-weight:bold;">R</td>
            <td style="padding-left:10px;color:#ffffff;font-size:20px;font-weight:bold;">Rakan<span style="color:${MINT};">.</span></td>
          </tr></table>
        </td></tr>
        ${bodyHtml}
        <tr><td style="background:#F5FAF7;padding:16px 28px;color:#718176;font-size:12px;line-height:18px;text-align:center;">
          Rakan · Fresh market in Irbid, Jordan<br/>ركان · سوق طازج في إربد، الأردن
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

export function verificationEmail({ code, minutes }) {
  const safeCode = escapeHtml(code);
  const subject = `${code} is your Rakan verification code | رمز التحقق من ركان`;

  const text = [
    `Your Rakan verification code is ${code}.`,
    `It works for ${minutes} minutes. If you did not create an account, you can ignore this email.`,
    "",
    `رمز التحقق الخاص بك في ركان هو ${code}.`,
    `الرمز صالح لمدة ${minutes} دقائق. إذا لم تقم بإنشاء حساب، يمكنك تجاهل هذه الرسالة.`,
  ].join("\n");

  const html = layout({
    preheader: `Your code is ${code}. It works for ${minutes} minutes.`,
    bodyHtml: `
        <tr><td style="padding:28px 28px 8px 28px;">
          <h1 style="margin:0 0 8px 0;color:${DEEP};font-size:22px;">Verify your email</h1>
          <p style="margin:0;color:#45675A;font-size:15px;line-height:24px;">Use this code to finish creating your Rakan account:</p>
        </td></tr>
        <tr><td align="center" style="padding:16px 28px;">
          <div style="display:inline-block;background:#EAF6EE;border:1px dashed ${GREEN};border-radius:12px;padding:14px 26px;color:${DEEP};font-size:36px;font-weight:bold;letter-spacing:10px;">${safeCode}</div>
        </td></tr>
        <tr><td style="padding:0 28px 20px 28px;color:#718176;font-size:13px;line-height:20px;">
          This code works for ${minutes} minutes. Never share it with anyone. If you did not create an account, you can safely ignore this email.
        </td></tr>
        <tr><td style="padding:0 28px;"><div style="border-top:1px solid #DCEAE1;"></div></td></tr>
        <tr><td dir="rtl" style="padding:20px 28px 28px 28px;text-align:right;">
          <h2 style="margin:0 0 8px 0;color:${DEEP};font-size:19px;">تحقق من بريدك الإلكتروني</h2>
          <p style="margin:0 0 6px 0;color:#45675A;font-size:15px;line-height:26px;">رمز التحقق الخاص بك في ركان هو <b style="color:${DEEP};letter-spacing:3px;">${safeCode}</b></p>
          <p style="margin:0;color:#718176;font-size:13px;line-height:22px;">الرمز صالح لمدة ${minutes} دقائق ولا تشاركه مع أحد. إذا لم تقم بإنشاء حساب، يمكنك تجاهل هذه الرسالة.</p>
        </td></tr>`,
  });

  return { subject, text, html };
}
