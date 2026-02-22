'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabaseBrowser } from '@/lib/supabase';
import type { Collection } from '@/lib/types';

const STATUS_COLORS: Record<string, string> = {
    active: 'bg-green-100 text-green-700',
    upcoming: 'bg-amber-100 text-amber-700',
    draft: 'bg-neutral-100 text-neutral-500',
    archived: 'bg-neutral-200 text-neutral-600',
};

export default function AdminCollectionsPage() {
    const [collections, setCollections] = useState<Collection[]>([]);
    const [loading, setLoading] = useState(true);

    const load = async () => {
        setLoading(true);
        const { data } = await supabaseBrowser
            .from('collections')
            .select('*')
            .order('created_at', { ascending: false });
        setCollections((data ?? []) as Collection[]);
        setLoading(false);
    };

    useEffect(() => { load(); }, []);

    const handleDelete = async (id: string, name: string) => {
        if (!confirm(`Delete "${name}"? This cannot be undone.`)) return;
        await supabaseBrowser.from('collections').delete().eq('id', id);
        setCollections((prev) => prev.filter((c) => c.id !== id));
    };

    return (
        <div className="p-5 md:p-8">
            <div className="mb-6 flex items-center justify-between">
                <h1 className="text-xl font-light uppercase tracking-widest">Collections</h1>
                <Link
                    href="/admin/collections/new"
                    className="bg-black px-4 py-2 text-xs uppercase tracking-widest text-white hover:bg-neutral-800"
                >
                    + Add Collection
                </Link>
            </div>

            {loading ? (
                <p className="text-sm text-neutral-400">Loading…</p>
            ) : collections.length === 0 ? (
                <div className="py-16 text-center">
                    <p className="mb-4 text-sm uppercase tracking-widest text-neutral-400">No collections yet</p>
                    <Link href="/admin/collections/new" className="text-sm underline">Add your first collection</Link>
                </div>
            ) : (
                <div className="space-y-2">
                    {collections.map((collection) => (
                        <div
                            key={collection.id}
                            className="flex items-center gap-4 border border-neutral-200 bg-white p-4"
                        >
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 flex-wrap">
                                    <span className="text-sm font-medium">{collection.name}</span>
                                    <span className={`px-2 py-0.5 text-[10px] uppercase tracking-widest rounded-sm ${STATUS_COLORS[collection.status] ?? 'bg-neutral-100'}`}>
                                        {collection.status.replace('_', ' ')}
                                    </span>
                                </div>
                                {collection.release_date && (
                                    <p className="mt-0.5 text-sm text-neutral-500">Release: {collection.release_date}</p>
                                )}
                            </div>
                            <div className="flex items-center gap-3">
                                <Link
                                    href={`/admin/collections/${collection.id}`}
                                    className="text-xs uppercase tracking-widest text-neutral-500 underline hover:text-black"
                                >
                                    Edit
                                </Link>
                                <button
                                    onClick={() => handleDelete(collection.id, collection.name)}
                                    className="text-xs uppercase tracking-widest text-red-400 hover:text-red-600"
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
