
import { createContext, useContext, useState, useEffect, ReactNode, useCallback, useRef } from 'react';
import { Category } from '@/types';
import { fetchAllCategories } from '@/services/categoryService';
import { toast } from '@/hooks/use-toast';
import { fetchWithTimeout } from '@/utils/fetchWithTimeout';
import { ErrorBoundary } from '@/components/util/ErrorBoundary';

interface CategoryContextType {
  categories: Category[];
  mainCategories: Category[];
  getCategoryById: (id: string) => Category | undefined;
  getSubcategoriesByParentId: (parentId: string) => Category[];
  isLoading: boolean;
  error: Error | null;
  refreshCategories: () => Promise<void>;
}

const CategoriesContext = createContext<CategoryContextType | undefined>(undefined);

export const useCategoriesContext = () => {
  const context = useContext(CategoriesContext);
  if (!context) {
    throw new Error('useCategoriesContext must be used within a CategoriesProvider');
  }
  return context;
};

// Cache key for localStorage
const CATEGORIES_CACHE_KEY = 'app_categories_cache';
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes in milliseconds

interface CategoriesProviderProps {
  children: ReactNode;
}

export const CategoriesProvider = ({ children }: CategoriesProviderProps) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [mainCategories, setMainCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const maxRetries = 2;
  const isMountedRef = useRef(true);
  const loadingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Try to load from cache first
  useEffect(() => {
    const cachedData = localStorage.getItem(CATEGORIES_CACHE_KEY);
    if (cachedData) {
      try {
        const { categories: cachedCategories, timestamp } = JSON.parse(cachedData);
        const isExpired = Date.now() - timestamp > CACHE_TTL;
        
        if (!isExpired && cachedCategories?.length > 0) {
          console.log('Using cached categories:', cachedCategories.length);
          setCategories(cachedCategories);
          
          // Filter main categories (those without parent_id)
          const main = cachedCategories.filter((category: Category) => !category.parent_id);
          setMainCategories(main);
          
          // Still load fresh data in background, but with lower priority
          setTimeout(() => loadCategories(true), 3000);
          return;
        }
      } catch (err) {
        console.error('Error parsing cached categories:', err);
        // Continue to load categories if cache parsing fails
      }
    }
    
    // No valid cache, load normally
    loadCategories();
  }, []);

  // Ensure cleanup when component unmounts
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
      if (loadingTimeoutRef.current) {
        clearTimeout(loadingTimeoutRef.current);
      }
    };
  }, []);

  const loadCategories = async (isBackgroundRefresh = false) => {
    // Don't set loading state if this is a background refresh
    if (!isBackgroundRefresh) {
      setIsLoading(true);
    }
    setError(null);
    
    // Set a timeout to clear loading state if it takes too long
    if (loadingTimeoutRef.current) {
      clearTimeout(loadingTimeoutRef.current);
    }
    
    loadingTimeoutRef.current = setTimeout(() => {
      if (isMountedRef.current && isLoading) {
        console.warn('Categories loading timed out, clearing loading state');
        setIsLoading(false);
        setError(new Error('Tải danh mục quá thời gian cho phép'));
      }
    }, 10000); // 10 seconds timeout
    
    try {
      console.log(`Attempting to load categories (attempt: ${retryCount + 1}/${maxRetries + 1})`);
      
      // Use our updated fetchWithTimeout utility with 20 second timeout (reduced from 30s)
      const data = await fetchWithTimeout(
        fetchAllCategories(),
        20000, // 20 second timeout
        'Quá thời gian tải danh mục'
      );
      
      if (!isMountedRef.current) return; // Don't update state if component unmounted
      
      console.log('Categories loaded successfully:', data?.length || 0);
      
      // Update localStorage cache
      localStorage.setItem(CATEGORIES_CACHE_KEY, JSON.stringify({
        categories: data,
        timestamp: Date.now()
      }));
      
      setCategories(data || []);
      
      // Filter main categories (those without parent_id)
      const main = data.filter(category => !category.parent_id);
      setMainCategories(main);
    } catch (err) {
      if (!isMountedRef.current) return; // Don't update state if component unmounted
      
      const errorMessage = err instanceof Error ? err : new Error('Không thể tải danh mục');
      setError(errorMessage);
      console.error('Lỗi tải danh mục:', err);
      
      // Don't show toast for background refreshes
      if (!isBackgroundRefresh) {
        toast.error('Lỗi tải dữ liệu', 'Không thể tải cấu trúc menu. Vui lòng thử lại sau.');
      }
      
      // Auto-retry logic (but limited to prevent infinite loops)
      if (retryCount < maxRetries) {
        console.log(`Will retry in 2 seconds... (${retryCount + 1}/${maxRetries})`);
        setTimeout(() => {
          if (isMountedRef.current) {
            setRetryCount(prev => prev + 1);
          }
        }, 2000);
      } else if (!isBackgroundRefresh) {
        // Try to use cached data if available as a fallback
        const cachedData = localStorage.getItem(CATEGORIES_CACHE_KEY);
        if (cachedData) {
          try {
            const { categories: cachedCategories } = JSON.parse(cachedData);
            if (cachedCategories?.length > 0) {
              console.log('Using cached categories as fallback due to fetch error');
              setCategories(cachedCategories);
              const main = cachedCategories.filter((category: Category) => !category.parent_id);
              setMainCategories(main);
            }
          } catch (cacheErr) {
            console.error('Error parsing cached categories:', cacheErr);
          }
        }
      }
    } finally {
      if (!isMountedRef.current) return; // Don't update state if component unmounted
      
      setIsLoading(false);
      
      if (loadingTimeoutRef.current) {
        clearTimeout(loadingTimeoutRef.current);
        loadingTimeoutRef.current = null;
      }
    }
  };

  useEffect(() => {
    if (retryCount > 0) {
      loadCategories();
    }
  }, [retryCount]);

  const getCategoryById = useCallback((id: string) => {
    return categories.find(category => category.id === id);
  }, [categories]);

  const getSubcategoriesByParentId = useCallback((parentId: string) => {
    return categories.filter(category => category.parent_id === parentId);
  }, [categories]);

  const refreshCategories = useCallback(async () => {
    setRetryCount(0); // Reset retry count on manual refresh
    await loadCategories();
  }, []);

  return (
    <ErrorBoundary>
      <CategoriesContext.Provider
        value={{
          categories,
          mainCategories,
          getCategoryById,
          getSubcategoriesByParentId,
          isLoading,
          error,
          refreshCategories
        }}
      >
        {children}
      </CategoriesContext.Provider>
    </ErrorBoundary>
  );
};
