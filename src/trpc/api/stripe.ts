import { z } from "zod";
import { privateProcedure, router } from "../trpc";
import {
  confirmStripeController,
  createStripeController,
  transferMoneyController,
  updateStripeController,
} from "./controller/stripe";

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
});
