import { redis } from './redis';
import { revalidatePath } from 'next/cache';

/**
 * Utility to clear standard shop caches when a product is modified
 */
export async function invalidateProductCache(slug: string) {
    try {
        await Promise.all([
            redis.del('shop:products'),
            redis.del('home:featured'),
            redis.del(`product_by_slug:${slug}`)
        ]);
    } catch (error) {
        console.error(`[Redis] Failed to delete product cache keys for slug ${slug}:`, error);
    }

    try {
        revalidatePath('/shop');
        revalidatePath(`/products/${slug}`);
        revalidatePath('/');
    } catch (error) {
        console.error(`[Next.js] Failed to revalidate paths for product slug ${slug}:`, error);
    }
}

/**
 * Utility to clear standard shop caches when a collection is modified
 */
export async function invalidateCollectionCache(slug: string) {
    try {
        await Promise.all([
            redis.del('shop:products'), // sometimes products list depends on collections mapping
            redis.del('home:featured'),
            redis.del(`collection_by_slug:${slug}`)
        ]);
    } catch (error) {
        console.error(`[Redis] Failed to delete collection cache keys for slug ${slug}:`, error);
    }

    try {
        revalidatePath('/collections');
        revalidatePath(`/collections/${slug}`);
        revalidatePath('/');
    } catch (error) {
        console.error(`[Next.js] Failed to revalidate paths for collection slug ${slug}:`, error);
    }
}
