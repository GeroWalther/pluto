import prisma from '@/db/db';
import { countAllProductsFromAUser, deleteProduct } from '@/db/prisma.product';

import { TRPCError } from '@trpc/server';
import type { User } from 'next-auth';
import { UTApi } from 'uploadthing/server';

// delete file from the server --
export async function deleteFileController(
  input: string[],
  deleteUploaded: boolean
) {
  const utapi = new UTApi();

  if (deleteUploaded) {
    const deleted = await utapi.deleteFiles(input);

    if (!deleted) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'File not found',
      });
    }

    if (!deleted) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'File not found',
      });
    }
    return 'File deleted';
  }

  const deletedProduct = await deleteProduct(input[0]);

  if (!deletedProduct) {
    throw new TRPCError({
      code: 'INTERNAL_SERVER_ERROR',
      message: 'Something went wrong in the server while deleting the product',
    });
  }

  return 'File deleted';
}

// create a new product
export type createdProductInput = {
  description: string;
  name: string;
  price: number;
  imageKeys: string[];
  imageUrls: string[];
  productFiles: string[];
};

export async function createProductController(
  input: createdProductInput,
  ctx: User
) {
  const { description, name, price, imageKeys, imageUrls, productFiles } =
    input;
  // check for possible wrong input and throw error msg
  if (
    !description ||
    description.length < 15 ||
    description.length > 500 ||
    !name ||
    !price ||
    !imageUrls ||
    !productFiles
  ) {
    throw new TRPCError({
      code: 'UNPROCESSABLE_CONTENT',
      message:
        'Must provide a product name, description, price, and at least one product image and a product file.',
    });
  }

  if (name.length < 3) {
    throw new TRPCError({
      code: 'UNPROCESSABLE_CONTENT',
      message:
        'Must provide a product name that is at least 3 characters long.',
    });
  }
  if (!price || isNaN(price) || price <= 0) {
    throw new TRPCError({
      code: 'UNPROCESSABLE_CONTENT',
      message: 'Must provide a valid positive product price.',
    });
  }

  // check if user still can list products (max 5 for free)
  const prodCount = await countAllProductsFromAUser(ctx.id);
  if (prodCount >= 5) {
    throw new TRPCError({
      code: 'FORBIDDEN',
      message:
        'You have reached the maximum number of products you can list on a free tier. Please upgrade to the Pro Version',
    });
  }

  // create a new product with prisma in DB

  const newProduct = await prisma.product.create({
    data: {
      name,
      imageKeys: [...imageKeys],
      description,
      imageUrls: [...imageUrls],
      productFiles: [...productFiles],
      price,
      user: {
        connect: {
          id: ctx.id,
        },
      },
    },
  });

  console.log(newProduct);

  if (!newProduct) {
    throw new TRPCError({
      code: 'INTERNAL_SERVER_ERROR',
      message: 'Something went wrong creating the product',
    });
  }

  //return
  return `you got these from trpc: ${description}, ${name}, ${price}, ${imageUrls}`;
}

// Get all Products
export const getAllProductsController = async (userId: string) => {
  const response = await prisma.product.findMany({
    where: {
      userId: userId,
    },
  });

  if (
    response.length === 0 ||
    !response ||
    response === null ||
    response === undefined
  ) {
    throw new TRPCError({
      code: 'NOT_FOUND',
      message: 'No products found',
    });
  }

  return response;
};
