'use client';

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

/**
 * The cart only ever holds product ids. Names and prices are re-read from the
 * server on the cart page, so a stale localStorage entry can never influence
 * what anyone is charged.
 */
type CartState = {
  productIds: string[];
  hydrated: boolean;
  add: (productId: string) => void;
  remove: (productId: string) => void;
  toggle: (productId: string) => void;
  clear: () => void;
  has: (productId: string) => boolean;
};

export const useCart = create<CartState>()(
  persist(
    (set, get) => ({
      productIds: [],
      hydrated: false,

      add: (productId) =>
        set((state) =>
          state.productIds.includes(productId)
            ? state
            : { productIds: [...state.productIds, productId] }
        ),

      remove: (productId) =>
        set((state) => ({
          productIds: state.productIds.filter((id) => id !== productId),
        })),

      toggle: (productId) =>
        get().productIds.includes(productId)
          ? get().remove(productId)
          : get().add(productId),

      clear: () => set({ productIds: [] }),

      has: (productId) => get().productIds.includes(productId),
    }),
    {
      name: 'pluto-cart',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ productIds: state.productIds }),
      // Server and first client render must agree, so components read
      // `hydrated` before showing counts.
      onRehydrateStorage: () => (state) => {
        if (state) state.hydrated = true;
      },
    }
  )
);
