import { z } from "zod";
import { adminProcedure, privateProcedure, router } from "../trpc";
import { testGive } from "./controller/test";

export const test = router({
  test: privateProcedure.input(z.string()).mutation(async ({ input, ctx }) => {
    const response = await testGive(input, ctx.user);
    return response;
  }),
});
