'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabaseBrowser } from '@/lib/supabase';
import type { Collection } from '@/lib/types';

type Props = {
    collection?: Collection;
};

export default function CollectionForm({ collection }: Props) {
    const router = useRouter();
    const isEdit = !!collection;

    const [name, setName] = useState(collection?.name ?? '');
    const [slug, setSlug] = useState(collection?.slug ?? '');
    const [description, setDescription] = useState(collection?.description ?? '');
    const [coverImage, setCoverImage] = useState(collection?.cover_image ?? '');
    const [status, setStatus] = useState(collection?.status ?? 'draft');
    const [releaseDate, setReleaseDate] = useState(collection?.release_date ?? '');
    const [isFeatured, setIsFeatured] = useState(collection?.is_featured ?? false);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');

    const autoSlug = (n: string) =>
        n.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

    const handleNameChange = (v: string) => {
        setName(v);
        if (!isEdit) setSlug(autoSlug(v));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSaving(true);

        const payload = {
            name,
            slug,
            description: description || null,
            cover_image: coverImage || null,
            status,
            release_date: releaseDate || null,
            is_featured: isFeatured,
        };

        if (isEdit) {
            const { error: updateError } = await supabaseBrowser
                .from('collections')
                .update(payload)
                .eq('id', collection!.id);
            if (updateError) {
                setError(updateError.message);
                setSaving(false);
                return;
            }
        } else {
            const { error: insertError } = await supabaseBrowser
                .from('collections')
                .insert(payload);
            if (insertError) {
                setError(insertError.message);
                setSaving(false);
                return;
            }
        }

        router.push('/admin/collections');
    };

    return (
        <form onSubmit={handleSubmit} className="w-full max-w-2xl space-y-8">
            <section className="space-y-4">
                <h2 className="text-xs uppercase tracking-widest text-neutral-500">Collection Details</h2>

                <div>
                    <label className="mb-1 block text-xs uppercase tracking-widest">Name *</label>
                    <input value={name} onChange={(e) => handleNameChange(e.target.value)} required
                        className="w-full border border-neutral-300 p-2.5 text-sm focus:border-black focus:outline-none" />
                </div>

                <div>
                    <label className="mb-1 block text-xs uppercase tracking-widest">Slug *</label>
                    <input value={slug} onChange={(e) => setSlug(e.target.value)} required
                        className="w-full border border-neutral-300 p-2.5 text-sm font-mono focus:border-black focus:outline-none" />
                </div>

                <div>
                    <label className="mb-1 block text-xs uppercase tracking-widest">Description</label>
                    <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={4}
                        className="w-full resize-none border border-neutral-300 p-2.5 text-sm focus:border-black focus:outline-none" />
                </div>

                <div>
                    <label className="mb-1 block text-xs uppercase tracking-widest">Cover Image URL</label>
                    <input value={coverImage} onChange={(e) => setCoverImage(e.target.value)} placeholder="https://res.cloudinary.com/..."
                        className="w-full border border-neutral-300 p-2.5 text-sm focus:border-black focus:outline-none" />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="mb-1 block text-xs uppercase tracking-widest">Status</label>
                        <select value={status} onChange={(e) => setStatus(e.target.value)}
                            className="w-full border border-neutral-300 bg-white p-2.5 text-sm focus:border-black focus:outline-none">
                            <option value="draft">Draft</option>
                            <option value="upcoming">Upcoming</option>
                            <option value="active">Active</option>
                            <option value="archived">Archived</option>
                        </select>
                    </div>
                    <div>
                        <label className="mb-1 block text-xs uppercase tracking-widest">Release Date</label>
                        <input type="date" value={releaseDate} onChange={(e) => setReleaseDate(e.target.value)}
                            className="w-full border border-neutral-300 p-2.5 text-sm focus:border-black focus:outline-none" />
                    </div>
                </div>

                <label className="flex items-center gap-2 text-sm">
                    <input type="checkbox" checked={isFeatured} onChange={(e) => setIsFeatured(e.target.checked)} className="h-4 w-4" />
                    Featured collection (highlighted on homepage/nav)
                </label>
            </section>

            {error && <p className="text-sm text-red-500">{error}</p>}

            <div className="flex gap-4">
                <button type="submit" disabled={saving}
                    className="bg-black px-8 py-3 text-sm uppercase tracking-widest text-white hover:bg-neutral-800 disabled:opacity-50">
                    {saving ? 'Saving…' : isEdit ? 'Save Changes' : 'Create Collection'}
                </button>
                <button type="button" onClick={() => router.push('/admin/collections')}
                    className="px-8 py-3 text-sm uppercase tracking-widest text-neutral-500 hover:text-black">
                    Cancel
                </button>
            </div>
        </form>
    );
}
