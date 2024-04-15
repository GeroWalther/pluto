import { uploadSchema } from '@/lib/validators/account-credentials-validator';
import { z } from 'zod';
import { privateProcedure, router } from '../trpc';
import {
  createProductController,
  deleteFileController,
  getAllProductsController,
} from './controller/seller';
import { deleteProduct } from '@/db/prisma.product';

export const sellerRouter = router({
  deleteUploadedFile: privateProcedure
    .input(z.array(z.string()))
    .mutation(async ({ input, ctx }) => {
      return await deleteFileController(input, true);
    }),
  uploadProduct: privateProcedure
    .input(uploadSchema)
    .mutation(async ({ input, ctx }) => {
      const {
        description,
        name,
        price,
        imageKeys,
        imageUrls,
        productFileUrls,
        productFileKeys,
      } = input;
      const result = await createProductController(
        {
          description,
          name,
          price,
          imageUrls,
          imageKeys,
          productFileUrls,
          productFileKeys,
        },
        ctx.user
      );

      return result;
    }),

  getAllProducts: privateProcedure.query(async ({ ctx }) => {
    return await getAllProductsController(ctx.user.id);
  }),
  deleteProduct: privateProcedure
    .input(z.string())
    .mutation(async ({ input }) => {
      return await deleteProduct(input);
    }),
});
