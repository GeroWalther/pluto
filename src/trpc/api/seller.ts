import { z } from 'zod';
import { privateProcedure, router } from '../trpc';
import {
  createProductController,
  deleteFileController,
} from './controller/seller';
import { uploadSchema } from '@/lib/validators/account-credentials-validator';

export const sellerRouter = router({
  deleteUploadedFile: privateProcedure
    .input(z.array(z.string()))
    .mutation(async ({ input, ctx }) => {
      return await deleteFileController(input, ctx.user);
    }),
  uploadProduct: privateProcedure
    .input(uploadSchema)
    .mutation(async ({ input, ctx }) => {
      return await createProductController(input, ctx.user);
    }),
});
