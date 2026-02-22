import Link from 'next/link';
import Image from 'next/image';

import { supabaseServer } from '@/lib/supabase';
import type { Category } from '@/lib/types';

export const dynamic = 'force-dynamic';

type CategoryCard = Pick<Category, 'id' | 'name' | 'slug'> & { image_url: string | null };

export default async function CollectionsPage() {
    const { data: categories, error } = await supabaseServer
        .from('categories')
        .select('id, name, slug, image_url')
        .order('sort_order', { ascending: true });

    if (error) {
        throw new Error(error.message);
    }

    const cards = (categories ?? []) as CategoryCard[];

    return (
        <main className="min-h-screen bg-brand-cream py-24 px-6 text-black md:px-12">
            <h1 className="mb-12 text-4xl font-display font-light uppercase tracking-widest md:text-5xl border-b border-brand-gold/20 pb-6">Shop by Fabric Type</h1>
            <div className="grid grid-cols-2 gap-6 md:grid-cols-3 md:gap-8">
                {cards.map((category) => (
                    <Link
                        key={category.id}
                        href={`/shop/${category.slug}`}
                        className="group relative block overflow-hidden"
                    >
                        <div className="relative aspect-[4/5]">
                            {category.image_url ? (
                                <Image
                                    src={category.image_url}
                                    alt={category.name}
                                    fill
                                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                                    sizes="(max-width: 768px) 50vw, 33vw"
                                />
                            ) : (
                                <div className="h-full w-full bg-brand-dark" />
                            )}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                            <div className="absolute bottom-0 left-0 right-0 p-6">
                                <p className="text-sm uppercase tracking-widest text-white md:text-base">{category.name}</p>
                                <span className="mt-2 block text-xs uppercase tracking-widest text-brand-gold transition-all group-hover:translate-x-1">
                                    Shop &rarr;
                                </span>
                            </div>
                        </div>
                    </Link>
                ))}
            </div>
            {cards.length === 0 && (
                <p className="mt-10 text-sm uppercase tracking-widest text-neutral-500">
                    Categories coming soon.
                </p>
            )}
        </main>
    );
}
