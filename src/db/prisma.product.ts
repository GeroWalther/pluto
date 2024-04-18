import prisma from './db';

// READ
export const getAllProducts = async () => {
  const products = await prisma.product.findMany({
    include: { user: true }, // Include user data in the response
  });
  return products;
};

export const getProductById = async (id: string) => {
  const product = await prisma.product.findUnique({
    where: { id },
    include: { user: true }, // Include user data in the response
  });
  return product;
};

export const getProductFromUserId = async (userId: string) => {};

export const getProductByFileName = async (image: string) => {
  const product = await prisma.product.findFirst({
    where: {
      imageUrls: {
        has: image,
      },
    },
  });
  return product;
};

// CREATE
export interface CreateProductType {
  images: string[];
  name: string;
  description: string;
  price: number;
  user: {
    connect: {
      id: string;
    };
  };
}

export const createProduct = async (productData: CreateProductType) => {
  const product = await prisma.product.create({
    data: productData,
  });
  return product;
};

// UPDATE
export type UpdateProductType = Partial<CreateProductType>; // Allows updating any combination of product properties

export const updateProduct = async (
  id: string,
  updateData: UpdateProductType
) => {
  const product = await prisma.product.update({
    where: { id },
    data: {
      ...updateData,
    },
  });
  return product;
};

// DELETE
export const deleteProduct = async (id: string) => {
  const product = await prisma.product.delete({
    where: { id },
  });
  return product;
};

//COUNT
export const countAllProductsFromAUser = async (id: string) => {
  const productsCount = await prisma.product.count({
    where: { id },
  });
  return productsCount;
};

export const getAllPendingProducts = async () => {
  const pendingProds = await prisma.product.findMany({
    where: {
      status: 'PENDING',
    },
  });
  return pendingProds;
};
