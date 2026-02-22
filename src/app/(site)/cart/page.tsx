'use client';

import { FormEvent, useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';

import { useCartStore } from '@/lib/cart-store';

const ABANDONED_CART_WINDOW_MS = 30 * 60 * 1000;
const CART_LAST_ACTIVE_KEY = 'iby_closet_cart_last_active_at';
const CART_RECOVERY_SENT_KEY = 'iby_closet_cart_recovery_sent_at';

const formatNaira = (value: number | string) => {
  const numStr = Number(value).toString();
  return `\u20A6${numStr.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`;
};

export default function CartPage() {
  const items = useCartStore((state) => state.items);
  const subtotal = useCartStore((state) => state.subtotal);
  const updateQuantity = useCartStore((state) => state.updateQuantity);
  const removeItem = useCartStore((state) => state.removeItem);

  const [showRecoveryModal, setShowRecoveryModal] = useState(false);
  const [recoveryEmail, setRecoveryEmail] = useState('');
  const [recoveryWhatsapp, setRecoveryWhatsapp] = useState('');
  const [recoveryState, setRecoveryState] = useState<'idle' | 'loading' | 'success' | 'error'>(
    'idle'
  );
  const [recoveryMessage, setRecoveryMessage] = useState('');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    if (items.length === 0) {
      window.localStorage.removeItem(CART_LAST_ACTIVE_KEY);
      setShowRecoveryModal(false);
      return;
    }

    const now = Date.now();
    const lastActiveRaw = window.localStorage.getItem(CART_LAST_ACTIVE_KEY);
    const recoverySentRaw = window.localStorage.getItem(CART_RECOVERY_SENT_KEY);
    const lastActive = Number(lastActiveRaw ?? 0);
    const recoverySentAt = Number(recoverySentRaw ?? 0);

    const shouldPrompt =
      Number.isFinite(lastActive) &&
      lastActive > 0 &&
      now - lastActive >= ABANDONED_CART_WINDOW_MS &&
      (!Number.isFinite(recoverySentAt) ||
        recoverySentAt <= 0 ||
        now - recoverySentAt >= ABANDONED_CART_WINDOW_MS);

    if (shouldPrompt) {
      setShowRecoveryModal(true);
    }

    window.localStorage.setItem(CART_LAST_ACTIVE_KEY, String(now));
  }, [items]);

  const handleRecoverySubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const email = recoveryEmail.trim();
    const whatsapp = recoveryWhatsapp.trim();

    if (!email && !whatsapp) {
      setRecoveryState('error');
      setRecoveryMessage('Enter an email or WhatsApp number.');
      return;
    }

    setRecoveryState('loading');
    setRecoveryMessage('');

    try {
      const response = await fetch('/api/abandoned-cart/recover', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email || undefined,
          whatsapp_number: whatsapp || undefined,
          cart_data: items,
        }),
      });

      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as { error?: string } | null;
        throw new Error(payload?.error || 'Failed to send recovery link.');
      }

      setRecoveryState('success');
      setRecoveryMessage('Recovery link sent.');
      setShowRecoveryModal(false);
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(CART_RECOVERY_SENT_KEY, String(Date.now()));
      }
    } catch (error) {
      setRecoveryState('error');
      setRecoveryMessage(error instanceof Error ? error.message : 'Failed to send recovery link.');
    }
  };

  if (!mounted) {
    return (
      <main className="mx-auto min-h-screen max-w-7xl bg-white px-6 py-24 text-black md:px-12">
        <h1 className="mb-12 text-4xl font-light uppercase tracking-widest md:text-5xl">Your Cart</h1>
        <div className="flex justify-center border border-neutral-200 px-6 py-10 text-center">
          <span className="text-sm uppercase tracking-widest text-neutral-400">Loading Cart...</span>
        </div>
      </main>
    );
  }

  if (items.length === 0) {
    return (
      <main className="mx-auto min-h-screen max-w-7xl bg-white px-6 py-24 text-black md:px-12">
        <h1 className="mb-12 text-4xl font-light uppercase tracking-widest md:text-5xl">Your Cart</h1>
        <div className="border border-neutral-200 px-6 py-10 text-center">
          <p className="text-sm uppercase tracking-widest text-neutral-600">Your cart is empty</p>
          <Link
            href="/shop"
            className="mt-6 inline-block bg-black px-6 py-3 text-sm uppercase tracking-widest text-white transition-colors hover:bg-neutral-800"
          >
            Continue Shopping
          </Link>
        </div>
      </main>
    );
  }

  return (
    <>
      <main className="mx-auto min-h-screen max-w-7xl bg-white px-6 py-24 text-black md:px-12">
        <h1 className="mb-12 text-4xl font-light uppercase tracking-widest md:text-5xl">Your Cart</h1>

        {recoveryState === 'success' && recoveryMessage ? (
          <div className="mb-6 border border-green-200 bg-green-50 px-4 py-3 text-xs uppercase tracking-widest text-green-700">
            {recoveryMessage}
          </div>
        ) : null}

        {recoveryState === 'error' && recoveryMessage ? (
          <div className="mb-6 border border-red-200 bg-red-50 px-4 py-3 text-xs uppercase tracking-widest text-red-700">
            {recoveryMessage}
          </div>
        ) : null}

        <div className="grid grid-cols-1 gap-16 lg:grid-cols-3">
          <div className="space-y-8 lg:col-span-2">
            {items.map((item) => (
              <article
                key={item.variant_id}
                className="flex flex-col gap-4 border-t border-neutral-200 py-6 sm:flex-row sm:items-start sm:gap-5"
              >
                <div className="relative h-[50px] w-10 shrink-0 overflow-hidden rounded-md bg-neutral-100">
                  {item.image_url ? (
                    <Image
                      src={item.image_url}
                      alt={item.product_name}
                      fill
                      sizes="40px"
                      className="object-cover"
                    />
                  ) : (
                    <span className="sr-only">No image available</span>
                  )}
                </div>
                <div className="flex flex-1 flex-col gap-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <h3 className="text-sm uppercase tracking-widest">
                        {item.slug ? (
                          <Link
                            href={`/products/${item.slug}`}
                            className="transition-colors hover:text-neutral-600"
                          >
                            {item.product_name}
                          </Link>
                        ) : (
                          <span>{item.product_name}</span>
                        )}
                      </h3>
                      <div className="mt-1 space-y-1 text-xs uppercase tracking-widest text-neutral-500">
                        <p>Size: {item.size}</p>
                        {item.color && item.color !== 'Default' ? <p>Color: {item.color}</p> : null}
                        <p>Unit: {formatNaira(item.unit_price)}</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeItem(item.variant_id)}
                      className="text-xs uppercase tracking-widest text-neutral-500 transition-colors hover:text-black"
                    >
                      Remove
                    </button>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center border border-neutral-300">
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.variant_id, item.quantity - 1)}
                        className="h-9 w-9 text-lg text-neutral-700 transition-colors hover:bg-neutral-100"
                      >
                        -
                      </button>
                      <span className="flex h-9 min-w-9 items-center justify-center border-x border-neutral-300 px-2 text-sm">
                        {item.quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.variant_id, item.quantity + 1)}
                        className="h-9 w-9 text-lg text-neutral-700 transition-colors hover:bg-neutral-100"
                      >
                        +
                      </button>
                    </div>
                    <p className="text-sm uppercase tracking-wide text-black">
                      {formatNaira(item.unit_price * item.quantity)}
                    </p>
                  </div>
                </div>
              </article>
            ))}

            <div className="border-t border-neutral-200 pt-6">
              <Link
                href="/shop"
                className="text-xs uppercase tracking-widest text-neutral-600 transition-colors hover:text-black"
              >
                Continue Shopping
              </Link>
            </div>
          </div>

          <div className="h-max bg-neutral-50 p-8 lg:sticky lg:top-24">
            <h2 className="mb-6 text-xl font-light uppercase tracking-widest">Order Summary</h2>
            <div className="mb-8 space-y-4 text-sm">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>{formatNaira(subtotal)}</span>
              </div>
              <p className="text-xs uppercase tracking-widest text-neutral-500">Delivery calculated at checkout</p>
              <div className="flex justify-between border-t border-neutral-200 pt-4 text-base font-bold">
                <span>Total</span>
                <span>{formatNaira(subtotal)}</span>
              </div>
            </div>
            <Link
              href="/checkout"
              className="block w-full bg-black py-4 text-center text-sm uppercase tracking-widest text-white transition-colors hover:bg-neutral-800"
            >
              Proceed to Checkout
            </Link>
          </div>
        </div>
      </main>

      {showRecoveryModal ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
          <div className="w-full max-w-md bg-white p-6 text-black shadow-xl">
            <h2 className="text-base uppercase tracking-widest">Complete Your Order Later</h2>
            <p className="mt-3 text-xs uppercase tracking-widest text-neutral-500">
              We can send your cart recovery link to email or WhatsApp.
            </p>

            <form onSubmit={handleRecoverySubmit} className="mt-5 space-y-3">
              <input
                type="email"
                value={recoveryEmail}
                onChange={(event) => setRecoveryEmail(event.target.value)}
                placeholder="Email"
                className="w-full border border-neutral-300 px-3 py-2 text-sm focus:border-black focus:outline-none"
              />
              <input
                type="tel"
                value={recoveryWhatsapp}
                onChange={(event) => setRecoveryWhatsapp(event.target.value)}
                placeholder="WhatsApp Number"
                className="w-full border border-neutral-300 px-3 py-2 text-sm focus:border-black focus:outline-none"
              />

              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={recoveryState === 'loading'}
                  className="flex-1 bg-black py-2 text-xs uppercase tracking-widest text-white hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {recoveryState === 'loading' ? 'Sending...' : 'Send Recovery Link'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowRecoveryModal(false)}
                  className="px-4 py-2 text-xs uppercase tracking-widest text-neutral-600 hover:text-black"
                >
                  Not Now
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </>
  );
}
