import { adminProcedure, router } from '../trpc';
import { getPendingProductsController } from './controller/admin';

export const adminRouter = router({
  getPendingProducts: adminProcedure.query(async () => {
    return await getPendingProductsController();
  }),
});
