import { ProductType } from '@/components/Table/MasterTable';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

export type CartItem = {
  product: ProductType;
};

type CartState = {
  items: CartItem[];
  addItem: (product: ProductType) => void;
  removeItem: (productId: string) => void;
  clearCart: () => void;
};

// add items
// remove items
// clear the cart
// (keep track of cart items)
export const useCart = create<CartState>()(
  persist(
    (set) => ({
      items: [],
      addItem: (product) =>
        set((state) => {
          // this logic prevents adding items with the same id
          const existingItem = state.items.find(
            (item) => item.product.id === product.id
          );
          if (existingItem) {
            return state;
          }
          return { items: [...state.items, { product }] };

          // if we want to allow for multiple items with the same id in the cart use this code:
          // set((state) => {
          //   return { items: [...state.items, { product }] };
          // }),
        }),
      removeItem: (id) =>
        set((state) => {
          // if we can have multiple items with the same id this logic removes the one of them
          //   const itemIndex = state.items.findIndex(
          //     (item) => item.product.id === id
          //   );

          //   if (itemIndex !== -1) {
          //     const updatedItems = [...state.items];
          //     updatedItems.splice(itemIndex, 1);

          //     return { items: updatedItems };
          //   }

          //   return state;
          // in addItem we have a logic that prevents multiple items of the same id to be added so we go with below logic
          const updatedItems = state.items.filter(
            (item) => item.product.id !== id
          );

          return { items: updatedItems };
        }),
      clearCart: () => set({ items: [] }),
    }),
    {
      name: 'cart-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
