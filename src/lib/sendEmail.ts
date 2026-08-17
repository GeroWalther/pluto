import 'server-only';
import nodemailer from 'nodemailer';
import { env } from './env';

interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
}

/**
 * Sends through Resend's SMTP endpoint. With no RESEND_API_KEY configured
 * (the default in development) the message is logged instead, so the whole
 * checkout flow still works locally without an email provider.
 */
export async function sendEmail({ to, subject, html }: SendEmailOptions) {
  const { RESEND_API_KEY, EMAIL_FROM } = env();

  if (!RESEND_API_KEY) {
    console.info(
      `[email:dev] to=${to} subject="${subject}" (not sent — RESEND_API_KEY is unset)`
    );
    return { delivered: false as const };
  }

  const transporter = nodemailer.createTransport({
    host: 'smtp.resend.com',
    secure: true,
    port: 465,
    auth: { user: 'resend', pass: RESEND_API_KEY },
  });

  await transporter.sendMail({
    from: EMAIL_FROM,
    to: [to.toLowerCase().trim()],
    subject,
    html,
  });

  return { delivered: true as const };
}
