import prisma from "@/db/db";
import { countAllProductsFromAUser, deleteProduct } from "@/db/prisma.product";

import { TRPCError } from "@trpc/server";
import type { User } from "next-auth";
import { UTApi } from "uploadthing/server";

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
        code: "NOT_FOUND",
        message: "File not found",
      });
    }

    if (!deleted) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "File not found",
      });
    }
    return "File deleted";
  }

  const deletedProduct = await deleteProduct(input[0]);

  const fileKeys = deletedProduct.productFileKeys;
  const imageKeys = deletedProduct.imageKeys;

  const deleteUTAPI = await utapi.deleteFiles([...fileKeys, ...imageKeys]);

  if (!deleteUTAPI) {
    throw new TRPCError({
      code: "NOT_FOUND",
      message: "File not found",
    });
  }

  if (!deletedProduct) {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Something went wrong in the server while deleting the product",
    });
  }

  return "File deleted";
}

// create a new product
export type createdProductInput = {
  description: string;
  name: string;
  price: number;
  imageKeys: string[];
  imageUrls: string[];
  productFileUrls: string[];
  productFileKeys: string[];
  category: string;
};

export async function createProductController(
  input: createdProductInput,
  ctx: User
) {
  const {
    description,
    name,
    price,
    imageKeys,
    imageUrls,
    productFileUrls,
    productFileKeys,
    category,
  } = input;
  // check for possible wrong input and throw error msg
  if (
    !description ||
    description.length < 15 ||
    description.length > 500 ||
    !name ||
    !price ||
    !imageUrls ||
    !productFileUrls ||
    !category
  ) {
    throw new TRPCError({
      code: "UNPROCESSABLE_CONTENT",
      message:
        "Must provide a product name, description, price, category, at least one product image and a product file.",
    });
  }

  if (name.length < 3) {
    throw new TRPCError({
      code: "UNPROCESSABLE_CONTENT",
      message:
        "Must provide a product name that is at least 3 characters long.",
    });
  }
  if (!price || isNaN(price) || price <= 0) {
    throw new TRPCError({
      code: "UNPROCESSABLE_CONTENT",
      message: "Must provide a valid positive product price.",
    });
  }

  // check if user still can list products (max 5 for free)
  const prodCount = await countAllProductsFromAUser(ctx.id);
  if (prodCount >= 5) {
    throw new TRPCError({
      code: "FORBIDDEN",
      message:
        "You have reached the maximum number of products you can list on a free tier. Please upgrade to the Pro Version",
    });
  }

  // create a new product with prisma in DB

  const newProduct = await prisma.product.create({
    data: {
      name,
      imageKeys: [...imageKeys],
      description,
      imageUrls: [...imageUrls],
      productFileUrls: [...productFileUrls],
      productFileKeys: [...productFileKeys],
      price,
      category,
      user: {
        connect: {
          id: ctx.id,
        },
      },
    },
  });

  if (!newProduct) {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Something went wrong creating the product",
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

  if (!response || response === null || response === undefined) {
    throw new TRPCError({
      code: "NOT_FOUND",
      message: "No products found",
    });
  }

  return response;
};

export const getAllSoldProducts = async (userId: string) => {
  const transactions = [
    { date: "2022-01-01", type: "Stripe transfer", amount: 100 },
    { date: "2022-01-02", type: "Product Sold", amount: 50 },
    { date: "2022-01-03", type: "Stripe transfer", amount: 200 },
    { date: "2022-01-04", type: "Product Sold", amount: 75 },
    { date: "2022-01-05", type: "Stripe transfer", amount: 150 },
    { date: "2022-01-06", type: "Product Sold", amount: 100 },
  ];

  const balance = transactions.reduce((acc, curr) => acc + curr.amount, 0);

  return {
    transactions,
    balance,
  };
};
