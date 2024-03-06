import nodemailer from 'nodemailer';

import { Resend } from 'resend';
export const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendEmail(
  userEmail: string,
  subject: string,
  html: string
) {
  const transporter = nodemailer.createTransport({
    host: 'smtp.resend.com',
    secure: true,
    port: 465,
    auth: {
      user: 'resend',
      pass: process.env.RESEND_API_KEY,
    },
  });

  const info = await transporter.sendMail({
    from: `Pluto Market <${process.env.EMAIL}>`,
    to: [userEmail.toLowerCase().trim()],
    subject,
    html,
  });

  console.log('Message sent: %s', info.messageId);
  return info;
}
