'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';

import { supabaseBrowser } from '@/lib/supabase';
import type { Order } from '@/lib/types';

type AdminStats = {
  totalRevenue: number;
  totalOrders: number;
  totalProducts: number;
  todayOrders: number;
};

type RecentOrder = Pick<
  Order,
  'id' | 'order_number' | 'customer_name' | 'status' | 'total' | 'created_at'
>;

const DEFAULT_STATS: AdminStats = {
  totalRevenue: 0,
  totalOrders: 0,
  totalProducts: 0,
  todayOrders: 0,
};

const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  confirmed: 'bg-blue-100 text-blue-800',
  processing: 'bg-indigo-100 text-indigo-800',
  shipped: 'bg-purple-100 text-purple-800',
  delivered: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
};

const formatNaira = (value: number) => `\u20A6${value.toLocaleString('en-NG')}`;

const formatDateTime = (value: string) => {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return '\u2014';
  }

  const day = date.getDate().toString().padStart(2, '0');
  const month = date.toLocaleString('en-GB', { month: 'short' });
  const hour = date.getHours().toString().padStart(2, '0');
  const minute = date.getMinutes().toString().padStart(2, '0');

  return `${day} ${month} ${hour}:${minute}`;
};

const parseNumber = (value: unknown) =>
  typeof value === 'number' && Number.isFinite(value) ? value : 0;

export default function AdminPage() {
  const [stats, setStats] = useState<AdminStats>(DEFAULT_STATS);
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    const loadDashboard = async () => {
      const [statsResult, ordersResult] = await Promise.all([
        fetch('/api/admin/stats', { cache: 'no-store' }),
        supabaseBrowser
          .from('orders')
          .select('id, order_number, customer_name, status, total, created_at')
          .order('created_at', { ascending: false })
          .limit(5),
      ]);

      if (!active) {
        return;
      }

      if (statsResult.ok) {
        const payload = (await statsResult.json()) as Partial<AdminStats>;
        setStats({
          totalRevenue: parseNumber(payload.totalRevenue),
          totalOrders: parseNumber(payload.totalOrders),
          totalProducts: parseNumber(payload.totalProducts),
          todayOrders: parseNumber(payload.todayOrders),
        });
      } else {
        setStats(DEFAULT_STATS);
      }

      if (ordersResult.error) {
        setRecentOrders([]);
      } else {
        setRecentOrders((ordersResult.data ?? []) as RecentOrder[]);
      }

      setLoading(false);
    };

    void loadDashboard().catch(() => {
      if (!active) {
        return;
      }

      setStats(DEFAULT_STATS);
      setRecentOrders([]);
      setLoading(false);
    });

    return () => {
      active = false;
    };
  }, []);

  const statCards = useMemo(
    () => [
      { label: 'Total Revenue', value: formatNaira(stats.totalRevenue) },
      { label: 'Total Orders', value: stats.totalOrders.toLocaleString('en-NG') },
      { label: 'Active Products', value: stats.totalProducts.toLocaleString('en-NG') },
      { label: 'New Today', value: stats.todayOrders.toLocaleString('en-NG') },
    ],
    [stats]
  );

  return (
    <div className="p-5 md:p-8">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-xl font-light uppercase tracking-widest">Dashboard</h1>
        <div className="flex flex-wrap gap-2">
          <Link
            href="/admin/orders/new"
            className="bg-black px-4 py-2 text-xs uppercase tracking-widest text-white transition-colors hover:bg-neutral-800"
          >
            New Manual Order
          </Link>
          <Link
            href="/admin/quick-sale"
            className="border border-black px-4 py-2 text-xs uppercase tracking-widest text-black transition-colors hover:bg-black hover:text-white"
          >
            Quick Sale
          </Link>
        </div>
      </div>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {statCards.map((card) => (
          <article key={card.label} className="border border-neutral-200 bg-white p-5">
            <p className="text-[10px] uppercase tracking-widest text-neutral-500">{card.label}</p>
            {loading ? (
              <div className="mt-3 h-8 w-28 animate-pulse bg-neutral-200" />
            ) : (
              <p className="mt-3 text-3xl font-light tracking-wide">{card.value}</p>
            )}
          </article>
        ))}
      </section>

      <section className="mt-8 border border-neutral-200 bg-white p-5">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xs uppercase tracking-widest text-neutral-500">Recent Orders</h2>
          <Link
            href="/admin/orders"
            className="text-xs uppercase tracking-widest text-neutral-500 underline hover:text-black"
          >
            View All
          </Link>
        </div>

        {loading ? (
          <p className="text-sm text-neutral-400">Loading...</p>
        ) : recentOrders.length === 0 ? (
          <p className="py-8 text-center text-sm uppercase tracking-widest text-neutral-400">
            No orders yet
          </p>
        ) : (
          <div className="space-y-2">
            {recentOrders.map((order) => (
              <Link
                key={order.id}
                href={`/admin/orders/${order.id}`}
                className="flex flex-col gap-2 border border-neutral-200 p-3 transition-colors hover:border-black sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-medium tracking-wider">{order.order_number}</span>
                    <span
                      className={`rounded-sm px-2 py-0.5 text-[10px] uppercase tracking-widest ${
                        STATUS_COLORS[order.status] ?? 'bg-neutral-100 text-neutral-600'
                      }`}
                    >
                      {order.status}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-neutral-600">{order.customer_name ?? 'Unknown'}</p>
                </div>
                <div className="flex items-center gap-4 text-sm">
                  <span>{formatNaira(order.total ?? 0)}</span>
                  <span className="text-xs text-neutral-500">{formatDateTime(order.created_at)}</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
