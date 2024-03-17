// /prisma/user.js
import prisma from '../src/db/db';

// READ
export const getAllUsers = async () => {
  const users = await prisma.user.findMany({});
  return users;
};

export const findUserbyEmail = async (email: string) => {
  const user = await prisma.user.findUnique({
    where: { email },
  });
  return user;
};
export const findUserbyToken = async (token: string) => {
  const user = await prisma.user.findUnique({
    where: { token },
  });
  return user;
};

interface createUserType {
  name: string | null | undefined;
  email: string;
  isEmailVerified?: boolean;
  password: string;
  token: string;
  image?: string | null | undefined;
  provider?: 'google' | 'github' | 'credentials' | null;
}
// CREATE
export const createUser = async ({
  email,
  name,
  password,
  token,
  provider,
}: createUserType) => {
  const user = await prisma.user.create({
    data: {
      email,
      name,
      password,
      token,
      provider,
    },
  });
  return user;
};

// UPDATE
export const updateUser = async (id: string, updateData: any) => {
  const user = await prisma.user.update({
    where: {
      id,
    },
    data: {
      ...updateData,
    },
  });
  return user;
};

// DELETE
export const deleteUser = async (email: string) => {
  const user = await prisma.user.delete({
    where: {
      email,
    },
  });
  return user;
};