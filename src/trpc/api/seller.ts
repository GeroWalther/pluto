import { deleteProduct } from "@/db/prisma.product";
import { uploadSchema } from "@/lib/validators/account-credentials-validator";
import { z } from "zod";
import { privateProcedure, router } from "../trpc";
import {
  createProductController,
  deleteFileController,
  getAllProductsController,
} from "./controller/seller";

export const sellerRouter = router({
  deleteUploadedFile: privateProcedure
    .input(z.array(z.string()))
    .mutation(async ({ input, ctx }) => {
      return await deleteFileController(input, ctx.user, true);
    }),
  uploadProduct: privateProcedure
    .input(uploadSchema)
    .mutation(async ({ input, ctx }) => {
      const { description, name, price, imageKeys, imageUrls, productFiles } =
        input;
      const result = await createProductController(
        {
          description,
          name,
          price,
          imageUrls,
          imageKeys,
          productFiles,
        },
        ctx.user
      );

      return result;
    }),

  getAllProducts: privateProcedure.query(async ({ ctx }) => {
    return await getAllProductsController(ctx.user.id);
  }),
  deleteProduct: privateProcedure
    .input(z.string())
    .mutation(async ({ input, ctx }) => {
      const response = await deleteFileController([input], ctx.user, false);
      return response;
    }),
});
