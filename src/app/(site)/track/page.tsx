'use client';

import { Suspense } from 'react';
import { FormEvent, useCallback, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';

type OrderItem = {
  product_name: string | null;
  size: string | null;
  color: string | null;
  quantity: number | null;
  unit_price: number | null;
};

type TrackingEvent = {
  status: string | null;
  note: string | null;
  updated_at: string;
};

type DeliveryAddress = {
  address_line?: string;
  street?: string;
  city?: string;
  state?: string;
};

type TrackedOrder = {
  order_number: string;
  status: string;
  delivery_address: DeliveryAddress | string | null;
};

type OrderLookupResponse = {
  error?: string;
  order?: TrackedOrder;
  items?: OrderItem[];
  tracking?: TrackingEvent[];
};

const formatNaira = (value: number | null) =>
  `₦${(value ?? 0).toLocaleString('en-NG')}`;

const formatTimestamp = (value: string) =>
  new Date(value).toLocaleString('en-NG', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

const toTitle = (value: string) =>
  value
    .split('_')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');

const getStatusClasses = (status: string) => {
  const normalized = status.toLowerCase();

  if (normalized === 'delivered') {
    return 'border-emerald-300 bg-emerald-50 text-emerald-700';
  }

  if (normalized === 'cancelled') {
    return 'border-red-300 bg-red-50 text-red-700';
  }

  if (normalized === 'pending') {
    return 'border-amber-300 bg-amber-50 text-amber-700';
  }

  return 'border-neutral-300 bg-neutral-100 text-neutral-700';
};

const normalizeAddress = (value: TrackedOrder['delivery_address']) => {
  if (!value) {
    return null;
  }

  if (typeof value === 'string') {
    try {
      return JSON.parse(value) as DeliveryAddress;
    } catch {
      return { address_line: value } satisfies DeliveryAddress;
    }
  }

  return value;
};

function TrackOrderContent() {
  const searchParams = useSearchParams();
  const initialOrder = searchParams.get('order')?.trim().toUpperCase() ?? '';

  const [query, setQuery] = useState(initialOrder);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [order, setOrder] = useState<TrackedOrder | null>(null);
  const [items, setItems] = useState<OrderItem[]>([]);
  const [timeline, setTimeline] = useState<TrackingEvent[]>([]);

  const address = useMemo(() => normalizeAddress(order?.delivery_address ?? null), [order]);

  const fetchOrder = useCallback(async (orderNumber: string) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/orders/${encodeURIComponent(orderNumber)}`);
      const payload = (await response.json()) as OrderLookupResponse;

      if (response.status === 404) {
        setOrder(null);
        setItems([]);
        setTimeline([]);
        setError("We couldn't find that order. Double-check the number and try again.");
        return;
      }

      if (!response.ok || !payload.order) {
        throw new Error(payload.error ?? 'Unable to track order right now.');
      }

      setOrder(payload.order);
      setItems(payload.items ?? []);
      setTimeline(payload.tracking ?? []);
    } catch (fetchError) {
      setOrder(null);
      setItems([]);
      setTimeline([]);
      setError(
        fetchError instanceof Error ? fetchError.message : 'Unable to track order right now.'
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!initialOrder) {
      return;
    }

    void fetchOrder(initialOrder);
  }, [fetchOrder, initialOrder]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const normalized = query.trim().toUpperCase();

    if (!normalized) {
      setError('Please enter an order number.');
      setOrder(null);
      setItems([]);
      setTimeline([]);
      return;
    }

    setQuery(normalized);
    await fetchOrder(normalized);
  };

  return (
    <main className="min-h-screen bg-white px-6 py-24 text-black md:px-12">
      <div className="mx-auto w-full max-w-4xl">
        <div className="mx-auto max-w-xl text-center">
          <h1 className="mb-6 text-4xl font-light uppercase tracking-widest">Track Your Order</h1>
          <p className="mb-8 text-sm text-neutral-500">
            Enter your order number above — format: 315-2026-XXXXXX
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="text"
              value={query}
              onChange={(event) => setQuery(event.target.value.toUpperCase())}
              placeholder="Order Number"
              className="w-full border border-neutral-300 p-4 text-center text-sm transition-colors focus:border-black focus:outline-none"
            />
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-black py-4 text-sm uppercase tracking-widest text-white transition-colors hover:bg-neutral-800 disabled:cursor-not-allowed disabled:bg-neutral-400"
            >
              {loading ? 'Tracking...' : 'Track'}
            </button>
          </form>
        </div>

        {error ? <p className="mt-8 text-center text-sm text-red-600">{error}</p> : null}

        {order ? (
          <div className="mt-12 grid grid-cols-1 gap-10 lg:grid-cols-2">
            <section className="space-y-6">
              <div>
                <p className="text-xs uppercase tracking-widest text-neutral-500">Order Number</p>
                <p className="mt-2 text-xl uppercase tracking-widest">{order.order_number}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-widest text-neutral-500">Current Status</p>
                <span
                  className={`mt-2 inline-block rounded-sm border px-3 py-1 text-xs uppercase tracking-widest ${getStatusClasses(order.status)}`}
                >
                  {toTitle(order.status)}
                </span>
              </div>

              <div>
                <h2 className="mb-3 text-sm uppercase tracking-widest">Items</h2>
                <div className="space-y-3 border-t border-neutral-200 pt-3">
                  {items.map((item, index) => (
                    <div key={`${item.product_name ?? 'item'}-${index}`} className="flex justify-between gap-4 text-sm">
                      <div>
                        <p className="uppercase tracking-wider">{item.product_name ?? 'Item'}</p>
                        <p className="text-neutral-500">
                          {item.size ?? 'N/A'} {item.color ? `• ${item.color}` : ''} • Qty{' '}
                          {item.quantity ?? 0}
                        </p>
                      </div>
                      <p>{formatNaira(item.unit_price)}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h2 className="mb-2 text-sm uppercase tracking-widest">Delivery Address</h2>
                <p className="text-sm text-neutral-600">
                  {[address?.address_line ?? address?.street, address?.city, address?.state]
                    .filter(Boolean)
                    .join(', ') || 'Address not available'}
                </p>
              </div>
            </section>

            <section>
              <h2 className="mb-4 text-sm uppercase tracking-widest">Status Timeline</h2>
              <div className="space-y-4 border-l border-neutral-200 pl-5">
                {timeline.length === 0 ? (
                  <p className="text-sm text-neutral-500">No tracking updates yet.</p>
                ) : (
                  timeline.map((event, index) => (
                    <div key={`${event.updated_at}-${index}`} className="relative pb-2">
                      <span className="absolute -left-[1.7rem] top-1 h-3 w-3 rounded-full bg-black" />
                      <p className="text-sm uppercase tracking-widest">
                        {toTitle(event.status ?? 'Updated')}
                      </p>
                      <p className="mt-1 text-sm text-neutral-600">
                        {event.note ?? 'Status updated'}
                      </p>
                      <p className="mt-1 text-xs text-neutral-500">
                        {formatTimestamp(event.updated_at)}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </section>
          </div>
        ) : null}
      </div>
    </main>
  );
}

export default function TrackOrderPage() {
  return (
    <Suspense>
      <TrackOrderContent />
    </Suspense>
  );
}
