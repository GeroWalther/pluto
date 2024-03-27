import { z } from 'zod';
import { privateProcedure, router } from '../trpc';
import { deleteAllSellerFilesController } from './controller/seller';

export const sellerRouter = router({
  deleteAllUploadedFiles: privateProcedure
    .input(z.array(z.string()))
    .mutation(async ({ input, ctx }) => {
      const deletedFile = await deleteAllSellerFilesController(input, ctx.user);
      return deletedFile;
    }),
});
