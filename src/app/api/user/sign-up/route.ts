import { PrimaryActionEmailHtml } from '@/components/emails/PrimaryActionEmail';
import prisma from '@/db/db';
import { sendEmail } from '@/lib/sendEmail';
import { generateRandomToken, validateEmail } from '@/lib/utils';
import { NextRequest } from 'next/server';
import { createUser, findUserbyEmail } from '../../../../../prisma/prisma.user';

export type userSignUp = {
  name: string;
  email: string;
  password: string;
  confirm_password: string;
};

export async function POST(request: NextRequest) {
  // input fetch from the request and validation
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

  if (!validateEmail(user.email.trim())) {
    return Response.json(
      { error: 'Must provide a valid Email.' },
      { status: 500 }
    );
  }

  // check if user already exists
  const storedUser = await findUserbyEmail(user.email);

  if (storedUser) {
    return Response.json(
      { error: 'User already registered. Please sign in instead.' },
      { status: 500 }
    );
  }

  // send verification Email
  const token = generateRandomToken();

  const newUser = await createUser({
    name: user.name,
    email: user.email,
    password: user.password,
    token,
  });

  // const newUser = await prisma.user.create({
  //   data: {
  //     name: user.name,
  //     email: user.email,
  //     password: user.password,
  //     token: token,
  //   },
  // });

  if (!newUser) {
    return Response.json(
      { error: 'Error creating user. Please try again.' },
      { status: 500 }
    );
  }

  try {
    const info = await sendEmail({
      userEmail: user.email,
      subject: 'Thanks for your order! This is your receipt.',
      html: PrimaryActionEmailHtml({
        actionLabel: 'verify your account',
        buttonText: 'Verify Account',
        href: `${process.env.NEXT_PUBLIC_SERVER_URL}/verify-email/${token}`,
      }),
    });
    console.log(info);
  } catch (error) {
    console.log('Email failed to sent! ERROR: ', error);
    return Response.json({ error: 'Email failed to sent!' }, { status: 500 });
  }

  return Response.json(
    { msg: 'Successfully signed up!' },
    {
      status: 200,
    }
  );
}
