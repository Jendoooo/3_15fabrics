'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabaseBrowser } from '@/lib/supabase';
import type { Order, OrderItem, DeliveryTracking } from '@/lib/types';

const STATUSES = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];

const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  confirmed: 'bg-blue-100 text-blue-800',
  processing: 'bg-indigo-100 text-indigo-800',
  shipped: 'bg-purple-100 text-purple-800',
  delivered: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
};

export default function AdminOrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [order, setOrder] = useState<Order | null>(null);
  const [items, setItems] = useState<OrderItem[]>([]);
  const [tracking, setTracking] = useState<DeliveryTracking[]>([]);
  const [loading, setLoading] = useState(true);
  const [newStatus, setNewStatus] = useState('');
  const [trackingNote, setTrackingNote] = useState('');
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState('');

  useEffect(() => {
    const load = async () => {
      const [{ data: o }, { data: i }, { data: t }] = await Promise.all([
        supabaseBrowser.from('orders').select('*').eq('id', id).single(),
        supabaseBrowser.from('order_items').select('*').eq('order_id', id),
        supabaseBrowser.from('delivery_tracking').select('*').eq('order_id', id).order('updated_at', { ascending: true }),
      ]);
      if (o) { setOrder(o as Order); setNewStatus((o as Order).status); }
      setItems((i ?? []) as OrderItem[]);
      setTracking((t ?? []) as DeliveryTracking[]);
      setLoading(false);
    };
    load();
  }, [id]);

  const handleUpdate = async () => {
    if (!order || saving) return;
    setSaving(true);
    setSaveMsg('');

    try {
      const res = await fetch(`/api/admin/orders/${order.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus, note: trackingNote.trim() || undefined }),
      });

      if (!res.ok) throw new Error('Update failed');

      const { notified } = await res.json() as { notified: boolean };

      // Refresh tracking timeline
      const { data: t } = await supabaseBrowser.from('delivery_tracking').select('*').eq('order_id', id).order('updated_at', { ascending: true });
      setTracking((t ?? []) as DeliveryTracking[]);
      setTrackingNote('');
      setOrder({ ...order, status: newStatus });
      setSaveMsg(notified ? 'Saved · Customer notified' : 'Saved');
    } catch {
      setSaveMsg('Error — try again');
    }

    setSaving(false);
    setTimeout(() => setSaveMsg(''), 3000);
  };

  const formatNaira = (v: number | null) => v ? `₦${v.toLocaleString('en-NG')}` : '—';
  const formatDate = (s: string) => new Date(s).toLocaleString('en-NG', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });

  if (loading) return <div className="p-8 text-sm text-neutral-400">Loading…</div>;
  if (!order) return <div className="p-8 text-sm text-red-500">Order not found.</div>;

  const address = order.delivery_address as Record<string, string> | null;

  return (
    <div className="p-5 md:p-8 max-w-3xl">
      <div className="mb-6 flex items-center gap-4">
        <button onClick={() => router.back()} className="text-sm text-neutral-400 hover:text-black">← Back</button>
        <h1 className="text-xl font-light uppercase tracking-widest">{order.order_number}</h1>
        <span className={`px-2 py-1 text-xs uppercase tracking-widest rounded-sm ${STATUS_COLORS[order.status] ?? 'bg-neutral-100'}`}>
          {order.status}
        </span>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        {/* Customer */}
        <div className="border border-neutral-200 bg-white p-5">
          <h2 className="mb-3 text-xs uppercase tracking-widest text-neutral-500">Customer</h2>
          <p className="text-sm font-medium">{order.customer_name ?? '—'}</p>
          <p className="text-sm text-neutral-600">{order.customer_email ?? '—'}</p>
          <p className="text-sm text-neutral-600">{order.customer_phone ?? '—'}</p>
          {order.customer_whatsapp && <p className="text-sm text-neutral-600">WA: {order.customer_whatsapp}</p>}
        </div>

        {/* Delivery address */}
        <div className="border border-neutral-200 bg-white p-5">
          <h2 className="mb-3 text-xs uppercase tracking-widest text-neutral-500">Delivery Address</h2>
          {address ? (
            <div className="text-sm text-neutral-700 space-y-0.5">
              <p>{address.street}</p>
              <p>{address.city}, {address.state}</p>
              {address.lga && <p>{address.lga}</p>}
            </div>
          ) : <p className="text-sm text-neutral-400">No address</p>}
        </div>

        {/* Order items */}
        <div className="border border-neutral-200 bg-white p-5 sm:col-span-2">
          <h2 className="mb-3 text-xs uppercase tracking-widest text-neutral-500">Items</h2>
          <div className="divide-y divide-neutral-100">
            {items.map((item) => (
              <div key={item.id} className="flex justify-between py-2 text-sm">
                <div>
                  <span className="font-medium">{item.product_name}</span>
                  {item.size && <span className="ml-2 text-neutral-500">Size: {item.size}</span>}
                  {item.color && <span className="ml-2 text-neutral-500">{item.color}</span>}
                  <span className="ml-2 text-neutral-500">x{item.quantity}</span>
                </div>
                <span>{formatNaira(item.unit_price)}</span>
              </div>
            ))}
          </div>
          <div className="mt-3 space-y-1 border-t border-neutral-200 pt-3 text-sm">
            <div className="flex justify-between text-neutral-500">
              <span>Subtotal</span><span>{formatNaira(order.subtotal)}</span>
            </div>
            <div className="flex justify-between text-neutral-500">
              <span>Delivery</span><span>{formatNaira(order.delivery_fee)}</span>
            </div>
            <div className="flex justify-between font-medium">
              <span>Total</span><span>{formatNaira(order.total)}</span>
            </div>
            <div className="flex justify-between text-neutral-500 pt-1">
              <span>Payment</span>
              <span className={order.payment_status === 'paid' ? 'text-green-600' : 'text-red-500'}>
                {order.payment_status} · {order.payment_method ?? '—'}
              </span>
            </div>
          </div>
        </div>

        {/* Update status */}
        <div className="border border-neutral-200 bg-white p-5">
          <h2 className="mb-3 text-xs uppercase tracking-widest text-neutral-500">Update Status</h2>
          <select
            value={newStatus}
            onChange={(e) => setNewStatus(e.target.value)}
            className="mb-3 w-full border border-neutral-300 bg-white p-2 text-sm focus:border-black focus:outline-none"
          >
            {STATUSES.map((s) => (
              <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
            ))}
          </select>
          <textarea
            value={trackingNote}
            onChange={(e) => setTrackingNote(e.target.value)}
            placeholder="Tracking note (optional)"
            rows={2}
            className="mb-3 w-full border border-neutral-300 p-2 text-sm focus:border-black focus:outline-none resize-none"
          />
          <button
            onClick={handleUpdate}
            disabled={saving}
            className="w-full bg-black py-2 text-xs uppercase tracking-widest text-white hover:bg-neutral-800 disabled:opacity-50"
          >
            {saving ? 'Saving…' : saveMsg || 'Save Update'}
          </button>
        </div>

        {/* Tracking timeline */}
        <div className="border border-neutral-200 bg-white p-5">
          <h2 className="mb-3 text-xs uppercase tracking-widest text-neutral-500">Timeline</h2>
          {tracking.length === 0 ? (
            <p className="text-sm text-neutral-400">No updates yet.</p>
          ) : (
            <ol className="space-y-4">
              {[...tracking].reverse().map((t) => (
                <li key={t.id} className="relative pl-5 text-sm">
                  <span className="absolute left-0 top-1.5 h-2 w-2 rounded-full bg-black" />
                  <p className="font-medium uppercase tracking-wider text-xs">{t.status}</p>
                  {t.note && <p className="text-neutral-600">{t.note}</p>}
                  <p className="text-xs text-neutral-400">{formatDate(t.updated_at)}</p>
                </li>
              ))}
            </ol>
          )}
        </div>
      </div>
    </div>
  );
}
