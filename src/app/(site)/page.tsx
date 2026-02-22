import Image from 'next/image';
import Link from 'next/link';
import ProductCard from '@/components/ProductCard';
import FadeIn from '@/components/FadeIn';
import LookbookStrip from './_components/LookbookStrip';

import { supabaseServer } from '@/lib/supabase';
import { cachedFetch } from '@/lib/cache';
import type { Collection, Product, ProductImage } from '@/lib/types';

export const dynamic = 'force-dynamic';

type FeaturedProduct = Pick<Product, 'id' | 'name' | 'slug' | 'price'>;
type FeaturedCollection = Pick<Collection, 'id' | 'name' | 'slug' | 'cover_image'>;
type ProductPrimaryImage = Pick<ProductImage, 'product_id' | 'image_url' | 'sort_order'>;

export default async function Home() {
  const { products, productImageMap, collections } = await cachedFetch(
    'home:featured',
    async () => {
      const { data: featuredProducts, error: featuredProductsError } = await supabaseServer
        .from('products')
        .select('id, name, slug, price')
        .eq('is_featured', true)
        .eq('status', 'active')
        .limit(6);

      if (featuredProductsError) {
        throw new Error(featuredProductsError.message);
      }

      const products = (featuredProducts ?? []) as FeaturedProduct[];
      const productIds = products.map((product) => product.id);

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

      const { data: featuredCollections, error: featuredCollectionsError } = await supabaseServer
        .from('collections')
        .select('id, name, slug, cover_image')
        .eq('is_featured', true)
        .in('status', ['active', 'upcoming'])
        .limit(3);

      if (featuredCollectionsError) {
        throw new Error(featuredCollectionsError.message);
      }

      const collections = (featuredCollections ?? []) as FeaturedCollection[];

      return { products, productImageMap, collections };
    },
    300
  );

  const FALLBACK_PRODUCT_IMAGES = [
    '/images/instagram/product_101.jpg',
    '/images/instagram/product_102.jpg',
    '/images/instagram/product_103.jpg',
    '/images/instagram/product_104.jpg',
    '/images/instagram/product_105.jpg',
    '/images/instagram/product_106.jpg',
    '/images/instagram/product_107.jpg',
  ];

  const COLLECTION_FALLBACK: Record<string, string> = {
    'rhythm-and-thread': '/images/instagram/post_22.jpg',
    'back-in-the-90s': '/images/instagram/post_24.jpg',
    'default': '/images/instagram/post_20.jpg',
  };

  return (
    <main className="bg-white">
      <section className="relative h-screen overflow-hidden">
        <Image
          src="/images/instagram/post_16.jpg"
          alt="Rhythm & Thread — iby_closet"
          fill
          priority
          sizes="100vw"
          className="object-cover object-[center_25%]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent md:bg-gradient-to-l md:from-black/75 md:via-black/30 md:to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 z-10 px-8 pb-12 md:left-auto md:right-0 md:max-w-2xl md:px-16 md:pb-20 md:text-right">
          <p className="mb-3 text-[10px] uppercase tracking-[0.4em] text-white/50">
            Current Collection
          </p>
          <h1 className="font-extralight uppercase leading-[0.9] tracking-[0.08em] text-white text-[clamp(3rem,12vw,7rem)]">
            Rhythm<br />&amp;<br />Thread
          </h1>
          <div className="mt-8 md:flex md:justify-end">
            <Link
              href="/collections/rhythm-and-thread"
              className="inline-flex items-center gap-3 border border-white/70 px-7 py-3.5 text-[10px] uppercase tracking-[0.3em] text-white transition-all hover:bg-white hover:text-black hover:border-white"
            >
              Explore Collection
              <span className="text-white/50 group-hover:text-black">→</span>
            </Link>
          </div>
        </div>
      </section>

      <section className="border-y border-neutral-200 bg-neutral-50 px-6 py-6 md:px-12">
        <div className="flex flex-col items-center justify-center gap-4 text-center text-xs uppercase tracking-widest md:flex-row md:gap-12">
          <span>Designed in Lagos</span>
          <span className="hidden md:inline">·</span>
          <span>Founder-Led</span>
          <span className="hidden md:inline">·</span>
          <span>Themed Collections</span>
        </div>
      </section>

      <section className="bg-white px-6 py-24 text-black md:px-12">
        <FadeIn>
          <div className="mb-12 flex items-end justify-between">
            <h2 className="text-3xl font-light uppercase tracking-widest">Latest Arrivals</h2>
            <Link
              href="/shop"
              className="border-b border-black pb-1 text-sm uppercase tracking-widest transition-colors hover:text-neutral-500"
            >
              View All
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
            {products.map((product, i) => {
              const imageUrl = productImageMap[product.id] ?? FALLBACK_PRODUCT_IMAGES[i % 7];
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
          {products.length === 0 ? (
            <p className="mt-10 text-center text-sm uppercase tracking-widest text-neutral-500">
              No featured products yet.
            </p>
          ) : null}
        </FadeIn>
      </section>

      <section className="bg-white py-12">
        <FadeIn>
          <div className="mb-8 flex items-end justify-between px-6 md:px-12">
            <h2 className="text-3xl font-light uppercase tracking-widest">The Lookbook</h2>
            <Link
              href="/lookbook"
              className="border-b border-black pb-1 text-sm uppercase tracking-widest transition-colors hover:text-neutral-500"
            >
              View All
            </Link>
          </div>
          <LookbookStrip />
        </FadeIn>
      </section>

      <section className="bg-white px-6 pb-24 text-black md:px-12">
        <FadeIn delay={0.1}>
          <div className="mb-12 flex items-end justify-between">
            <h2 className="text-3xl font-light uppercase tracking-widest">Featured Collections</h2>
            <Link
              href="/collections"
              className="border-b border-black pb-1 text-sm uppercase tracking-widest transition-colors hover:text-neutral-500"
            >
              View Collections
            </Link>
          </div>
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            {collections.map((collection) => (
              <article key={collection.id} className="group">
                <Link href={`/collections/${collection.slug}`} className="block">
                  <div className="relative aspect-video overflow-hidden bg-neutral-900">
                    <Image
                      src={collection.cover_image ?? COLLECTION_FALLBACK[collection.slug] ?? COLLECTION_FALLBACK['default']}
                      alt={collection.name}
                      fill
                      sizes="(max-width: 768px) 100vw, 33vw"
                      className="object-cover object-top transition-transform duration-300 group-hover:scale-[1.02]"
                    />
                  </div>
                  <h3 className="mt-4 text-sm uppercase tracking-widest">{collection.name}</h3>
                </Link>
              </article>
            ))}
          </div>
          {collections.length === 0 ? (
            <p className="mt-10 text-center text-sm uppercase tracking-widest text-neutral-500">
              No featured collections yet.
            </p>
          ) : null}
        </FadeIn>
      </section>

      <section className="bg-black text-white">
        <div className="grid grid-cols-1 md:grid-cols-2 min-h-[70vh]">
          <div className="relative min-h-[50vh] md:min-h-auto overflow-hidden">
            <Image
              src="/images/instagram/product_100.jpg"
              alt="Ibrahim Hamed — iby_closet founder"
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover object-top"
            />
            <div className="absolute inset-0 bg-black/20" />
          </div>
          <div className="flex flex-col justify-center px-8 py-16 md:px-16">
            <p className="mb-6 text-xs uppercase tracking-widest text-neutral-400">The Founder</p>
            <blockquote className="text-2xl font-light leading-relaxed text-white md:text-3xl">
              &ldquo;African men deserve fashion<br />that tells a story.&rdquo;
            </blockquote>
            <p className="mt-6 text-sm text-neutral-500">
              Ibrahim Hamed — designer, founder, Lagos.
            </p>
            <div className="mt-12">
              <Link
                href="/brand"
                className="inline-block border border-white px-8 py-4 text-xs uppercase tracking-widest text-white transition-colors hover:bg-white hover:text-black"
              >
                Our Story
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-black py-20 text-center text-white">
        <FadeIn>
          <h2 className="text-2xl font-light uppercase tracking-widest">
            Follow the Journey
          </h2>
          <p className="mt-4 text-sm text-neutral-400">
            Behind the scenes, campaign shoots, and new drops — first on Instagram.
          </p>
          <a
            href="https://instagram.com/iby_closet"
            target="_blank"
            rel="noreferrer"
            className="mt-8 inline-block border border-white px-8 py-3 text-sm uppercase tracking-widest transition-colors hover:bg-white hover:text-black"
          >
            @iby_closet
          </a>
        </FadeIn>
      </section>
    </main>
  );
}
