import { findUserbyEmail } from '../../../prisma/prisma.user';
import { publicProcedure, router } from '../trpc';
import { z } from 'zod';

import {
  signUpUserController,
  updateUserNameController,
} from './controller/auth';

//auth related routes and their precedures. low level
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
});
