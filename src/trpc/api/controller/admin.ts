import prisma from '@/db/db';
import {
  getAllPendingProducts,
  getApprovedProducts,
  getRejectedProducts,
  updateProductStatus,
} from '@/db/prisma.product';
import { TRPCError } from '@trpc/server';

export async function getPendingProductsController() {
  const pendingProds = await getAllPendingProducts();

  if (!pendingProds) {
    throw new TRPCError({
      code: 'INTERNAL_SERVER_ERROR',
      message: 'Problem getting pending products',
    });
  }

  if (pendingProds.length === 0) {
    throw new TRPCError({
      code: 'NOT_FOUND',
      message: 'No pending products found',
    });
  }

  return pendingProds;
}

export async function getApprovedProductsController() {
  const approvedProducts = await getApprovedProducts();

  if (!approvedProducts) {
    throw new TRPCError({
      code: 'INTERNAL_SERVER_ERROR',
      message: 'Problem getting pending products',
    });
  }

  if (approvedProducts.length === 0) {
    throw new TRPCError({
      code: 'NOT_FOUND',
      message: 'No pending products found',
    });
  }

  return approvedProducts;
}
export async function getRejectedProductsController() {
  const rejectedProducts = await getRejectedProducts();

  if (!rejectedProducts) {
    throw new TRPCError({
      code: 'INTERNAL_SERVER_ERROR',
      message: 'Problem getting pending products',
    });
  }

  if (rejectedProducts.length === 0) {
    throw new TRPCError({
      code: 'NOT_FOUND',
      message: 'No pending products found',
    });
  }

  return rejectedProducts;
}

export async function updatePendingProductController(
  id: string,
  updateString: string
) {
  if (!id) {
    throw new TRPCError({
      code: 'BAD_REQUEST',
      message: 'Invalid input id',
    });
  }
  if (updateString !== 'APPROVED' && updateString !== 'REJECTED') {
    throw new TRPCError({
      code: 'BAD_REQUEST',
      message: 'Invalid input',
    });
  }

  // Update product in DB
  const updatedProduct = await updateProductStatus(id, updateString);

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
