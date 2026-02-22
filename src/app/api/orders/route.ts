import { NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase';

type CartItem = {
    product_id: string | null;
    variant_id: string | null;
    product_name: string;
    size: string | null;
    color: string | null;
    quantity: number;
    unit_price: number;
    yards_ordered?: number;
};

// Generate non-guessable order number: 315-YYYY-XXXXXX
// Uses random alphanumeric (no ambiguous chars like 0/O, 1/I)
function generateRandomCode(length: number): string {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    return Array.from({ length }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
}

async function generateOrderNumber(): Promise<string> {
    const year = new Date().getFullYear();

    for (let attempt = 0; attempt < 5; attempt++) {
        const code = generateRandomCode(6);
        const orderNumber = `315-${year}-${code}`;

        const { data } = await supabaseServer
            .from('orders')
            .select('order_number')
            .eq('order_number', orderNumber)
            .maybeSingle();

        if (!data) return orderNumber;
    }

    // Fallback: timestamp-based (virtually no collision risk)
    return `315-${year}-${Date.now().toString(36).toUpperCase().slice(-6)}`;
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const {
            customer_name, customer_email, customer_phone, customer_whatsapp,
            delivery_address, items, delivery_fee, payment_method, payment_reference
        } = body;

        if (!items || !Array.isArray(items) || items.length === 0) {
            return NextResponse.json({ error: 'Order items are required' }, { status: 400 });
        }

        // 1) Generate sequence/order number
        const order_number = await generateOrderNumber();

        // Calculate subtotal and total
        const subtotal = items.reduce((sum: number, item: CartItem) => sum + (item.quantity * item.unit_price), 0);
        const total = subtotal + (delivery_fee || 0);

        // 2) Insert order
        const { data: orderData, error: orderError } = await supabaseServer
            .from('orders')
            .insert({
                order_number,
                customer_name,
                customer_email,
                customer_phone,
                customer_whatsapp,
                delivery_address,
                subtotal,
                delivery_fee,
                total,
                payment_method,
                payment_reference: payment_reference || null,
                source: 'website',
                status: 'pending',
                payment_status: 'unpaid'
            })
            .select('id, order_number')
            .single();

        if (orderError) {
            console.error('Failed to create order:', orderError);
            return NextResponse.json({ error: 'Failed to create order' }, { status: 500 });
        }

        // 3) Insert order items
        const orderItemsToInsert = items.map((item: CartItem) => ({
            order_id: orderData.id,
            product_id: item.product_id,
            variant_id: item.variant_id,
            product_name: item.product_name,
            size: item.size,
            color: item.color,
            quantity: item.quantity,
            unit_price: item.unit_price,
            yards_ordered: item.yards_ordered ?? item.quantity
        }));

        const { error: itemsError } = await supabaseServer
            .from('order_items')
            .insert(orderItemsToInsert);

        if (itemsError) {
            console.error('Failed to insert order items:', itemsError);
            // We don't fail the whole request but we log it
        }

        // 4) Decrement stock for ordered variants
        try {
            await Promise.all(
                items.map(async (item: CartItem) => {
                    if (!item.variant_id) return;

                    // Fetch current stock
                    const { data: variant } = await supabaseServer
                        .from('product_variants')
                        .select('stock_quantity')
                        .eq('id', item.variant_id)
                        .single();

                    if (variant) {
                        // Subtract and floor at 0
                        const newStock = Math.max(0, variant.stock_quantity - item.quantity);
                        await supabaseServer
                            .from('product_variants')
                            .update({ stock_quantity: newStock })
                            .eq('id', item.variant_id);
                    }
                })
            );
        } catch (decrementError) {
            console.error('Failed to decrement stock:', decrementError);
            // Non-blocking error, do not fail order
        }

        // 5) Upsert customer into contacts for marketing
        if (customer_email || customer_whatsapp) {
            // Split name safely
            const names = (customer_name || '').split(' ');
            const firstName = names[0] || '';
            const lastName = names.slice(1).join(' ') || '';

            await supabaseServer
                .from('contacts')
                .upsert(
                    {
                        email: customer_email,
                        whatsapp_number: customer_whatsapp,
                        first_name: firstName,
                        last_name: lastName,
                        source: 'checkout',
                    },
                    { onConflict: customer_email ? 'email' : 'whatsapp_number' }
                );
        }

        // 6) Email is sent from the Paystack webhook after payment is confirmed
        // (avoids duplicate emails — webhook handles charge.success)

        // 7) Return order details
        return NextResponse.json({
            success: true,
            order_number: orderData.order_number,
            order_id: orderData.id
        }, { status: 200 });

    } catch (err) {
        console.error('Order creation error:', err);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
