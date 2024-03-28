import { updateProduct } from '@/db/prisma.product';
import { TRPCError } from '@trpc/server';
import type { User } from 'next-auth';
import { UTApi } from 'uploadthing/server';

export async function deleteAllSellerFilesController(
  file: string[],
  user: User
) {
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
