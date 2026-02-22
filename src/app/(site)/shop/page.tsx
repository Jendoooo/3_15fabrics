import Link from 'next/link';

import { supabaseServer } from '@/lib/supabase';
import { cachedFetch } from '@/lib/cache';
import type { Category, Product, ProductImage } from '@/lib/types';

import ShopFilter from './_components/ShopFilter';

export const dynamic = 'force-dynamic';

type ShopPageProps = {
  searchParams?: {
    gender?: string | string[];
    sort?: string | string[];
  };
};

export default async function ShopPage({ searchParams }: ShopPageProps) {
  const genderParam = Array.isArray(searchParams?.gender)
    ? searchParams?.gender[0]
    : searchParams?.gender;
  const gender =
    genderParam && ['men', 'women', 'unisex'].includes(genderParam)
      ? (genderParam as 'men' | 'women' | 'unisex')
      : null;

  const sortParam = Array.isArray(searchParams?.sort) ? searchParams?.sort[0] : searchParams?.sort;
  const sort = (['newest', 'price-asc', 'price-desc'] as const).includes(sortParam as 'newest' | 'price-asc' | 'price-desc') ? (sortParam as 'newest' | 'price-asc' | 'price-desc') : 'newest';

  const { data: categories, error: categoriesError } = await supabaseServer
    .from('categories')
    .select('id, name, slug')
    .order('name', { ascending: true });

  if (categoriesError) {
    throw new Error(categoriesError.message);
  }

  const { typedProducts, imageMap } = await cachedFetch(
    `shop:products:${gender ?? 'all'}:${sort}`,
    async () => {
      let productsQuery = supabaseServer
        .from('products')
        .select('id, name, slug, price, category_id')
        .eq('status', 'active');

      if (gender) {
        productsQuery = productsQuery.eq('gender', gender);
      }

      if (sort === 'price-asc') productsQuery = productsQuery.order('price', { ascending: true });
      else if (sort === 'price-desc') productsQuery = productsQuery.order('price', { ascending: false });
      else productsQuery = productsQuery.order('created_at', { ascending: false });

      const { data: products, error: productsError } = await productsQuery;

      if (productsError) {
        throw new Error(productsError.message);
      }

      const typedProducts = (products ?? []) as Pick<
        Product,
        'id' | 'name' | 'slug' | 'price' | 'category_id'
      >[];
      const productIds = typedProducts.map((product) => product.id);

      let imageMap: Record<string, string> = {};

      if (productIds.length > 0) {
        const { data: images, error: imagesError } = await supabaseServer
          .from('product_images')
          .select('product_id, image_url, sort_order')
          .in('product_id', productIds)
          .eq('is_primary', true)
          .order('sort_order', { ascending: true });

        if (imagesError) {
          throw new Error(imagesError.message);
        }

        imageMap = ((images ?? []) as Pick<ProductImage, 'product_id' | 'image_url' | 'sort_order'>[])
          .reduce<Record<string, string>>((acc, image) => {
            if (image.product_id && !acc[image.product_id]) {
              acc[image.product_id] = image.image_url;
            }

            return acc;
          }, {});
      }

      return { typedProducts, imageMap };
    },
    300
  );

  const typedCategories = (categories ?? []) as Pick<Category, 'id' | 'name' | 'slug'>[];
  const productsForFilter = typedProducts.map((product) => ({
    id: product.id,
    name: product.name,
    slug: product.slug,
    price: Number(product.price),
    imageUrl: imageMap[product.id] ?? null,
    categoryId: product.category_id,
  }));

  return (
    <main className="min-h-screen bg-white text-black py-24 px-6 md:px-12">
      <h1 className="mb-12 text-4xl font-light uppercase tracking-widest md:text-5xl">Shop All</h1>
      <div className="mb-4 flex flex-wrap gap-2">
        {(['all', 'men', 'women', 'unisex'] as const).map((g) => {
          const href = `/shop${g === 'all' ? '' : `?gender=${g}`}${sort !== 'newest' ? `${g === 'all' ? '?' : '&'}sort=${sort}` : ''}`;
          const active = (gender ?? 'all') === g;

          return (
            <Link
              key={g}
              href={href}
              className={`border px-4 py-1.5 text-xs uppercase tracking-widest transition-colors ${active
                  ? 'border-black bg-black text-white'
                  : 'border-neutral-300 text-neutral-600 hover:border-black hover:text-black'
                }`}
            >
              {g === 'all' ? 'All' : g.charAt(0).toUpperCase() + g.slice(1)}
            </Link>
          );
        })}
      </div>

      <div className="mb-8 flex flex-wrap items-center gap-2">
        <span className="text-xs uppercase tracking-widest text-neutral-500 mr-2">Sort by:</span>
        {[
          { value: 'newest', label: 'Newest' },
          { value: 'price-asc', label: 'Price ↑' },
          { value: 'price-desc', label: 'Price ↓' },
        ].map((option) => {
          const href = `/shop${gender ? `?gender=${gender}` : ''}${option.value === 'newest' ? '' : `${gender ? '&' : '?'}sort=${option.value}`}`;
          const active = sort === option.value;

          return (
            <Link
              key={option.value}
              href={href}
              className={`border px-4 py-1.5 text-xs uppercase tracking-widest transition-colors ${active
                  ? 'border-black bg-black text-white'
                  : 'border-neutral-300 text-neutral-600 hover:border-black hover:text-black'
                }`}
            >
              {option.label}
            </Link>
          );
        })}
      </div>

      <ShopFilter products={productsForFilter} categories={typedCategories} sort={sort} />
    </main>
  );
}
