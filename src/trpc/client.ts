//  Importing the appRouter types
import { TAppRouter } from '@/trpc/index';
import { createTRPCReact } from '@trpc/react-query';

export const trpc = createTRPCReact<TAppRouter>({});
