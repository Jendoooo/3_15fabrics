import { notFound } from 'next/navigation';
import { supabaseServer } from '@/lib/supabase';
import type { Collection } from '@/lib/types';
import CollectionForm from '../../_components/CollectionForm';

export default async function EditCollectionPage({ params }: { params: { id: string } }) {
    const { data: collection, error } = await supabaseServer
        .from('collections')
        .select('*')
        .eq('id', params.id)
        .single();

    if (error || !collection) {
        notFound();
    }

    return (
        <div className="p-5 md:p-8">
            <h1 className="mb-8 text-xl font-light uppercase tracking-widest">Edit Collection</h1>
            <CollectionForm collection={collection as Collection} />
        </div>
    );
}
