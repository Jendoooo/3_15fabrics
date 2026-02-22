import { redis } from './redis';

/**
 * Helper to cache server-side fetching results.
 * Falls back to the fetcher if Redis errors out or is unconfigured.
 */
export async function cachedFetch<T>(
    key: string,
    fetcher: () => Promise<T>,
    ttlSeconds: number = 300
): Promise<T> {
    try {
        const cached = await redis.get<T>(key);
        if (cached) {
            return cached;
        }
    } catch (err) {
        console.error(`[Redis] Error getting cache for key "${key}":`, err);
        // On cache error, fall through to fetcher
    }

    const result = await fetcher();

    try {
        // Only cache if there's actual data to avoid caching hard failures or empty results unexpectedly
        if (result !== undefined && result !== null) {
            await redis.set(key, result, { ex: ttlSeconds });
        }
    } catch (err) {
        console.error(`[Redis] Error setting cache for key "${key}":`, err);
    }

    return result;
}
