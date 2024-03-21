import { createCallerFactory, router } from './trpc';
import { authRouter } from './api/auth';

// Main root appRouter containing all of the defined api routes on a higher level. Routes are split up the api folder into different nested roters each handling only certain related tasks.
//In controller folder are the low level data manipulation functions, also split up accordingly.

export const appRouter = router({
  user: authRouter,
});

export type TAppRouter = typeof appRouter;

// Server Caller
const createCaller = createCallerFactory(appRouter);
export const serverCaller = createCaller({});
