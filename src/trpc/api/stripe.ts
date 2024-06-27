import { z } from 'zod';
import { adminProcedure, privateProcedure, router } from '../trpc';
import {
  getAdminStripeData,
  getAllStripeAccountData,
  updateBalance,
} from './controller/adminTransAction';
import {
  createUserController,
  checkStripeController,
  confirmStripeController,
  createStripeController,
  loginStripeController,
  transferMoneyController,
  updateStripeController,
  finishOnboardingController,
} from './controller/stripe';

export const stripeRoute = router({
  createStripe: privateProcedure
    .input(z.string())
    .mutation(async ({ input, ctx }) => {
      const response = createStripeController(ctx.user, input);
      return response;
    }),

  transferMoney: privateProcedure
    .input(z.number())
    .mutation(async ({ input, ctx }) => {
      const response = await transferMoneyController(input, ctx.user);

      return response;
    }),

  sellerStripeAccount: privateProcedure.query(async ({ ctx }) => {
    const response = await createUserController(ctx.user);
    return response;
  }),

  updateStripeId: privateProcedure
    .input(z.string())
    .mutation(async ({ input, ctx }) => {
      const response = await updateStripeController(input, ctx.user);

      return response;
    }),

  confirmStripe: privateProcedure
    .input(z.string())
    .mutation(async ({ input, ctx }) => {
      const response = await confirmStripeController(input, ctx.user);
      return response;
    }),

  checkStripe: privateProcedure.query(async ({ ctx }) => {
    const response = await checkStripeController(ctx.user);
    return response;
  }),

  loginStripe: privateProcedure.query(async ({ ctx }) => {
    const response = await loginStripeController(ctx.user);
    return response;
  }),

  allStripeInfo: adminProcedure.query(async () => {
    const response = await getAllStripeAccountData();
    return response;
  }),
  adminStripe: adminProcedure.query(async ({ ctx }) => {
    const response = await getAdminStripeData();
    return response;
  }),

  updateBalance: adminProcedure
    .input(z.number())
    .mutation(async ({ input }) => {
      const response = await updateBalance(input);
      return response;
    }),
  finishOnboarding: privateProcedure.mutation(async ({ ctx }) => {
    const response = await finishOnboardingController(ctx.user);
    return response;
  }),
});
