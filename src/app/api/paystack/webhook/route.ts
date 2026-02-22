import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { supabaseServer } from '@/lib/supabase';

const secret = process.env.PAYSTACK_SECRET_KEY || '';

export async function POST(request: Request) {
    try {
        // Read the raw body text for HMAC validation
        const bodyText = await request.text();
        const signature = request.headers.get('x-paystack-signature');

        if (!signature) {
            return NextResponse.json({ error: 'Missing signature' }, { status: 401 });
        }

        if (!secret) {
            console.error('[Paystack] PAYSTACK_SECRET_KEY is not configured');
            return NextResponse.json({ error: 'Webhook not configured' }, { status: 500 });
        }

        // Verify signature
        const hash = crypto.createHmac('sha512', secret).update(bodyText).digest('hex');
        if (hash !== signature) {
            return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
        }

        const event = JSON.parse(bodyText);

        // Handle charge.success event
        if (event.event === 'charge.success') {
            const { reference } = event.data;

            if (reference) {
                // Find the order by payment reference
                // Note: we'll assume the client passed the order reference when initializing paystack
                // Or we assume the reference in Payload matches our payment_reference in DB
                const { data: order, error: orderError } = await supabaseServer
                    .from('orders')
                    .select('id')
                    .eq('payment_reference', reference)
                    .single();

                if (order && !orderError) {
                    // Update order status
                    const { data: updatedOrder } = await supabaseServer
                        .from('orders')
                        .update({
                            payment_status: 'paid',
                            status: 'confirmed'
                        })
                        .eq('id', order.id)
                        .select('order_number, customer_email, total')
                        .single();

                    // Add tracking note
                    await supabaseServer
                        .from('delivery_tracking')
                        .insert({
                            order_id: order.id,
                            status: 'confirmed',
                            note: 'Payment confirmed via Paystack',
                            updated_by: 'system'
                        });

                    // Send confirmation email if they have an email on file
                    if (updatedOrder?.customer_email) {
                        const { data: items } = await supabaseServer
                            .from('order_items')
                            .select('product_name, size, quantity, unit_price')
                            .eq('order_id', order.id);

                        if (items && items.length > 0) {
                            import('@/lib/email').then(({ sendOrderConfirmation }) => {
                                const formattedItems = items.map((i) => ({
                                    name: i.product_name || 'Item',
                                    size: i.size,
                                    qty: i.quantity || 1,
                                    price: Number(i.unit_price) || 0
                                }));
                                sendOrderConfirmation(
                                    updatedOrder.customer_email || '',
                                    updatedOrder.order_number || '',
                                    formattedItems,
                                    Number(updatedOrder.total) || 0
                                ).catch(e => console.error('Webhook email dispatch failed', e));
                            }).catch(e => console.error('Failed to import email library in webhook', e));
                        }
                    }
                }
            }
        }

        return NextResponse.json({ received: true }, { status: 200 });
    } catch (err) {
        console.error('Webhook error:', err);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
