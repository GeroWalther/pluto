import { z } from "zod";
import { privateProcedure, router } from "../trpc";
import { deleteSellerProduct } from "./controller/seller";

export const sellerRouter = router({
  deleteSellerProduct: privateProcedure
    .input(z.string())
    .mutation(async ({ input, ctx }) => {
      const deletedProduct = await deleteSellerProduct(input, ctx.user);
      return deletedProduct;
    }),
});
