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

// CREATE
export interface CreateProductType {
  image: string;
  name: string;
  url: string;
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
    data: updateData,
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
