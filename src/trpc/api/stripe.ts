import { z } from "zod";
import { privateProcedure, router } from "../trpc";
import { createStripeController } from "./controller/stripe";

export const stripeRoute = router({
  createStripe: privateProcedure
    .input(
      z.object({
        stripeId: z.string(),
        stripeSecret: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const response = createStripeController(input, ctx.user);
      return response;
    }),
});
