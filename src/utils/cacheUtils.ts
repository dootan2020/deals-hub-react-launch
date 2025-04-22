
interface CacheItem<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

interface CacheConfig {
  ttl?: number;
  forceRefresh?: boolean;
}

const DEFAULT_TTL = 5 * 60 * 1000; // 5 minutes
const PROFILE_TTL = 10 * 60 * 1000; // 10 minutes
const CATEGORY_TTL = 30 * 60 * 1000; // 30 minutes
const SETTINGS_TTL = 60 * 60 * 1000; // 1 hour

/**
 * Get cached data with TTL check
 */
export function getCachedData<T>(key: string, config: CacheConfig = {}): T | null {
  try {
    const item = localStorage.getItem(`cache_${key}`);
    if (!item) return null;

    const cached: CacheItem<T> = JSON.parse(item);
    const now = Date.now();
    const ttl = config.ttl || DEFAULT_TTL;

    // Force refresh or expired
    if (config.forceRefresh || (now - cached.timestamp > ttl)) {
      localStorage.removeItem(`cache_${key}`);
      return null;
    }

    return cached.data;
  } catch (error) {
    console.warn(`Cache read error for key ${key}:`, error);
    return null;
  }
}

/**
 * Set data in cache with TTL
 */
export function setCachedData<T>(key: string, data: T, ttl: number = DEFAULT_TTL): void {
  try {
    const cacheItem: CacheItem<T> = {
      data,
      timestamp: Date.now(),
      ttl
    };
    localStorage.setItem(`cache_${key}`, JSON.stringify(cacheItem));
  } catch (error) {
    console.error(`Cache write error for key ${key}:`, error);
  }
}

/**
 * Invalidate specific cache entry
 */
export function invalidateCache(key: string): void {
  localStorage.removeItem(`cache_${key}`);
}

/**
 * Clear all cached data
 */
export function clearAllCache(): void {
  const keys = Object.keys(localStorage);
  keys.forEach(key => {
    if (key.startsWith('cache_')) {
      localStorage.removeItem(key);
    }
  });
}

/**
 * Hook for cached data with auto-refresh
 */
export function useCachedData<T>(
  key: string,
  fetchFn: () => Promise<T>,
  config: CacheConfig = {}
) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        // Try to get from cache first
        const cached = getCachedData<T>(key, config);
        if (cached) {
          setData(cached);
          setLoading(false);
          return;
        }

        // Fetch fresh data
        const fresh = await fetchFn();
        setCachedData(key, fresh, config.ttl);
        setData(fresh);
      } catch (error) {
        console.error(`Error loading data for ${key}:`, error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [key, config.ttl]);

  return { data, loading };
}

// Cache keys
export const CACHE_KEYS = {
  USER_PROFILE: 'user_profile',
  USER_BALANCE: 'user_balance',
  USER_ROLES: 'user_roles',
  CATEGORIES: 'categories',
  PROXY_CONFIG: 'proxy_config',
  TRANSACTION_HISTORY: (userId: string) => `transactions_${userId}`,
} as const;

// TTL constants
export const TTL = {
  PROFILE: PROFILE_TTL,
  CATEGORY: CATEGORY_TTL,
  SETTINGS: SETTINGS_TTL,
  DEFAULT: DEFAULT_TTL,
} as const;
