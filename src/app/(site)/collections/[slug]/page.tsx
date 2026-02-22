import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { format } from 'date-fns';

import ProductCard from '@/components/ProductCard';

import { supabaseServer } from '@/lib/supabase';
import { cachedFetch } from '@/lib/cache';
import type { Collection, Product, ProductImage } from '@/lib/types';

type CollectionRecord = Pick<
  Collection,
  'id' | 'name' | 'slug' | 'description' | 'cover_image' | 'release_date'
>;
type CollectionProduct = Pick<Product, 'id' | 'name' | 'slug' | 'price'>;
type ProductPrimaryImage = Pick<ProductImage, 'product_id' | 'image_url' | 'sort_order'>;



async function getCollectionBySlug(slug: string) {
  return cachedFetch(`collection_by_slug:${slug}`, async () => {
    const { data, error } = await supabaseServer
      .from('collections')
      .select('*')
      .eq('slug', slug)
      .single();
    return { data, error };
  });
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const { data: collection } = await getCollectionBySlug(params.slug);

  if (!collection) {
    return { title: 'Collection Not Found' };
  }

  const title = `${collection.name} — 315 Fabrics`;
  const description = (collection.description ?? `Explore the ${collection.name} collection at 315 Fabrics`).substring(0, 160);

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: collection.cover_image ? [collection.cover_image] : [],
    },
  };
}

export default async function CollectionDetailPage({
  params,
}: {
  params: { slug: string };
}) {
  const { data: collection, error: collectionError } = await getCollectionBySlug(params.slug);

  if (collectionError || !collection) {
    notFound();
  }

  const collectionData = collection as CollectionRecord;

  const { data: products, error: productsError } = await supabaseServer
    .from('products')
    .select('id, name, slug, price')
    .eq('collection_id', collectionData.id)
    .eq('status', 'active')
    .order('created_at', { ascending: false });

  if (productsError) {
    throw new Error(productsError.message);
  }

  const collectionProducts = (products ?? []) as CollectionProduct[];
  const productIds = collectionProducts.map((product) => product.id);

  let productImageMap: Record<string, string> = {};

  if (productIds.length > 0) {
    const { data: productImages, error: productImagesError } = await supabaseServer
      .from('product_images')
      .select('product_id, image_url, sort_order')
      .in('product_id', productIds)
      .eq('is_primary', true)
      .order('sort_order', { ascending: true });

    if (productImagesError) {
      throw new Error(productImagesError.message);
    }

    productImageMap = ((productImages ?? []) as ProductPrimaryImage[]).reduce<Record<string, string>>(
      (acc, image) => {
        if (image.product_id && !acc[image.product_id]) {
          acc[image.product_id] = image.image_url;
        }

        return acc;
      },
      {}
    );
  }

  const COLLECTION_FALLBACK: Record<string, string> = {
    'rhythm-and-thread': '/images/instagram/post_22.jpg',
    'back-in-the-90s': '/images/instagram/post_24.jpg',
    'default': '/images/instagram/post_20.jpg'
  };

  return (
    <main className="min-h-screen bg-white text-black">
      <section className="relative flex min-h-[60vh] items-end bg-black">
        <Image
          src={collectionData.cover_image ?? COLLECTION_FALLBACK[collectionData.slug] ?? COLLECTION_FALLBACK['default']}
          alt={collectionData.name}
          fill
          priority
          className="object-cover object-top"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
        <div className="relative z-10 w-full px-8 pb-12 md:px-12 md:pb-16">
          <p className="mb-3 text-xs uppercase tracking-widest text-neutral-400">
            Collection
          </p>
          <h1 className="mb-4 text-4xl font-light uppercase tracking-widest text-white md:text-6xl">
            {collectionData.name}
          </h1>
          {collectionData.description ? (
            <p className="mb-4 max-w-xl text-sm leading-relaxed text-neutral-300">
              {collectionData.description}
            </p>
          ) : null}
          {collectionData.release_date ? (
            <p className="text-xs uppercase tracking-widest text-neutral-400">
              Released {format(new Date(collectionData.release_date), 'MMMM yyyy')}
            </p>
          ) : null}
        </div>
      </section>

      <section className="px-6 py-20 md:px-12">
        <div className="mb-10 flex items-end justify-between">
          <h2 className="text-3xl font-light uppercase tracking-widest">Collection Pieces</h2>
          <Link
            href="/collections"
            className="border-b border-black pb-1 text-sm uppercase tracking-widest transition-colors hover:text-neutral-500"
          >
            All Collections
          </Link>
        </div>

        {collectionProducts.length === 0 ? (
          <p className="py-12 text-center text-sm uppercase tracking-widest text-neutral-500">
            Collection arriving soon.
          </p>
        ) : (
          <div className="grid grid-cols-2 gap-x-8 gap-y-16 lg:grid-cols-4">
            {collectionProducts.map((product) => {
              const imageUrl = productImageMap[product.id] ?? null;
              return (
                <ProductCard
                  key={product.id}
                  slug={product.slug}
                  name={product.name}
                  price={Number(product.price)}
                  imageUrl={imageUrl}
                />
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}
