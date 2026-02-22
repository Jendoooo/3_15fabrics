import { NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase';
import { sendAbandonedCartRecovery } from '@/lib/email';

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { email, whatsapp_number, cart_data } = body;

        if (!email && !whatsapp_number) {
            return NextResponse.json(
                { error: 'Email or WhatsApp number is required' },
                { status: 400 }
            );
        }

        // 1. Send Email Recovery
        if (email) {
            await sendAbandonedCartRecovery(email);
        }

        // 2. Send WhatsApp Recovery via Fonnte
        if (whatsapp_number && process.env.NEXT_PUBLIC_FONNTE_TOKEN) {
            const message = `Hi from iby_closet! We noticed you left some items in your cart. You can complete your purchase securely by returning to your cart: https://iby-closet.com/cart`;

            try {
                await fetch('https://api.fonnte.com/send', {
                    method: 'POST',
                    headers: {
                        Authorization: process.env.NEXT_PUBLIC_FONNTE_TOKEN,
                    },
                    body: new URLSearchParams({
                        target: whatsapp_number,
                        message: message,
                    }),
                });
            } catch (err) {
                console.error('[Fonnte] Error sending abandoned cart WhatsApp:', err);
            }
        }

        // 3. Log into Supabase
        const { error: dbError } = await supabaseServer
            .from('abandoned_carts')
            .insert([
                {
                    email: email || null,
                    whatsapp_number: whatsapp_number || null,
                    cart_data: cart_data || {},
                },
            ]);

        if (dbError) {
            console.error('[Supabase] Failed to log abandoned cart:', dbError);
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('[API] Error in abandoned-cart/recover:', error);
        return NextResponse.json(
            { error: 'Internal Server Error' },
            { status: 500 }
        );
    }
}
