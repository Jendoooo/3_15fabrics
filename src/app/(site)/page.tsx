import Link from 'next/link';
import Image from 'next/image';
import ProductCard from '@/components/ProductCard';
import FadeIn from '@/components/FadeIn';
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

      if (featuredProductsError) throw new Error(featuredProductsError.message);

      const products = (featuredProducts ?? []) as FeaturedProduct[];
      const productIds = products.map((p) => p.id);

      let productImageMap: Record<string, string> = {};
      if (productIds.length > 0) {
        const { data: productImages, error: productImagesError } = await supabaseServer
          .from('product_images')
          .select('product_id, image_url, sort_order')
          .in('product_id', productIds)
          .eq('is_primary', true)
          .order('sort_order', { ascending: true });

        if (productImagesError) throw new Error(productImagesError.message);

        productImageMap = ((productImages ?? []) as ProductPrimaryImage[]).reduce<Record<string, string>>(
          (acc, img) => {
            if (img.product_id && !acc[img.product_id]) acc[img.product_id] = img.image_url;
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

      if (featuredCollectionsError) throw new Error(featuredCollectionsError.message);

      return {
        products,
        productImageMap,
        collections: (featuredCollections ?? []) as FeaturedCollection[],
      };
    },
    300
  );

  return (
    <main className="bg-white">
      {/* Hero — text-based until real photos available */}
      <section className="flex min-h-screen flex-col items-center justify-center bg-black px-6 text-center text-white">
        <p className="mb-6 text-[10px] uppercase tracking-[0.5em] text-neutral-500">
          Est. Epe, Lagos
        </p>
        <h1 className="font-extralight uppercase leading-none tracking-[0.12em] text-white text-[clamp(3rem,11vw,8rem)]">
          315 Fabrics
        </h1>
        <p className="mt-6 max-w-sm text-sm font-light uppercase tracking-[0.25em] text-neutral-400">
          Premium Asoebi Fabrics &amp; Materials
        </p>
        <div className="mt-12 flex flex-col gap-4 sm:flex-row">
          <Link
            href="/shop"
            className="border border-white px-10 py-4 text-xs uppercase tracking-[0.3em] text-white transition-all hover:bg-white hover:text-black"
          >
            Shop All Fabrics
          </Link>
          <Link
            href="/collections"
            className="border border-white/30 px-10 py-4 text-xs uppercase tracking-[0.3em] text-white/60 transition-all hover:border-white hover:text-white"
          >
            Browse Categories
          </Link>
        </div>
      </section>

      {/* Pillars strip */}
      <section className="border-y border-neutral-200 bg-neutral-50 px-6 py-6 md:px-12">
        <div className="flex flex-col items-center justify-center gap-4 text-center text-xs uppercase tracking-widest md:flex-row md:gap-12">
          <span>Sourced Globally</span>
          <span className="hidden md:inline">·</span>
          <span>Sold in Epe, Lagos</span>
          <span className="hidden md:inline">·</span>
          <span>Premium Fabrics</span>
        </div>
      </section>

      {/* Latest Arrivals */}
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
            {products.map((product) => (
              <ProductCard
                key={product.id}
                slug={product.slug}
                name={product.name}
                price={Number(product.price)}
                imageUrl={productImageMap[product.id] ?? null}
              />
            ))}
          </div>
          {products.length === 0 && (
            <p className="mt-10 text-center text-sm uppercase tracking-widest text-neutral-500">
              New fabric listings coming soon.
            </p>
          )}
        </FadeIn>
      </section>

      {/* Shop by Category */}
      <section className="bg-neutral-50 px-6 py-24 text-black md:px-12">
        <FadeIn delay={0.1}>
          <div className="mb-12 flex items-end justify-between">
            <h2 className="text-3xl font-light uppercase tracking-widest">Shop by Category</h2>
            <Link
              href="/collections"
              className="border-b border-black pb-1 text-sm uppercase tracking-widest transition-colors hover:text-neutral-500"
            >
              All Categories
            </Link>
          </div>
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            {collections.map((collection) => (
              <article key={collection.id} className="group">
                <Link href={`/collections/${collection.slug}`} className="block">
                  <div className="relative aspect-video overflow-hidden bg-neutral-900">
                    {collection.cover_image ? (
                      <Image
                        src={collection.cover_image}
                        alt={collection.name}
                        fill
                        sizes="(max-width: 768px) 100vw, 33vw"
                        className="object-cover object-top transition-transform duration-300 group-hover:scale-[1.02]"
                      />
                    ) : null}
                    <div className="absolute inset-0 flex items-end bg-gradient-to-t from-black/70 to-transparent p-5">
                      <h3 className="text-sm uppercase tracking-widest text-white">
                        {collection.name}
                      </h3>
                    </div>
                  </div>
                </Link>
              </article>
            ))}
          </div>
          {collections.length === 0 && (
            <p className="mt-10 text-center text-sm uppercase tracking-widest text-neutral-500">
              Categories coming soon.
            </p>
          )}
        </FadeIn>
      </section>

      {/* Instagram CTA */}
      <section className="bg-black py-20 text-center text-white">
        <FadeIn>
          <h2 className="text-2xl font-light uppercase tracking-widest">Follow Us on Instagram</h2>
          <p className="mt-4 text-sm text-neutral-400">
            New fabrics, asoebi sets, and behind-the-scenes — first on Instagram.
          </p>
          <a
            href="https://instagram.com/3_15fabrics"
            target="_blank"
            rel="noreferrer"
            className="mt-8 inline-block border border-white px-8 py-3 text-sm uppercase tracking-widest transition-colors hover:bg-white hover:text-black"
          >
            @3_15fabrics
          </a>
        </FadeIn>
      </section>
    </main>
  );
}
