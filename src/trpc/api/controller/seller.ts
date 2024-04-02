import {
  countAllProductsFromAUser,
  createProduct,
  updateProduct,
} from '@/db/prisma.product';
import { TRPCError } from '@trpc/server';
import type { User } from 'next-auth';
import { UTApi } from 'uploadthing/server';

export async function deleteFileController(file: string[], user: User) {
  const utapi = new UTApi();
  const deleted = await utapi.deleteFiles(file);

  if (!deleted) {
    throw new TRPCError({
      code: 'NOT_FOUND',
      message: 'File not found',
    });
  }

  // remove the file from the database
  const { id } = user;

  const updatedProduct = updateProduct(id, {
    images: file,
  });

  if (!updatedProduct) {
    throw new TRPCError({
      code: 'NOT_FOUND',
      message: 'Product not found in DB',
    });
  }

  return 'File deleted';
}

export type createdProductInput = {
  description: string;
  name: string;
  price: number;
  imageUrl: string[];
  // productFile: string[];
};
export async function createProductController(
  input: createdProductInput,
  ctx: User
) {
  const {
    description,
    name,
    price,
    imageUrl,
    //productFile
  } = input;

  // check for possible wrong input and throw error msg
  if (!description || description.length < 15 || description.length > 500) {
    throw new TRPCError({
      code: 'UNPROCESSABLE_CONTENT',
      message:
        'Product description must be between 15 and 500 characters long.',
    });
  }
  if (name.length !== 3) {
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

  const newProduct = await createProduct({
    images: imageUrl,
    description,
    name,
    price,
    user: {
      connect: {
        id: ctx.id,
      },
    },
  });

  if (newProduct) {
    throw new TRPCError({
      code: 'INTERNAL_SERVER_ERROR',
      message: 'Something went wrong creating the product',
    });
  }

  //return
  return `you got these from trpc: ${description}, ${name}, ${price}, ${imageUrl},  from user: ${ctx.name}, new PRODUCT: ${newProduct}`;
}
