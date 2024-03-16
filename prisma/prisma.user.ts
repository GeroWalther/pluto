// /prisma/user.js
import prisma from '../src/db/db';

// READ
export const getAllUsers = async () => {
  const users = await prisma.user.findMany({});
  return users;
};

export const getUser = async (email: string) => {
  const user = await prisma.user.findUnique({
    where: { email },
  });
  return user;
};

interface createUserType {
  name: string;
  email: string;
  password: string;
  token: string;
}
// CREATE
export const createUser = async ({
  email,
  name,
  password,
  token,
}: createUserType) => {
  const user = await prisma.user.create({
    data: {
      email,
      name,
      password,
      token,
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
