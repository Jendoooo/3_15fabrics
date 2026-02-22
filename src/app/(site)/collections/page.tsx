import Image from 'next/image';
import Link from 'next/link';

import { supabaseServer } from '@/lib/supabase';
import type { Collection } from '@/lib/types';
import NotifyMeButton from './_components/NotifyMeButton';
import { StaggerContainer, StaggerItem } from '@/components/StaggerChildren';

export const dynamic = 'force-dynamic';

type CollectionCard = Pick<Collection, 'id' | 'name' | 'slug' | 'description' | 'cover_image' | 'status'>;

export default async function CollectionsPage() {
    const { data: collections, error } = await supabaseServer
        .from('collections')
        .select('id, name, slug, description, cover_image, status')
        .in('status', ['active', 'upcoming'])
        .order('release_date', { ascending: false, nullsFirst: false });

    if (error) {
        throw new Error(error.message);
    }

    const cards = (collections ?? []) as CollectionCard[];

    const COLLECTION_FALLBACK: Record<string, string> = {
        'rhythm-and-thread': '/images/instagram/post_22.jpg',
        'back-in-the-90s': '/images/instagram/post_24.jpg',
        'default': '/images/instagram/post_20.jpg'
    };

    return (
        <main className="min-h-screen bg-black py-24 px-6 text-white md:px-12">
            <h1 className="mb-12 text-4xl font-light uppercase tracking-widest md:text-5xl">Campaigns & Collections</h1>
            <StaggerContainer className="grid grid-cols-1 gap-12 md:grid-cols-2">
                {cards.map((collection) => {
                    const isUpcoming = collection.status === 'upcoming';

                    return (
                        <StaggerItem key={collection.id}>
                            <article className="group rounded-sm border border-white/10 bg-white/5 p-4">
                                <Link href={`/collections/${collection.slug}`} className="block">
                                    <div className="relative aspect-video overflow-hidden bg-neutral-900">
                                        <Image
                                            src={collection.cover_image ?? COLLECTION_FALLBACK[collection.slug] ?? COLLECTION_FALLBACK['default']}
                                            alt={collection.name}
                                            fill
                                            sizes="(max-width: 768px) 100vw, 50vw"
                                            className="object-cover object-top transition-transform duration-300 group-hover:scale-[1.02]"
                                        />
                                    </div>
                                    <div className="mt-5 space-y-3">
                                        <div className="flex items-center justify-between gap-4">
                                            <h2 className="text-lg uppercase tracking-widest">{collection.name}</h2>
                                            {isUpcoming ? (
                                                <span className="rounded-sm border border-amber-400/70 bg-amber-500/10 px-2 py-1 text-[11px] uppercase tracking-widest text-amber-300">
                                                    Upcoming
                                                </span>
                                            ) : null}
                                        </div>
                                        <p className="line-clamp-2 text-sm font-light leading-relaxed text-neutral-300">
                                            {collection.description ?? 'A new chapter in elevated menswear.'}
                                        </p>
                                        {!isUpcoming ? (
                                            <span className="inline-block text-sm uppercase tracking-widest text-white/90">
                                                Explore
                                            </span>
                                        ) : null}
                                    </div>
                                </Link>
                                {isUpcoming ? <NotifyMeButton collectionId={collection.id} /> : null}
                            </article>
                        </StaggerItem>
                    );
                })}
            </StaggerContainer>
        </main>
    );
}
