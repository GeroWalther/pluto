import { z } from 'zod';
import { adminProcedure, publicProcedure, router } from '../trpc';
import {
  getApprovedProductsController,
  getPendingProductsController,
  getRejectedProductsController,
  updatePendingProductController,
} from './controller/admin';
import { getSellerInfobyId } from '@/db/prisma.user';

export const adminRouter = router({
  getPendingProducts: adminProcedure.query(async () => {
    return await getPendingProductsController();
  }),
  getApprovedProducts: publicProcedure.query(async () => {
    return await getApprovedProductsController();
  }),
  getRejectedProducts: publicProcedure.query(async () => {
    return await getRejectedProductsController();
  }),
  getSellerInfo: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input }) => {
      return await getSellerInfobyId(input.id);
    }),
  updatePendingProducts: adminProcedure
    .input(z.object({ id: z.string(), updateString: z.string() }))
    .mutation(async ({ input }) => {
      return await updatePendingProductController(input.id, input.updateString);
    }),
});
