import { z } from 'zod';
import { privateProcedure, router } from '../trpc';
import {
  createStripeController,
  transferMoneyController,
} from './controller/stripe';
import { updateUser } from '@/db/prisma.user';

export const stripeRoute = router({
  createStripe: privateProcedure
    .input(z.string())
    .mutation(async ({ input, ctx }) => {
      const response = createStripeController(input, ctx.user);
      return response;
    }),

  transferMoney: privateProcedure
    .input(z.number())
    .mutation(async ({ input, ctx }) => {
      const response = await transferMoneyController(input, ctx.user);

      return response;
    }),

  updateStripeId: privateProcedure
    .input(z.string())
    .mutation(async ({ input, ctx }) => {
      const response = await updateUser(ctx.user.email, { stripeId: input });

      return response;
    }),
});
