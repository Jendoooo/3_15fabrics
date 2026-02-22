import { NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function GET(
    request: Request,
    { params }: { params: { orderNumber: string } }
) {
    try {
        const { orderNumber } = params;

        if (!orderNumber) {
            return NextResponse.json({ error: 'Order number is required' }, { status: 400 });
        }

        // Fetch order details
        // We intentionally exclude sensitive consumer info like email and phone to make this trackable publicly safely.
        const { data: order, error: orderError } = await supabaseServer
            .from('orders')
            .select('id, order_number, status, payment_status, total, delivery_fee, subtotal, delivery_address, created_at')
            .eq('order_number', orderNumber)
            .single();

        if (orderError || !order) {
            return NextResponse.json({ error: 'Order not found' }, { status: 404 });
        }

        // Fetch order items
        const { data: items } = await supabaseServer
            .from('order_items')
            .select('product_name, size, color, quantity, unit_price')
            .eq('order_id', order.id);

        // Fetch delivery tracking history
        const { data: tracking } = await supabaseServer
            .from('delivery_tracking')
            .select('status, note, updated_at')
            .eq('order_id', order.id)
            .order('updated_at', { ascending: false });

        return NextResponse.json({
            success: true,
            order,
            items: items || [],
            tracking: tracking || []
        }, { status: 200 });

    } catch (err) {
        console.error('Fetch order processing error:', err);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
