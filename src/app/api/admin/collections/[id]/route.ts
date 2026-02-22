import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { supabaseServer } from '@/lib/supabase';
import { invalidateCollectionCache } from '@/lib/invalidate-cache';

export const dynamic = 'force-dynamic';

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
    try {
        const cookieStore = cookies();
        const adminSession = cookieStore.get('315fabrics_admin_session')?.value;

        if (!adminSession || adminSession !== process.env.ADMIN_SESSION_SECRET) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();

        // Using single to return the record so we can invalidate by its explicit slug 
        const { data: updatedCollection, error } = await supabaseServer
            .from('collections')
            .update(body)
            .eq('id', params.id)
            .select('slug')
            .single();

        if (error) {
            console.error('Failed to update collection:', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        if (updatedCollection) {
            // Invalidate the cache for this collection
            await invalidateCollectionCache(updatedCollection.slug);
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Collection update exception:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
    try {
        const cookieStore = cookies();
        const adminSession = cookieStore.get('315fabrics_admin_session')?.value;

        if (!adminSession || adminSession !== process.env.ADMIN_SESSION_SECRET) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Retrieve slug before deletion for invalidator reference
        const { data: collectionToDel } = await supabaseServer
            .from('collections')
            .select('slug')
            .eq('id', params.id)
            .single();

        const { error } = await supabaseServer
            .from('collections')
            .delete()
            .eq('id', params.id);

        if (error) {
            console.error('Failed to delete collection:', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        if (collectionToDel) {
            // Invalidate the cache
            await invalidateCollectionCache(collectionToDel.slug);
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Collection delete exception:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
