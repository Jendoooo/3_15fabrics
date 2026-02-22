import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase';

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { email, whatsapp_number, collection_id, product_id } = body;

        if (!email && !whatsapp_number) {
            return NextResponse.json(
                { error: 'Either email or whatsapp_number must be provided' },
                { status: 400 }
            );
        }

        const { error } = await supabaseServer.from('waitlist').insert({
            email: email || null,
            whatsapp_number: whatsapp_number || null,
            collection_id: collection_id || null,
            product_id: product_id || null,
        });

        if (error) {
            console.error('Waitlist insertion error:', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ success: true }, { status: 201 });
    } catch (error) {
        console.error('Waitlist processing error:', error);
        return NextResponse.json(
            { error: 'Failed to process waitlist request' },
            { status: 500 }
        );
    }
}
