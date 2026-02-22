import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase';
import { sendOrderStatusUpdate } from '@/lib/email';

// Auth check — same pattern as middleware
function isAuthenticated(req: NextRequest): boolean {
  const session = req.cookies.get('iby_admin_session')?.value;
  return session === process.env.ADMIN_SESSION_SECRET;
}

// WhatsApp status messages via Fonnte
const WA_STATUS_MESSAGES: Record<string, string> = {
  confirmed: 'has been confirmed and is being prepared',
  processing: 'is being packed and prepared for shipment',
  shipped: '🚚 has been SHIPPED and is on its way to you',
  delivered: '✅ has been DELIVERED. Thank you for shopping with iby_closet!',
  cancelled: 'has been cancelled. Please contact us if you have questions.',
};

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  if (!isAuthenticated(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { status, note } = await req.json() as { status: string; note?: string };

    if (!status) {
      return NextResponse.json({ error: 'Status is required' }, { status: 400 });
    }

    // 1. Fetch current order for customer details
    const { data: order, error: fetchError } = await supabaseServer
      .from('orders')
      .select('id, order_number, customer_name, customer_email, customer_whatsapp, status')
      .eq('id', params.id)
      .single();

    if (fetchError || !order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    // 2. Update order status
    const { error: updateError } = await supabaseServer
      .from('orders')
      .update({ status })
      .eq('id', params.id);

    if (updateError) {
      return NextResponse.json({ error: 'Failed to update status' }, { status: 500 });
    }

    // 3. Insert delivery tracking row (always, even without a note)
    await supabaseServer.from('delivery_tracking').insert({
      order_id: params.id,
      status,
      note: note?.trim() || null,
      updated_by: 'ibrahim',
    });

    // 4. Notify customer — run in parallel, don't fail the response if these error
    const notifications: Promise<void>[] = [];

    // Email notification
    if (order.customer_email) {
      notifications.push(
        sendOrderStatusUpdate(order.customer_email, order.order_number, status, note?.trim())
          .catch((err) => console.error('[Notify] Email failed:', err))
      );
    }

    // WhatsApp notification via Fonnte
    // Note: env var may be NEXT_PUBLIC_FONNTE_TOKEN (set at login time) or FONNTE_TOKEN (server-only)
    const fonnteToken = process.env.FONNTE_TOKEN ?? process.env.NEXT_PUBLIC_FONNTE_TOKEN;
    if (order.customer_whatsapp && fonnteToken && fonnteToken !== 'placeholder') {
      const statusText = WA_STATUS_MESSAGES[status] ?? `has been updated to: ${status}`;
      const firstName = (order.customer_name ?? 'there').split(' ')[0];
      const message = [
        `Hi ${firstName}! Your iby_closet order *${order.order_number}* ${statusText}.`,
        note?.trim() ? `\n📝 Note: ${note.trim()}` : '',
        `\nTrack your order: https://iby-closet.com/track?order=${order.order_number}`,
      ].join('');

      notifications.push(
        fetch('https://api.fonnte.com/send', {
          method: 'POST',
          headers: { Authorization: fonnteToken },
          body: new URLSearchParams({
            target: order.customer_whatsapp,
            message,
            countryCode: '234',
          }),
        })
          .then(async (r) => {
            if (!r.ok) console.error('[Fonnte] WhatsApp send failed:', await r.text());
          })
          .catch((err) => console.error('[Fonnte] WhatsApp error:', err))
      );
    }

    await Promise.allSettled(notifications);

    return NextResponse.json({ success: true, notified: Boolean(order.customer_email || order.customer_whatsapp) });
  } catch (err) {
    console.error('[Admin Orders PATCH] Error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
