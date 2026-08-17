import { initTRPC, TRPCError } from '@trpc/server';
import superjson from 'superjson';
import { Role } from '@prisma/client';
import { auth } from '@/lib/auth';
import prisma from '@/db/db';

/**
 * Built once per request. Resolving the session here means a request with ten
 * procedure calls verifies the JWT once instead of ten times.
 */
export async function createContext() {
  const session = await auth();
  return { session, user: session?.user ?? null, prisma };
}

export type Context = Awaited<ReturnType<typeof createContext>>;

const t = initTRPC.context<Context>().create({
  // Dates come back as Dates on the client rather than strings that TypeScript
  // has been told are Dates.
  transformer: superjson,
});

const enforceAuth = t.middleware(({ ctx, next }) => {
  if (!ctx.user) {
    throw new TRPCError({
      code: 'UNAUTHORIZED',
      message: 'Please sign in to continue.',
    });
  }
  // Narrows `user` to non-null for every downstream procedure.
  return next({ ctx: { ...ctx, user: ctx.user } });
});

const enforceAdmin = enforceAuth.unstable_pipe(({ ctx, next }) => {
  if (ctx.user.role !== Role.ADMIN) {
    throw new TRPCError({
      code: 'FORBIDDEN',
      message: 'This area is restricted to administrators.',
    });
  }
  return next({ ctx });
});

export const router = t.router;
export const publicProcedure = t.procedure;
export const privateProcedure = t.procedure.use(enforceAuth);
export const adminProcedure = t.procedure.use(enforceAdmin);
export const createCallerFactory = t.createCallerFactory;
