import { z } from 'zod';
import { createCallerFactory, publicProcedure, router } from './trpc';
import { findUserbyEmail, updateUser } from '../../prisma/prisma.user';

// Step 4 defining the api routes
export const appRouter = router({
  getUserFromEmail: publicProcedure
    .input(z.string())
    .query(async ({ input }) => {
      return await findUserbyEmail(input);
    }),

  updateUserName: publicProcedure
    .input(z.object({ email: z.string(), newUserName: z.string() }))
    .mutation(async ({ input }) => {
      return await updateUser(input.email, { name: input.newUserName });
    }),
});

export type TAppRouter = typeof appRouter;

// Server Caller
const createCaller = createCallerFactory(appRouter);
export const serverCaller = createCaller({});
