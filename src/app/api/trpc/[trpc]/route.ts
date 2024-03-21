import { appRouter } from '@/trpc';
import { fetchRequestHandler } from '@trpc/server/adapters/fetch';
import type { NextApiRequest, NextApiResponse } from 'next';
import type { NextRequest } from 'next/server';

type Context = {
  req: NextApiRequest;
  res: NextApiResponse;
};

const handler = async (req: NextRequest) => {
  const result = await fetchRequestHandler({
    endpoint: 'api/trpc',
    req,
    router: appRouter,
    createContext: (): Context => {
      return {} as Context;
    },
  });

  return result;
};

export { handler as DELETE, handler as GET, handler as POST, handler as PUT };
