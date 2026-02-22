import { Redis } from '@upstash/redis';

const url = process.env.UPSTASH_REDIS_REST_URL;
const token = process.env.UPSTASH_REDIS_REST_TOKEN;

const hasValidCredentials = url && token && url.startsWith('https://');

if (!hasValidCredentials) {
    console.warn('Missing or invalid Upstash Redis credentials. Caching will be disabled.');
}

// Export a singleton instance. If credentials are missing/invalid, we export a mock
// that fails gracefully so the fallback cache logic runs.
export const redis = hasValidCredentials
    ? new Redis({ url, token })
    : {
        get: async () => null,
        set: async () => 'OK',
    } as unknown as Redis;
