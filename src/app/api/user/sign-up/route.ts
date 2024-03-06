import { PrimaryActionEmailHtml } from '@/components/emails/PrimaryActionEmail';
import { prisma } from '@/db/db';
import { sendEmail } from '@/lib/sendEmail';
import { generateRandomToken } from '@/lib/utils';
import { NextRequest } from 'next/server';

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

  // const storedUser = await prisma.user.findUnique({
  //   where: {
  //     email: user.email as string,
  //   },
  // });

  // if (storedUser) {
  //   return Response.json(
  //     { error: 'User already registered. Please sign in instead.' },
  //     { status: 500 }
  //   );
  // }

  //TODO const hashedPassword = hash(user.password);
  // const newUser = await prisma.user.create({
  //   data: {
  //     name: user.name,
  //     email: user.email,
  //     password: user.password,
  //   },
  // });

  // if (newUser) {
  const token = generateRandomToken();

  // send receipt Email
  try {
    const info = await sendEmail(
      user.email,
      'Thanks for your order! This is your receipt.',
      PrimaryActionEmailHtml({
        actionLabel: 'verify your account',
        buttonText: 'Verify Account',
        href: `${process.env.NEXT_PUBLIC_SERVER_URL}/verify-email?token=${token}`,
      })
    );
    console.log(info);
  } catch (error) {
    console.log('Email failed to sent! ERROR: ', error);
    return Response.json({ error: 'Email failed to sent!' }, { status: 500 });
  }
  // }

  return Response.json(
    { msg: 'Successfully signed up!' },
    {
      status: 200,
    }
  );
}
