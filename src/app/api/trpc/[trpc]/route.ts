import { fetchRequestHandler } from '@trpc/server/adapters/fetch';
import { appRouter } from '@/trpc';
import { createContext } from '@/trpc/trpc';

const handler = (req: Request) =>
  fetchRequestHandler({
    endpoint: '/api/trpc',
    req,
    router: appRouter,
    createContext,
    onError({ error, path }) {
      if (error.code === 'INTERNAL_SERVER_ERROR') {
        console.error(`[trpc] ${path ?? '<no-path>'} failed:`, error.cause ?? error);
      }
    },
  });

export { handler as GET, handler as POST };
