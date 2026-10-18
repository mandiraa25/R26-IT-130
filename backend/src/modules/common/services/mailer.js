/*
 * Sends transactional email (password-reset links) through Gmail.
 *
 * Configure in backend/.env:
 *   GMAIL_USER=yourname@gmail.com
 *   GMAIL_APP_PASSWORD=xxxx xxxx xxxx xxxx   (Google Account > Security > App passwords)
 *   APP_URL=http://localhost:5173             (where the reset link should open)
 *
 * Without GMAIL_USER / GMAIL_APP_PASSWORD nothing is sent; the link is printed
 * in the server log instead so the flow can still be tested locally.
 */
const nodemailer = require("nodemailer");

let transporter = null;
const isMailConfigured = () => Boolean(process.env.GMAIL_USER && process.env.GMAIL_APP_PASSWORD);

const getTransporter = () => {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      service: "gmail",
      auth: { user: process.env.GMAIL_USER, pass: String(process.env.GMAIL_APP_PASSWORD).replace(/\s+/g, "") },
    });
  }
  return transporter;
};

const sendPasswordResetEmail = async ({ to, name, resetUrl, minutes }) => {
  if (!isMailConfigured()) {
    console.log(`[mail] Gmail is not configured. Password reset link for ${to}: ${resetUrl}`);
    return { sent: false };
  }
  const greeting = name ? `Hi ${name},` : "Hi,";
  await getTransporter().sendMail({
    from: `"LexiLand" <${process.env.GMAIL_USER}>`,
    to,
    subject: "Reset your LexiLand password",
    text: `${greeting}\n\nWe received a request to reset your LexiLand password.\nOpen this link to choose a new password (it works for ${minutes} minutes):\n\n${resetUrl}\n\nIf you did not ask for this, you can ignore this email.\n\nLexiLand`,
    html: `<p>${greeting}</p><p>We received a request to reset your LexiLand password.</p><p><a href="${resetUrl}" style="display:inline-block;padding:10px 18px;border-radius:999px;background:#46950f;color:#fff;font-weight:bold;text-decoration:none">Choose a new password</a></p><p>This link works for ${minutes} minutes. If you did not ask for this, you can ignore this email.</p><p>LexiLand</p>`,
  });
  return { sent: true };
};

module.exports = { sendPasswordResetEmail, isMailConfigured };
