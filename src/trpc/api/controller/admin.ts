import { getAllPendingProducts, updateProduct } from '@/db/prisma.product';
import { TRPCError } from '@trpc/server';
import prisma from '@/db/db';

export async function getPendingProductsController() {
  const pendingProds = await getAllPendingProducts();

  if (!pendingProds) {
    throw new TRPCError({
      code: 'INTERNAL_SERVER_ERROR',
      message: 'Problem getting pending products',
    });
  }

  if (pendingProds.length === 0) {
    return { message: 'No pending products currently in DB.' };
  }

  return pendingProds;
}

export async function updatePendingProductController(
  id: string,
  updateString: string
) {
  if (!id || updateString !== 'APPROVED' || 'REJECTED') {
    throw new TRPCError({
      code: 'BAD_REQUEST',
      message: 'Invalid input',
    });
  }

  // Update product in DB
  const updatedProduct = await prisma.product.update({
    where: { id },
    data: {
      status: updateString,
    },
  });

  if (!updatedProduct) {
    throw new TRPCError({
      code: 'INTERNAL_SERVER_ERROR',
      message: 'Problem updating product',
    });
  }

  return {
    message: `Product ${updateString.toLowerCase()} successfully!`,
    updatedProduct,
  };
}
