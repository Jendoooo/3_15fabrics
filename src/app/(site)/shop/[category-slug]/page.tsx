import Link from 'next/link';
import { notFound } from 'next/navigation';
import ProductCard from '@/components/ProductCard';

import { supabaseServer } from '@/lib/supabase';
import type { Category, Product, ProductImage } from '@/lib/types';

type CategoryRecord = Pick<Category, 'id' | 'name' | 'slug'>;
type CategoryProduct = Pick<Product, 'id' | 'name' | 'slug' | 'price'>;
type ProductPrimaryImage = Pick<ProductImage, 'product_id' | 'image_url' | 'sort_order'>;

export default async function CategoryPage({
  params,
}: {
  params: { 'category-slug': string };
}) {
  const categorySlug = params['category-slug'];

  const { data: category, error: categoryError } = await supabaseServer
    .from('categories')
    .select('id, name, slug')
    .eq('slug', categorySlug)
    .single();

  if (categoryError || !category) {
    notFound();
  }

  const categoryData = category as CategoryRecord;

  const { data: products, error: productsError } = await supabaseServer
    .from('products')
    .select('id, name, slug, price')
    .eq('category_id', categoryData.id)
    .eq('status', 'active')
    .order('created_at', { ascending: false });

  if (productsError) {
    throw new Error(productsError.message);
  }

  const categoryProducts = (products ?? []) as CategoryProduct[];
  const productIds = categoryProducts.map((product) => product.id);

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

    imageMap = ((images ?? []) as ProductPrimaryImage[]).reduce<Record<string, string>>(
      (acc, image) => {
        if (image.product_id && !acc[image.product_id]) {
          acc[image.product_id] = image.image_url;
        }

        return acc;
      },
      {}
    );
  }

  return (
    <main className="min-h-screen bg-white px-6 py-24 text-black md:px-12">
      <div className="mb-12 flex items-end justify-between gap-6">
        <h1 className="text-4xl font-light uppercase tracking-widest md:text-5xl">
          {categoryData.name}
        </h1>
        <Link
          href="/shop"
          className="border-b border-brand-earth pb-1 text-sm uppercase tracking-widest text-brand-dark transition-colors hover:text-brand-gold"
        >
          Back to Shop
        </Link>
      </div>

      {categoryProducts.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-sm border border-brand-gold/20 bg-brand-cream py-20 text-center">
          <p className="mb-4 text-sm uppercase tracking-widest text-brand-earth">
            No products in this category yet.
          </p>
          <Link
            href="/shop"
            className="border-b border-brand-forest pb-1 text-xs uppercase tracking-widest text-brand-forest transition-colors hover:text-brand-gold"
          >
            Shop All Fabrics
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-x-8 gap-y-16 lg:grid-cols-4">
          {categoryProducts.map((product) => {
            const imageUrl = imageMap[product.id] ?? null;
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
    </main>
  );
}
