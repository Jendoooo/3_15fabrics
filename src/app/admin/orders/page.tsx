'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Search } from 'lucide-react';
import { supabaseBrowser } from '@/lib/supabase';
import type { DeliveryTracking, Order } from '@/lib/types';

const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  confirmed: 'bg-blue-100 text-blue-800',
  processing: 'bg-indigo-100 text-indigo-800',
  shipped: 'bg-purple-100 text-purple-800',
  delivered: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
};

const SOURCE_COLORS: Record<string, string> = {
  website: 'bg-neutral-100 text-neutral-600',
  instagram: 'bg-pink-100 text-pink-700',
  whatsapp: 'bg-green-100 text-green-700',
  walk_in: 'bg-orange-100 text-orange-700',
};

const SOURCES = ['all', 'website', 'instagram', 'whatsapp', 'walk_in'];
const STATUSES = ['all', 'pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];
const WA_NOTIFIED_STATUSES = ['confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];

type WhatsAppTrackingRow = Pick<DeliveryTracking, 'order_id' | 'status' | 'updated_by'>;

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [sourceFilter, setSourceFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [whatsAppSentByOrderId, setWhatsAppSentByOrderId] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);
      let query = supabaseBrowser
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });

      if (sourceFilter !== 'all') query = query.eq('source', sourceFilter);
      if (statusFilter !== 'all') query = query.eq('status', statusFilter);

      const { data } = await query;
      const nextOrders = (data ?? []) as Order[];
      setOrders(nextOrders);

      if (nextOrders.length === 0) {
        setWhatsAppSentByOrderId({});
        setLoading(false);
        return;
      }

      const orderIds = nextOrders.map((order) => order.id);
      const { data: trackingRows } = await supabaseBrowser
        .from('delivery_tracking')
        .select('order_id, status, updated_by')
        .in('order_id', orderIds)
        .eq('updated_by', 'admin')
        .in('status', WA_NOTIFIED_STATUSES);

      const sentMap = orderIds.reduce<Record<string, boolean>>((acc, orderId) => {
        acc[orderId] = false;
        return acc;
      }, {});

      ((trackingRows ?? []) as WhatsAppTrackingRow[]).forEach((row) => {
        if (row.order_id) {
          sentMap[row.order_id] = true;
        }
      });

      setWhatsAppSentByOrderId(sentMap);
      setLoading(false);
    };

    fetchOrders();
  }, [sourceFilter, statusFilter]);

  const formatNaira = (v: number | null) => v ? `₦${v.toLocaleString('en-NG')}` : '—';
  const formatDate = (s: string) => new Date(s).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' });

  const filteredOrders = orders.filter((order) => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    const matchNumber = order.order_number?.toLowerCase().includes(term);
    const matchName = order.customer_name?.toLowerCase().includes(term);
    return matchNumber || matchName;
  });

  return (
    <div className="p-5 md:p-8">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-xl font-light uppercase tracking-widest">Orders</h1>
        <div className="flex w-full items-center gap-4 sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
            <input
              type="text"
              placeholder="Search order # or name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full border border-neutral-200 py-2 pl-9 pr-4 text-sm transition-colors focus:border-black focus:outline-none"
            />
          </div>
          <Link
            href="/admin/orders/new"
            className="shrink-0 bg-black px-4 py-2 text-xs uppercase tracking-widest text-white transition-colors hover:bg-neutral-800"
          >
            + New Order
          </Link>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-6 space-y-3">
        <div className="flex flex-wrap gap-2">
          {SOURCES.map((s) => (
            <button
              key={s}
              onClick={() => setSourceFilter(s)}
              className={`px-3 py-1.5 text-xs uppercase tracking-widest transition-colors ${sourceFilter === s ? 'bg-black text-white' : 'bg-white text-neutral-500 border border-neutral-200 hover:border-black'
                }`}
            >
              {s === 'all' ? 'All Sources' : s.replace('_', ' ')}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap gap-2">
          {STATUSES.map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-1.5 text-xs uppercase tracking-widest transition-colors ${statusFilter === s ? 'bg-black text-white' : 'bg-white text-neutral-500 border border-neutral-200 hover:border-black'
                }`}
            >
              {s === 'all' ? 'All Status' : s}
            </button>
          ))}
        </div>
      </div>

      {/* Orders list */}
      {loading ? (
        <p className="text-sm text-neutral-400">Loading orders…</p>
      ) : filteredOrders.length === 0 ? (
        <div className="py-16 text-center">
          <p className="text-sm uppercase tracking-widest text-neutral-400">No orders found</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filteredOrders.map((order) => (
            <Link
              key={order.id}
              href={`/admin/orders/${order.id}`}
              className="flex flex-col gap-2 border border-neutral-200 bg-white p-4 hover:border-black transition-colors sm:flex-row sm:items-center sm:gap-4"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm font-medium tracking-wider">{order.order_number}</span>
                  <span className={`px-2 py-0.5 text-[10px] uppercase tracking-widest rounded-sm ${STATUS_COLORS[order.status] ?? 'bg-neutral-100 text-neutral-600'}`}>
                    {order.status}
                  </span>
                  <span className={`px-2 py-0.5 text-[10px] uppercase tracking-widest rounded-sm ${SOURCE_COLORS[order.source] ?? 'bg-neutral-100 text-neutral-600'}`}>
                    {order.source?.replace('_', ' ')}
                  </span>
                  {order.customer_whatsapp && whatsAppSentByOrderId[order.id] ? (
                    <span className="rounded-sm bg-emerald-100 px-2 py-0.5 text-[10px] uppercase tracking-widest text-emerald-700">
                      WA Sent
                    </span>
                  ) : null}
                </div>
                <p className="mt-1 text-sm text-neutral-600">{order.customer_name ?? 'Unknown'}</p>
              </div>
              <div className="flex items-center gap-4 sm:text-right">
                <span className="text-sm font-medium">{formatNaira(order.total)}</span>
                <span className="text-xs text-neutral-400">{formatDate(order.created_at)}</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
