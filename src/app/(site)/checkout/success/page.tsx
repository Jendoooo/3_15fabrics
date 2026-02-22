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
    <main className="flex min-h-screen flex-col items-center bg-brand-cream px-6 py-32 text-center text-brand-dark">
      <div className="max-w-md border border-brand-gold/30 bg-white/60 px-8 py-10 shadow-sm backdrop-blur-sm">
        <h1 className="mb-6 font-display text-4xl font-light uppercase tracking-widest">Order Confirmed</h1>
        <p className="mb-4 text-sm uppercase tracking-[0.2em] text-brand-earth">Order Number</p>
        <p className="mb-8 text-2xl font-light uppercase tracking-widest text-brand-forest md:text-3xl">
          {orderNumber || '315-XXXXXX'}
        </p>
        <p className="mb-3 text-sm text-brand-earth">Your fabric order has been confirmed.</p>
        <p className="mb-12 text-sm text-brand-earth">
          We will send you a WhatsApp message to confirm delivery timing.
        </p>

        <div className="space-y-4">
          <Link
            href={orderNumber ? `/track?order=${encodeURIComponent(orderNumber)}` : '/track'}
            className="block w-full border border-brand-forest py-4 text-sm uppercase tracking-widest text-brand-forest transition-colors hover:bg-brand-forest hover:text-white"
          >
            Track Order
          </Link>
          <Link
            href="/shop"
            className="block w-full bg-brand-forest py-4 text-sm uppercase tracking-widest text-white transition-colors hover:bg-brand-dark"
          >
            Back to Shop
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
