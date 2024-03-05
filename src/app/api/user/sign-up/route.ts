import { PrimaryActionEmailHtml } from '@/components/emails/PrimaryActionEmail';
import { prisma } from '@/db/db';
import { generateRandomToken } from '@/lib/utils';
import { NextRequest } from 'next/server';
const nodemailer = require('nodemailer');

import { Resend } from 'resend';
export const resend = new Resend(process.env.RESEND_API_KEY);

const transporter = nodemailer.createTransport({
  host: 'smtp.resend.com',
  secure: true,
  port: 465,
  auth: {
    user: 'resend',
    pass: process.env.RESEND_API_KEY,
  },
});

type userSignUp = {
  name: string;
  email: string;
  password: string;
  confirm_password: string;
};

export async function POST(request: NextRequest) {
  const body = await request.json();

  const user: userSignUp = {
    name: body.name,
    email: body.email,
    password: body.password,
    confirm_password: body.confirm_password,
  };

  // console.log(user);

  if (
    !user ||
    !user.email ||
    !user.name ||
    !user.password ||
    !user.confirm_password
  ) {
    return Response.json(
      { error: 'Error creating user. Input must not be empty.' },
      { status: 500 }
    );
  }
  if (user.password !== user.confirm_password) {
    return Response.json({ error: 'Passwords do not match.' }, { status: 500 });
  }

  const storedUser = await prisma.user.findUnique({
    where: {
      email: user.email as string,
    },
  });

  if (storedUser) {
    return Response.json(
      { error: 'User already registered. Please sign in instead.' },
      { status: 500 }
    );
  }

  //TODO const hashedPassword = hash(user.password);
  const newUser = await prisma.user.create({
    data: {
      name: user.name,
      email: user.email,
      password: user.password,
    },
  });

  if (newUser) {
    const token = generateRandomToken();

    // send receipt Email
    try {
      const data = await resend.emails.send({
        from: `Pluto Market <${process.env.EMAIL}>`,
        to: [user.email],
        subject: 'Thanks for your order! This is your receipt.',
        html: PrimaryActionEmailHtml({
          actionLabel: 'verify your account',
          buttonText: 'Verify Account',
          href: `${process.env.NEXT_PUBLIC_SERVER_URL}/verify-email?token=${token}`,
        }),
      });
      console.log(data);
    } catch (error) {
      console.log('Email failed to sent! ERROR: ', error);
      return Response.json({ error: 'Email failed to sent!' }, { status: 500 });
    }
  }

  return Response.json(
    { msg: 'Successfully signed up!' },
    {
      status: 200,
    }
  );
}
