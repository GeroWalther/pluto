import { z } from 'zod';
import { privateProcedure, router } from '../trpc';
import { COUNTRY_CODES } from '@/config/countries';
import {
  createDashboardLink,
  refreshAccountStatus,
  startOnboarding,
} from '@/server/services/connect';

export const payoutsRouter = router({
  status: privateProcedure.query(({ ctx }) => refreshAccountStatus(ctx.user.id)),

  startOnboarding: privateProcedure
    .input(z.object({ country: z.enum(COUNTRY_CODES) }))
    .mutation(({ ctx, input }) =>
      startOnboarding({ userId: ctx.user.id, country: input.country })
    ),

  dashboardLink: privateProcedure.mutation(({ ctx }) =>
    createDashboardLink(ctx.user.id)
  ),
});
