import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { supabaseServer } from '@/lib/supabase';
import { invalidateProductCache } from '@/lib/invalidate-cache';

export const dynamic = 'force-dynamic';

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
    try {
        const cookieStore = cookies();
        const adminSession = cookieStore.get('iby_admin_session')?.value;

        if (!adminSession || adminSession !== process.env.ADMIN_SESSION_SECRET) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();

        // Using single to return the record so we can invalidate by its explicit slug 
        const { data: updatedProduct, error } = await supabaseServer
            .from('products')
            .update(body)
            .eq('id', params.id)
            .select('slug')
            .single();

        if (error) {
            console.error('Failed to update product:', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        if (updatedProduct) {
            // Invalidate the cache for this product
            await invalidateProductCache(updatedProduct.slug);
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Product update exception:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
    try {
        const cookieStore = cookies();
        const adminSession = cookieStore.get('iby_admin_session')?.value;

        if (!adminSession || adminSession !== process.env.ADMIN_SESSION_SECRET) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Retrieve slug before deletion for invalidator reference
        const { data: productToDel } = await supabaseServer
            .from('products')
            .select('slug')
            .eq('id', params.id)
            .single();

        const { error } = await supabaseServer
            .from('products')
            .delete()
            .eq('id', params.id);

        if (error) {
            console.error('Failed to delete product:', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        if (productToDel) {
            // Invalidate the cache
            await invalidateProductCache(productToDel.slug);
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Product delete exception:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
