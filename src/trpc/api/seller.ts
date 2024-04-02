import { z } from 'zod';
import { privateProcedure, router } from '../trpc';
import {
  createProductController,
  deleteFileController,
} from './controller/seller';

export const sellerRouter = router({
  deleteUploadedFile: privateProcedure
    .input(z.array(z.string()))
    .mutation(async ({ input, ctx }) => {
      return await deleteFileController(input, ctx.user);
    }),
  uploadProduct: privateProcedure
    .input(
      z.object({
        name: z.string(),
        description: z.string(),
        price: z.number(),
        imageUrl: z.array(z.string()),
        // productFile: z.array(z.string()),
      })
    )
    .mutation(async ({ input, ctx }) => {
      return await createProductController(input, ctx.user);
    }),
});
