import { adminRouter } from './api/admin';
import { authRouter } from './api/auth';
import { sellerRouter } from './api/seller';
import { createCallerFactory, router } from './trpc';

// Main root appRouter containing all of the defined api routes on a higher level. Routes are split up the api folder into different nested roters each handling only certain related tasks.
//In controller folder are the low level data manipulation functions, also split up accordingly.

export const appRouter = router({
  auth: authRouter,
  seller: sellerRouter,
  admin: adminRouter,
});

export type TAppRouter = typeof appRouter;

// Server Caller
const createCaller = createCallerFactory(appRouter);
export const serverCaller = createCaller({});
