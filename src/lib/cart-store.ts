import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

export type CartItem = {
  product_id: string;
  slug: string;
  variant_id: string;
  product_name: string;
  size: string;
  color: string;
  unit_price: number;
  quantity: number;
  image_url: string;
  unit_type: 'yard' | 'bundle';
  minimum_quantity: number;
};

type CartState = {
  items: CartItem[];
  totalItems: number;
  subtotal: number;
  addItem: (item: CartItem) => void;
  removeItem: (variant_id: string) => void;
  updateQuantity: (variant_id: string, qty: number) => void;
  clearCart: () => void;
};

const getTotals = (items: CartItem[]) => ({
  totalItems: items.reduce((sum, item) => sum + item.quantity, 0),
  subtotal: items.reduce((sum, item) => sum + item.unit_price * item.quantity, 0),
});

export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      items: [],
      totalItems: 0,
      subtotal: 0,
      addItem: (item) => {
        if (typeof window !== 'undefined') {
          import('posthog-js')
            .then((m) =>
              m.default.capture('add_to_cart', {
                product_id: item.product_id,
                product_name: item.product_name,
                price: item.unit_price,
              })
            )
            .catch(() => {
              // Ignore analytics errors so cart actions never fail.
            });
        }

        set((state) => {
          const nextQty = Math.max(1, item.quantity);
          const items = state.items.some(
            (cartItem) => cartItem.variant_id === item.variant_id
          )
            ? state.items.map((cartItem) =>
              cartItem.variant_id === item.variant_id
                ? { ...cartItem, quantity: cartItem.quantity + nextQty }
                : cartItem
            )
            : [...state.items, { ...item, quantity: nextQty }];

          return {
            items,
            ...getTotals(items),
          };
        });
      },
      removeItem: (variant_id) =>
        set((state) => {
          const items = state.items.filter((item) => item.variant_id !== variant_id);

          return {
            items,
            ...getTotals(items),
          };
        }),
      updateQuantity: (variant_id, qty) =>
        set((state) => {
          const normalizedQty = Math.max(0, qty);
          const items =
            normalizedQty === 0
              ? state.items.filter((item) => item.variant_id !== variant_id)
              : state.items.map((item) =>
                item.variant_id === variant_id
                  ? { ...item, quantity: normalizedQty }
                  : item
              );

          return {
            items,
            ...getTotals(items),
          };
        }),
      clearCart: () =>
        set({
          items: [],
          totalItems: 0,
          subtotal: 0,
        }),
    }),
    {
      name: '315fabrics-cart',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        items: state.items,
        totalItems: state.totalItems,
        subtotal: state.subtotal,
      }),
    }
  )
);
