import { authOptions } from '@/lib/auth';
import { TRPCError, initTRPC } from '@trpc/server';
import { getServerSession } from 'next-auth';

const t = initTRPC.context<{}>().create();

//add middleware to check if user is logged in and added extra info for private procedures
const middleware = t.middleware;

const isAuthorized = middleware(async (opts) => {
  const session = await getServerSession(authOptions);
  if (!session) {
    throw new TRPCError({
      code: 'UNAUTHORIZED',
      message: 'User unauthorized. Please login or create a new account.',
    });
  }
  return opts.next({
    //this ctx object is available from within our
    ctx: {
      user: session.user,
      greeting: 'Hello World from the middleware',
    },
  });
});

// middleware to check if user has a session and isAdmin
const isAdmin = middleware(async (opts) => {
  const session = await getServerSession(authOptions);
  if (!session) {
    throw new TRPCError({
      code: 'UNAUTHORIZED',
      message: 'This user is unauthorized.',
    });
  }
  //role ??
  if (!session.user.role) {
    throw new TRPCError({
      code: 'FORBIDDEN',
      message: 'This user is no admin',
    });
  }
  return opts.next({
    ctx: {
      userId: session.user.id,
      email: session.user.email,
      role: 'Admin',
    },
  });
});

export const router = t.router;
export const publicProcedure = t.procedure;
export const privateProcedure = t.procedure.use(isAuthorized);
export const adminProcedure = t.procedure.use(isAdmin);
export const createCallerFactory = t.createCallerFactory;
