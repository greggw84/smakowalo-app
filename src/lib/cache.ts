interface CacheEntry<T> {
  data: T
  timestamp: number
  ttl: number
}

class InMemoryCache {
  private cache = new Map<string, CacheEntry<unknown>>()
  private defaultTTL = Number.parseInt(process.env.CACHE_TTL || '3600') * 1000 // Convert to milliseconds

  set<T>(key: string, data: T, ttl?: number): void {
    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      ttl: ttl || this.defaultTTL
    }
    this.cache.set(key, entry as CacheEntry<unknown>)
  }

  get<T>(key: string): T | null {
    const entry = this.cache.get(key) as CacheEntry<T> | undefined

    if (!entry) {
      return null
    }

    // Check if entry has expired
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key)
      return null
    }

    return entry.data
  }

  delete(key: string): boolean {
    return this.cache.delete(key)
  }

  clear(): void {
    this.cache.clear()
  }

  has(key: string): boolean {
    const entry = this.cache.get(key)
    if (!entry) {
      return false
    }

    // Check if entry has expired
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key)
      return false
    }

    return true
  }

  size(): number {
    return this.cache.size
  }

  // Get cache statistics
  getStats() {
    const now = Date.now()
    const entries = Array.from(this.cache.entries())
    const validEntries = entries.filter(([, entry]) => now - entry.timestamp <= entry.ttl)
    const expiredEntries = entries.filter(([, entry]) => now - entry.timestamp > entry.ttl)

    // Clean up expired entries
    for (const [key] of expiredEntries) {
      this.cache.delete(key)
    }

    return {
      total: validEntries.length,
      expired: expiredEntries.length,
      keys: validEntries.map(([key]) => key)
    }
  }
}

// Singleton instance
const cache = new InMemoryCache()

// Helper function to create cache with automatic expiration
export async function withCache<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttl?: number
): Promise<T> {
  // Try to get from cache first
  const cached = cache.get<T>(key)
  if (cached !== null) {
    console.log(`🔄 Cache HIT for key: ${key}`)
    return cached
  }

  console.log(`🔄 Cache MISS for key: ${key}`)

  // Fetch fresh data
  const data = await fetcher()

  // Store in cache
  cache.set(key, data, ttl)

  return data
}

// Cache key generators
export const cacheKeys = {
  product: (id: string) => `product:${id}`,
  products: (filters?: string) => `products${filters ? `:${filters}` : ''}`,
  categories: () => 'categories',
  user: (userId: string) => `user:${userId}`,
  userOrders: (userId: string) => `user:${userId}:orders`,
  userSubscriptions: (userId: string) => `user:${userId}:subscriptions`,
  analytics: (type: string, period: string) => `analytics:${type}:${period}`
}

// Cache invalidation helpers
export function invalidateCache(pattern: string): number {
  const stats = cache.getStats()
  const keysToDelete = stats.keys.filter(key => key.includes(pattern))

  for (const key of keysToDelete) {
    cache.delete(key)
    console.log(`🗑️ Invalidated cache key: ${key}`)
  }

  return keysToDelete.length
}

export function clearAllCache(): void {
  cache.clear()
  console.log('🗑️ Cleared all cache')
}

// Cache warming functions
export async function warmCache() {
  console.log('🔥 Warming cache...')

  try {
    // You can add cache warming logic here
    // For example, pre-load frequently accessed data
    console.log('✅ Cache warming completed')
  } catch (error) {
    console.error('❌ Cache warming failed:', error)
  }
}

export { cache }
