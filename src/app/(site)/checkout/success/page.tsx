'use client';

import { Suspense, useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useCartStore } from '@/lib/cart-store';

function SuccessContent() {
  const searchParams = useSearchParams();
  const clearCart = useCartStore((state) => state.clearCart);
  const orderNumber = searchParams.get('order')?.trim() ?? '';

  useEffect(() => {
    clearCart();
  }, [clearCart]);

  return (
    <main className="flex min-h-screen flex-col items-center bg-white px-6 py-32 text-center text-black">
      <div className="max-w-md">
        <h1 className="mb-6 text-4xl font-light uppercase tracking-widest">Order Confirmed</h1>
        <p className="mb-4 text-sm uppercase tracking-[0.2em] text-neutral-500">Order Number</p>
        <p className="mb-8 text-2xl font-light uppercase tracking-widest md:text-3xl">
          {orderNumber || '315-XXXXXX'}
        </p>
        <p className="mb-12 text-sm text-neutral-500">
          We&apos;ll send updates to your WhatsApp as your delivery moves.
        </p>

        <div className="space-y-4">
          <Link
            href={orderNumber ? `/track?order=${encodeURIComponent(orderNumber)}` : '/track'}
            className="block w-full border border-black py-4 text-sm uppercase tracking-widest transition-colors hover:bg-black hover:text-white"
          >
            Track Order
          </Link>
          <Link
            href="/shop"
            className="block w-full bg-black py-4 text-sm uppercase tracking-widest text-white transition-colors hover:bg-neutral-800"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    </main>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense>
      <SuccessContent />
    </Suspense>
  );
}
