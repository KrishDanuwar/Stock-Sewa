import { LRUCache } from 'lru-cache';
import { currentUser } from '@clerk/nextjs/server';
import { headers } from 'next/headers';

const tokenCache = new LRUCache<string, number>({
    max: 500,
    ttl: 60 * 1000, // 1 minute
});

export async function rateLimit(limit: number = 20, windowMs: number = 60000) {
    const user = await currentUser();
    const headerList = await headers();
    const ip = headerList.get('x-forwarded-for') || 'anonymous';

    // Key based on userId if logged in, otherwise IP
    const key = user ? `user:${user.id}` : `ip:${ip}`;

    const currentUsage = tokenCache.get(key) || 0;

    if (currentUsage >= limit) {
        throw new Error('Too many requests. Please try again later.');
    }

    tokenCache.set(key, currentUsage + 1);

    return {
        success: true,
        remaining: limit - (currentUsage + 1),
    };
}
