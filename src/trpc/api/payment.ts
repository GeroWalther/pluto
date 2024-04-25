import { z } from 'zod';
import { publicProcedure, router } from '../trpc';

export const paymentRouter = router({
  createSession: publicProcedure
    .input(z.object({ productIds: z.array(z.any()) }))
    .mutation(async ({ ctx }) => {
      return { url: 'something.com' };
    }),
});
