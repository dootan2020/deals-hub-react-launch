
export const CACHE_KEYS = {
  USER_PROFILE: 'user-profile',
  USER_BALANCE: 'user-balance',
  USER_ROLES: 'user-roles',
  USER_ORDERS: 'user-orders',
  TRANSACTIONS: 'transactions',
  PROXY_CONFIG: 'proxy-settings'
} as const;

export const TTL = {
  PROFILE: 5 * 60 * 1000, // 5 minutes
  BALANCE: 30 * 1000, // 30 seconds
  SETTINGS: 15 * 60 * 1000, // 15 minutes
  ORDERS: 60 * 1000 // 1 minute
} as const;

interface CacheData<T> {
  data: T;
  timestamp: number;
}

interface GetCacheOptions {
  ttl?: number;
}

export function getCachedData<T>(key: string, options: GetCacheOptions = {}): T | null {
  try {
    const cached = localStorage.getItem(key);
    if (!cached) return null;

    const { data, timestamp }: CacheData<T> = JSON.parse(cached);
    if (options.ttl && Date.now() - timestamp > options.ttl) {
      localStorage.removeItem(key);
      return null;
    }

    return data;
  } catch (error) {
    console.warn(`Error reading cache for key ${key}:`, error);
    return null;
  }
}

export function setCachedData<T>(key: string, data: T, ttl?: number): void {
  try {
    const cacheData: CacheData<T> = {
      data,
      timestamp: Date.now()
    };
    localStorage.setItem(key, JSON.stringify(cacheData));
  } catch (error) {
    console.warn(`Error setting cache for key ${key}:`, error);
  }
}

export function invalidateCache(key: string): void {
  localStorage.removeItem(key);
}

export function invalidateCacheGroup(prefix: string): void {
  Object.keys(localStorage).forEach(key => {
    if (key.startsWith(prefix)) {
      localStorage.removeItem(key);
    }
  });
}
