// @vitest-environment jsdom

import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('posthog-js', () => ({
  default: {
    capture: vi.fn(),
  },
}));

import { useCartStore } from '@/lib/cart-store';

const baseItem = {
  product_id: 'prod-1',
  slug: 'classic-shirt',
  variant_id: 'var-1',
  product_name: 'Classic Shirt',
  size: 'M',
  color: 'Black',
  unit_price: 25000,
  quantity: 1,
  image_url: 'https://example.com/shirt.jpg',
};

describe('cart-store', () => {
  beforeEach(() => {
    localStorage.removeItem('iby-closet-cart');
    useCartStore.getState().clearCart();
  });

  it('addItem adds a new item', () => {
    useCartStore.getState().addItem(baseItem);

    const state = useCartStore.getState();
    expect(state.items).toHaveLength(1);
    expect(state.items[0].variant_id).toBe('var-1');
    expect(state.totalItems).toBe(1);
    expect(state.subtotal).toBe(25000);
  });

  it('addItem with same variant increments quantity', () => {
    useCartStore.getState().addItem(baseItem);
    useCartStore.getState().addItem({ ...baseItem, quantity: 2 });

    const state = useCartStore.getState();
    expect(state.items).toHaveLength(1);
    expect(state.items[0].quantity).toBe(3);
    expect(state.totalItems).toBe(3);
    expect(state.subtotal).toBe(75000);
  });

  it('removeItem removes matching variant', () => {
    useCartStore.getState().addItem(baseItem);
    useCartStore.getState().removeItem('var-1');

    const state = useCartStore.getState();
    expect(state.items).toHaveLength(0);
    expect(state.totalItems).toBe(0);
    expect(state.subtotal).toBe(0);
  });

  it('updateQuantity updates quantity and totals', () => {
    useCartStore.getState().addItem(baseItem);
    useCartStore.getState().updateQuantity('var-1', 4);

    const state = useCartStore.getState();
    expect(state.items[0].quantity).toBe(4);
    expect(state.totalItems).toBe(4);
    expect(state.subtotal).toBe(100000);
  });

  it('clearCart empties all items', () => {
    useCartStore.getState().addItem(baseItem);
    useCartStore.getState().clearCart();

    const state = useCartStore.getState();
    expect(state.items).toEqual([]);
    expect(state.totalItems).toBe(0);
    expect(state.subtotal).toBe(0);
  });

  it('computes subtotal and totalItems across multiple items', () => {
    useCartStore.getState().addItem(baseItem);
    useCartStore.getState().addItem({
      ...baseItem,
      product_id: 'prod-2',
      variant_id: 'var-2',
      product_name: 'Linen Trousers',
      unit_price: 30000,
      quantity: 2,
    });

    const state = useCartStore.getState();
    expect(state.items).toHaveLength(2);
    expect(state.totalItems).toBe(3);
    expect(state.subtotal).toBe(85000);
  });
});
