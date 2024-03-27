import { z } from 'zod';
import { privateProcedure, router } from '../trpc';
import { deleteSellerFileController } from './controller/seller';

export const sellerRouter = router({
  deleteUploadFile: privateProcedure
    .input(z.array(z.string()))
    .mutation(async ({ input, ctx }) => {
      const deletedFile = await deleteSellerFileController(input, ctx.user);
      return deletedFile;
    }),
});
