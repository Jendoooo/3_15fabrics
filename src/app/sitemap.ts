import type { MetadataRoute } from 'next';

import { supabaseServer } from '@/lib/supabase';
import type { Collection, Product } from '@/lib/types';

const BASE_URL = 'https://iby-closet.com';

type SitemapProduct = Pick<Product, 'slug' | 'created_at'>;
type SitemapCollection = Pick<Collection, 'slug' | 'created_at'>;
type SitemapProductWithUpdatedAt = SitemapProduct & { updated_at?: string | null };
type SitemapCollectionWithUpdatedAt = SitemapCollection & { updated_at?: string | null };

const toDate = (value: string | null | undefined) => {
  if (!value) {
    return new Date();
  }

  const parsedDate = new Date(value);
  return Number.isNaN(parsedDate.getTime()) ? new Date() : parsedDate;
};

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${BASE_URL}/`, lastModified: now, changeFrequency: 'weekly', priority: 1 },
    { url: `${BASE_URL}/shop`, lastModified: now, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${BASE_URL}/collections`, lastModified: now, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${BASE_URL}/brand`, lastModified: now, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${BASE_URL}/lookbook`, lastModified: now, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${BASE_URL}/size-guide`, lastModified: now, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${BASE_URL}/faq`, lastModified: now, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${BASE_URL}/contact`, lastModified: now, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${BASE_URL}/track`, lastModified: now, changeFrequency: 'weekly', priority: 0.3 },
  ];

  const [productsWithUpdatedAt, collectionsWithUpdatedAt] = await Promise.all([
    supabaseServer.from('products').select('slug, updated_at, created_at').eq('status', 'active'),
    supabaseServer
      .from('collections')
      .select('slug, updated_at, created_at')
      .in('status', ['active', 'upcoming']),
  ]);

  let productsData = productsWithUpdatedAt.data as SitemapProductWithUpdatedAt[] | null;
  let collectionsData = collectionsWithUpdatedAt.data as SitemapCollectionWithUpdatedAt[] | null;
  let productsError = productsWithUpdatedAt.error;
  let collectionsError = collectionsWithUpdatedAt.error;

  // Older schemas may not have updated_at on products/collections. Fall back cleanly.
  if (productsError) {
    const fallbackProducts = await supabaseServer
      .from('products')
      .select('slug, created_at')
      .eq('status', 'active');

    productsData = (fallbackProducts.data ?? []) as SitemapProductWithUpdatedAt[];
    productsError = fallbackProducts.error;
  }

  if (collectionsError) {
    const fallbackCollections = await supabaseServer
      .from('collections')
      .select('slug, created_at')
      .in('status', ['active', 'upcoming']);

    collectionsData = (fallbackCollections.data ?? []) as SitemapCollectionWithUpdatedAt[];
    collectionsError = fallbackCollections.error;
  }

  const productRoutes: MetadataRoute.Sitemap = productsError
    ? []
    : ((productsData ?? []) as SitemapProductWithUpdatedAt[])
        .filter((product) => Boolean(product.slug))
        .map((product) => ({
          url: `${BASE_URL}/products/${product.slug}`,
          lastModified: toDate(product.updated_at ?? product.created_at),
          changeFrequency: 'daily',
          priority: 0.9,
        }));

  const collectionRoutes: MetadataRoute.Sitemap = collectionsError
    ? []
    : ((collectionsData ?? []) as SitemapCollectionWithUpdatedAt[])
        .filter((collection) => Boolean(collection.slug))
        .map((collection) => ({
          url: `${BASE_URL}/collections/${collection.slug}`,
          lastModified: toDate(collection.updated_at ?? collection.created_at),
          changeFrequency: 'weekly',
          priority: 0.8,
        }));

  return [...staticRoutes, ...productRoutes, ...collectionRoutes];
}
