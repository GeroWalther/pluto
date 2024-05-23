import { z } from "zod";
import { findUserbyEmail } from "../../db/prisma.user";
import {
  adminProcedure,
  privateProcedure,
  publicProcedure,
  router,
} from "../trpc";

import {
  sellerPaymentInfoController,
  signUpUserController,
  updateUserNameController,
} from "./controller/auth";

//auth related routes and their precedures.
export const authRouter = router({
  getUserFromEmail: publicProcedure
    .input(z.string())
    .query(async ({ input }) => {
      return await findUserbyEmail(input);
    }),

  updateUserName: publicProcedure
    .input(z.object({ email: z.string(), newUserName: z.string() }))
    .mutation(async ({ input }) => {
      return await updateUserNameController(input);
    }),

  signUp: publicProcedure
    .input(
      z.object({
        email: z.string(),
        name: z.string(),
        password: z.string(),
        confirm_password: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      return await signUpUserController(input);
    }),
  isAuthorized: privateProcedure.query(async ({ ctx }) => {
    return {
      user: ctx.user,
      greeting: ctx.greeting,
    };
  }),
  approvalDashboard: adminProcedure.query(
    async ({ ctx: { userId, email, role } }) => {
      return {
        userId,
        email,
        role,
      };
    }
  ),

  getSellerPaymentInfo: privateProcedure.query(async ({ ctx }) => {
    const sellerPaymentInfo = await sellerPaymentInfoController(ctx.user);
    return sellerPaymentInfo;
  }),
});
