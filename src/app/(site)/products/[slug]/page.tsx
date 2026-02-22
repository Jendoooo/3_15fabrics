import { notFound } from 'next/navigation';
import type { Metadata } from 'next';

import { supabaseServer } from '@/lib/supabase';
import { cachedFetch } from '@/lib/cache';

import type { Collection, Product, ProductImage, ProductVariant } from '@/lib/types';

import ProductPurchasePanel from './ProductPurchasePanel';
import ProductImageGallery from './ProductImageGallery';
import ProductCard from '@/components/ProductCard';

export const dynamic = 'force-dynamic';

type ProductRecord = Pick<
  Product,
  | 'id'
  | 'name'
  | 'slug'
  | 'description'
  | 'price'
  | 'collection_id'
  | 'fabric_details'
  | 'care_instructions'
  | 'status'
  | 'unit_type'
  | 'minimum_quantity'
>;

type ProductVariantRecord = Pick<ProductVariant, 'id' | 'size' | 'color' | 'stock_quantity'>;
type ProductImageRecord = Pick<ProductImage, 'id' | 'image_url' | 'alt_text' | 'is_primary' | 'sort_order'>;
type CollectionRecord = Pick<Collection, 'name'>;

const formatNaira = (value: number | string) => {
  const numStr = Number(value).toString();
  return `₦${numStr.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`;
};

async function getProductBySlug(slug: string) {
  return cachedFetch(`product_by_slug:${slug}`, async () => {
    const { data, error } = await supabaseServer
      .from('products')
      .select(
        'id, name, slug, description, price, collection_id, fabric_details, care_instructions, status, unit_type, minimum_quantity'
      )
      .eq('slug', slug)
      .maybeSingle();

    return { data, error };
  });
}

async function getProductImages(productId: string) {
  return cachedFetch(`product_images:${productId}`, async () => {
    const { data, error } = await supabaseServer
      .from('product_images')
      .select('id, image_url, alt_text, is_primary, sort_order')
      .eq('product_id', productId)
      .order('is_primary', { ascending: false })
      .order('sort_order', { ascending: true });

    return { data, error };
  });
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const { data: product } = await getProductBySlug(params.slug);

  if (!product) {
    return { title: 'Product Not Found' };
  }

  const { data: images } = await getProductImages(product.id);
  const primaryImage = images?.find((img) => img.is_primary)?.image_url ?? images?.[0]?.image_url ?? null;

  const title = `${product.name} — 3:15 Fabrics`;
  const description = (product.description ?? `Shop ${product.name} at 3:15 Fabrics`).substring(0, 160);

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: primaryImage ? [primaryImage] : [],
    },
  };
}

export default async function ProductDetailPage({ params }: { params: { slug: string } }) {
  const { data: product, error: productError } = await getProductBySlug(params.slug);

  if (productError) {
    throw new Error(productError.message);
  }

  if (!product) {
    notFound();
  }

  const productData = product as ProductRecord;

  const [{ data: variants, error: variantsError }, { data: images, error: imagesError }] =
    await Promise.all([
      supabaseServer
        .from('product_variants')
        .select('id, size, color, stock_quantity')
        .eq('product_id', productData.id),
      getProductImages(productData.id),
    ]);

  if (variantsError) {
    throw new Error(variantsError.message);
  }

  if (imagesError) {
    throw new Error(imagesError.message);
  }

  let collectionName: string | null = null;

  if (productData.collection_id) {
    const { data: collection, error: collectionError } = await supabaseServer
      .from('collections')
      .select('name')
      .eq('id', productData.collection_id)
      .maybeSingle();

    if (collectionError) {
      throw new Error(collectionError.message);
    }

    collectionName = (collection as CollectionRecord | null)?.name ?? null;
  }

  let relatedData: { id: string; name: string; slug: string; price: number }[] = [];

  if (productData.collection_id) {
    const { data: colRelated } = await supabaseServer
      .from('products')
      .select('id, name, slug, price')
      .eq('collection_id', productData.collection_id)
      .eq('status', 'active')
      .neq('id', productData.id)
      .limit(4);

    if (colRelated && colRelated.length > 0) {
      relatedData = colRelated as { id: string; name: string; slug: string; price: number }[];
    }
  }

  if (relatedData.length === 0) {
    const { data: anyRelated } = await supabaseServer
      .from('products')
      .select('id, name, slug, price')
      .eq('status', 'active')
      .neq('id', productData.id)
      .limit(4);

    relatedData = (anyRelated ?? []) as { id: string; name: string; slug: string; price: number }[];
  }

  const relatedImagesMap: Record<string, string> = {};
  if (relatedData.length > 0) {
    const { data: relImages } = await supabaseServer
      .from('product_images')
      .select('product_id, image_url')
      .in('product_id', relatedData.map((r) => r.id))
      .eq('is_primary', true);

    if (relImages) {
      relImages.forEach((img) => {
        if (img.product_id) relatedImagesMap[img.product_id] = img.image_url;
      });
    }
  }

  const variantData = (variants ?? []) as ProductVariantRecord[];
  const imageData = (images ?? []) as ProductImageRecord[];
  const primaryImage = imageData.find((image) => image.is_primary) ?? imageData[0] ?? null;
  const isSoldOut = productData.status === 'sold_out';

  return (
    <main className="min-h-screen bg-white pb-32 pt-24 text-black">
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-16 px-6 md:grid-cols-2 md:px-12">
        <div>
          <ProductImageGallery images={imageData} productName={productData.name} />
        </div>

        <div className="sticky top-24 flex h-max flex-col space-y-8">
          <div>
            <h1 className="mb-2 text-3xl font-light uppercase tracking-widest">{productData.name}</h1>
            <p className="text-xl">{formatNaira(productData.price)}</p>
            {collectionName ? (
              <p className="mt-3 text-xs uppercase tracking-widest text-neutral-500">{collectionName}</p>
            ) : null}
            {isSoldOut ? (
              <p className="mt-3 text-sm uppercase tracking-widest text-red-600">Sold Out</p>
            ) : null}
          </div>

          <div className="space-y-4">
            <p className="font-light leading-relaxed">
              {productData.description ?? 'A refined staple crafted for modern Lagos evenings.'}
            </p>
          </div>

          <ProductPurchasePanel
            productId={productData.id}
            productName={productData.name}
            unitPrice={productData.price}
            productStatus={productData.status}
            primaryImageUrl={primaryImage?.image_url ?? null}
            variants={variantData}
            unitType={(productData.unit_type ?? 'yard') as 'yard' | 'bundle'}
            minimumQuantity={productData.minimum_quantity ?? 1}
          />

          <div className="space-y-4 border-t border-neutral-200 pt-6">
            <details className="border-b border-neutral-200 pb-4">
              <summary className="cursor-pointer text-sm uppercase tracking-widest">Fabric Details</summary>
              <p className="mt-3 text-sm leading-relaxed text-neutral-700">
                {productData.fabric_details ?? 'Premium fabric selected for comfort and structure.'}
              </p>
            </details>
            <details className="border-b border-neutral-200 pb-4">
              <summary className="cursor-pointer text-sm uppercase tracking-widest">Care Instructions</summary>
              <p className="mt-3 text-sm leading-relaxed text-neutral-700">
                {productData.care_instructions ?? 'Dry clean recommended. Steam lightly before wear.'}
              </p>
            </details>
          </div>
        </div>
      </div>

      {relatedData.length > 0 && (
        <div className="mx-auto max-w-7xl px-6 md:px-12">
          <section className="mt-16 border-t border-neutral-200 pt-12">
            <h2 className="mb-8 text-sm uppercase tracking-widest">You May Also Like</h2>
            <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
              {relatedData.map((related) => (
                <ProductCard
                  key={related.id}
                  slug={related.slug}
                  name={related.name}
                  price={Number(related.price)}
                  imageUrl={relatedImagesMap[related.id] ?? '/images/instagram/product_101.jpg'}
                />
              ))}
            </div>
          </section>
        </div>
      )}
    </main>
  );
}
