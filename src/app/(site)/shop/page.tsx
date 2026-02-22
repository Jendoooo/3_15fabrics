import { supabaseServer } from '@/lib/supabase';
import { cachedFetch } from '@/lib/cache';
import type { Category, Product, ProductImage } from '@/lib/types';

import ShopFilter from './_components/ShopFilter';

export const dynamic = 'force-dynamic';

export default async function ShopPage() {
  const { data: categories, error: categoriesError } = await supabaseServer
    .from('categories')
    .select('id, name, slug')
    .order('name', { ascending: true });

  if (categoriesError) {
    throw new Error(categoriesError.message);
  }

  const { typedProducts, imageMap } = await cachedFetch(
    'shop:products',
    async () => {
      const { data: products, error: productsError } = await supabaseServer
        .from('products')
        .select('id, name, slug, price, category_id')
        .eq('status', 'active')
        .order('created_at', { ascending: false });

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
      <ShopFilter products={productsForFilter} categories={typedCategories} />
    </main>
  );
}
