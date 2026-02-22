import { NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { email, whatsapp_number, first_name, last_name, source } = body;

        if (!email && !whatsapp_number) {
            return NextResponse.json(
                { error: 'Email or WhatsApp number is required' },
                { status: 400 }
            );
        }

        const { data, error } = await supabaseServer
            .from('contacts')
            .upsert(
                {
                    email,
                    whatsapp_number,
                    first_name,
                    last_name,
                    source,
                },
                { onConflict: email ? 'email' : 'whatsapp_number' }
            )
            .select()
            .single();

        if (error) {
            console.error('Error upserting contact:', error);
            return NextResponse.json({ error: 'Failed to create contact' }, { status: 500 });
        }

        return NextResponse.json({ success: true, id: data.id }, { status: 200 });
    } catch (err) {
        console.error('Request processing error:', err);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
