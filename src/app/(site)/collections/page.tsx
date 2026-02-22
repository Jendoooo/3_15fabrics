import Link from 'next/link';

import { supabaseServer } from '@/lib/supabase';
import type { Category } from '@/lib/types';

export const dynamic = 'force-dynamic';

export default async function CollectionsPage() {
    const { data: categories, error } = await supabaseServer
        .from('categories')
        .select('id, name, slug')
        .order('sort_order', { ascending: true });

    if (error) {
        throw new Error(error.message);
    }

    const cards = (categories ?? []) as Pick<Category, 'id' | 'name' | 'slug'>[];

    return (
        <main className="min-h-screen bg-white py-24 px-6 text-black md:px-12">
            <h1 className="mb-12 text-4xl font-light uppercase tracking-widest md:text-5xl border-b border-neutral-200 pb-6">Shop by Fabric Type</h1>
            <div className="grid grid-cols-2 gap-6 md:grid-cols-3 md:gap-12">
                {cards.map((category) => (
                    <Link
                        key={category.id}
                        href={`/shop/${category.slug}`}
                        className="group flex aspect-square flex-col justify-center items-center border border-neutral-200 p-8 transition-colors hover:border-black"
                    >
                        <p className="text-center text-lg uppercase tracking-widest">{category.name}</p>
                        <span className="mt-4 block text-xs uppercase tracking-widest text-neutral-400 text-center transition-all group-hover:text-black group-hover:translate-x-1">
                            Shop &rarr;
                        </span>
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
