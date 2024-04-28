import { z } from "zod";
import { privateProcedure, router } from "../trpc";
import {
  confirmPurchaseController,
  createSessionController,
} from "./controller/payment";

export const paymentRouter = router({
  createSession: privateProcedure
    .input(z.object({ productIds: z.array(z.string()) }))
    .mutation(async ({ ctx, input }) => {
      const { productIds } = input;
      const response = await createSessionController(productIds, ctx.user);
      return response;
    }),

  confirmPurchase: privateProcedure
    .input(z.object({ orderId: z.string() }))
    .query(async ({ ctx, input }) => {
      const { orderId } = input;
      const response = await confirmPurchaseController(orderId, ctx.user);
      return response;
    }),
});
