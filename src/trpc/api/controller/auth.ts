import { generateRandomToken, validateEmail } from '@/lib/utils';

import { TRPCError } from '@trpc/server';
import { sendEmail } from '@/lib/sendEmail';
import { PrimaryActionEmailHtml } from '@/components/emails/PrimaryActionEmail';
import { createUser, findUserbyEmail, updateUser } from '@/db/prisma.user';

export type TuserSignUp = {
  name: string;
  email: string;
  password: string;
  confirm_password: string;
};
export const signUpUserController = async (newUser: TuserSignUp) => {
  if (
    !newUser ||
    !newUser.email ||
    !newUser.name ||
    !newUser.password ||
    !newUser.confirm_password
  ) {
    throw new TRPCError({
      code: 'NOT_FOUND',
      message: 'Error creating user. Input must not be empty.',
    });
  }
  if (newUser.password.trim() !== newUser.confirm_password.trim()) {
    throw new TRPCError({
      code: 'CONFLICT',
      message: 'Passwords do not match.',
    });
  }
  if (!validateEmail(newUser.email.trim())) {
    throw new TRPCError({
      code: 'CONFLICT',
      message: 'Must provide a valid Email.',
    });
  }
  const storedUser = await findUserbyEmail(newUser.email);

  if (storedUser) {
    throw new TRPCError({
      code: 'BAD_REQUEST',
      message: 'User already registered. Please sign in instead.',
    });
  }

  const token = await generateRandomToken();
  // store user in DB
  const createdUser = await createUser({
    email: newUser.email,
    name: newUser.name,
    password: newUser.password,
    provider: 'credentials',
    token,
  });

  if (!createdUser)
    throw new TRPCError({
      code: 'INTERNAL_SERVER_ERROR',
      message: 'Error creating user. Please try again.',
    });

  // send verification Email
  try {
    const info = await sendEmail({
      userEmail: newUser.email,
      subject: 'Welcome to Pluto Market! Verify your account.',
      html: PrimaryActionEmailHtml({
        actionLabel: 'verify your account',
        buttonText: 'Verify Account',
        href: `${process.env.NEXT_PUBLIC_SERVER_URL}/verify-email/${token}`,
      }),
    });
    console.log(info);
  } catch (error) {
    console.log('Email failed to sent! ERROR: ', error);
    throw new TRPCError({
      code: 'INTERNAL_SERVER_ERROR',
      message: 'Email failed to sent!',
    });
  }

  return createdUser;
};

export const updateUserNameController = async (input: {
  email: string;
  newUserName: string;
}) => {
  const res = await updateUser(input.email, { name: input.newUserName });
  if (!res) {
    throw new TRPCError({
      code: 'INTERNAL_SERVER_ERROR',
      message: 'User not found',
    });
  }
  return res;
};
