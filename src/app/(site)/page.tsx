import Link from 'next/link';
import ProductCard from '@/components/ProductCard';
import FadeIn from '@/components/FadeIn';
import { supabaseServer } from '@/lib/supabase';
import { cachedFetch } from '@/lib/cache';
import type { Category, Product, ProductImage } from '@/lib/types';

export const dynamic = 'force-dynamic';

type FeaturedProduct = Pick<Product, 'id' | 'name' | 'slug' | 'price'>;
type FabricCategory = Pick<Category, 'id' | 'name' | 'slug'>;
type ProductPrimaryImage = Pick<ProductImage, 'product_id' | 'image_url' | 'sort_order'>;

export default async function Home() {
  let products: FeaturedProduct[] = [];
  let productImageMap: Record<string, string> = {};
  let categories: FabricCategory[] = [];

  try {
    const data = await cachedFetch(
      'home:featured',
      async () => {
        const { data: featuredProducts } = await supabaseServer
          .from('products')
          .select('id, name, slug, price')
          .eq('is_featured', true)
          .eq('status', 'active')
          .limit(6);

        const prods = (featuredProducts ?? []) as FeaturedProduct[];
        const productIds = prods.map((p) => p.id);

        let imgMap: Record<string, string> = {};
        if (productIds.length > 0) {
          const { data: productImages } = await supabaseServer
            .from('product_images')
            .select('product_id, image_url, sort_order')
            .in('product_id', productIds)
            .eq('is_primary', true)
            .order('sort_order', { ascending: true });

          imgMap = ((productImages ?? []) as ProductPrimaryImage[]).reduce<Record<string, string>>(
            (acc, img) => {
              if (img.product_id && !acc[img.product_id]) acc[img.product_id] = img.image_url;
              return acc;
            },
            {}
          );
        }

        const { data: featuredCategories } = await supabaseServer
          .from('categories')
          .select('id, name, slug')
          .order('sort_order', { ascending: true })
          .limit(6);

        return {
          products: prods,
          productImageMap: imgMap,
          categories: (featuredCategories ?? []) as FabricCategory[],
        };
      },
      300
    );

    products = data.products;
    productImageMap = data.productImageMap;
    categories = data.categories;
  } catch (err) {
    console.error('[Homepage] Failed to load featured data:', err);
  }

  return (
    <main className="bg-white">
      {/* Hero — warm brand identity */}
      <section className="flex min-h-screen flex-col items-center justify-center bg-brand-cream px-6 text-center">
        <p className="mb-6 text-[10px] uppercase tracking-[0.5em] text-brand-gold">
          Est. Epe, Lagos
        </p>
        <h1 className="font-display font-light uppercase leading-none tracking-[0.08em] text-brand-dark text-[clamp(3rem,11vw,8rem)]">
          315 Fabrics
        </h1>
        <p className="mt-6 max-w-md text-lg font-display italic text-brand-earth">
          Every great outfit starts with great fabric
        </p>
        <p className="mt-3 text-xs uppercase tracking-[0.3em] text-brand-gold/70">
          Curated by Ayodeji &mdash; Epe, Lagos
        </p>
        <div className="mt-12 flex flex-col gap-4 sm:flex-row">
          <Link
            href="/shop"
            className="bg-brand-forest px-10 py-4 text-xs uppercase tracking-[0.3em] text-white transition-all hover:bg-brand-forest/90"
          >
            Shop All Fabrics
          </Link>
          <Link
            href="/shop"
            className="border border-brand-gold px-10 py-4 text-xs uppercase tracking-[0.3em] text-brand-gold transition-all hover:bg-brand-gold hover:text-white"
          >
            Browse Categories
          </Link>
        </div>
      </section>

      {/* Pillars strip */}
      <section className="border-y border-brand-gold/20 bg-brand-cream px-6 py-6 md:px-12">
        <div className="flex flex-col items-center justify-center gap-4 text-center text-xs uppercase tracking-widest text-brand-earth md:flex-row md:gap-12">
          <span>Sourced Globally</span>
          <span className="hidden md:inline text-brand-gold">·</span>
          <span>Sold in Epe, Lagos</span>
          <span className="hidden md:inline text-brand-gold">·</span>
          <span>Premium Fabrics</span>
        </div>
      </section>

      {/* Latest Arrivals */}
      <section className="bg-white px-6 py-24 text-brand-dark md:px-12">
        <FadeIn>
          <div className="mb-12 flex items-end justify-between">
            <h2 className="text-3xl font-display font-light uppercase tracking-widest">Latest Arrivals</h2>
            <Link
              href="/shop"
              className="border-b border-brand-earth pb-1 text-sm uppercase tracking-widest transition-colors hover:text-brand-gold"
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
      <section className="bg-brand-cream px-6 py-24 text-brand-dark md:px-12">
        <FadeIn delay={0.1}>
          <div className="mb-12 flex items-end justify-between">
            <h2 className="text-3xl font-display font-light uppercase tracking-widest">Shop by Category</h2>
            <Link
              href="/shop"
              className="border-b border-brand-earth pb-1 text-sm uppercase tracking-widest transition-colors hover:text-brand-gold"
            >
              All Categories
            </Link>
          </div>
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            {categories.map((category) => (
              <article key={category.id} className="group">
                <Link href={`/shop/${category.slug}`} className="block">
                  <div className="flex aspect-video items-center justify-center bg-brand-dark border border-transparent transition-all duration-300 group-hover:scale-[1.02] group-hover:border-brand-gold">
                    <h3 className="text-sm uppercase tracking-widest text-white text-center">
                      {category.name}
                    </h3>
                  </div>
                </Link>
              </article>
            ))}
          </div>
          {categories.length === 0 && (
            <p className="mt-10 text-center text-sm uppercase tracking-widest text-neutral-500">
              Categories coming soon.
            </p>
          )}
        </FadeIn>
      </section>

      {/* Instagram CTA */}
      <section className="bg-brand-dark py-20 text-center text-white">
        <FadeIn>
          <h2 className="text-2xl font-display font-light uppercase tracking-widest">Follow Us on Instagram</h2>
          <p className="mt-4 text-sm text-neutral-400">
            New fabrics, asoebi sets, and behind-the-scenes — first on Instagram.
          </p>
          <a
            href="https://instagram.com/3_15fabrics"
            target="_blank"
            rel="noreferrer"
            className="mt-8 inline-block border border-brand-gold px-8 py-3 text-sm uppercase tracking-widest text-brand-gold transition-colors hover:bg-brand-gold hover:text-white"
          >
            @3_15fabrics
          </a>
        </FadeIn>
      </section>
    </main>
  );
}
