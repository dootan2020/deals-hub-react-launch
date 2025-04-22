
import { useState, useEffect, useCallback, useRef } from 'react';
import { fetchProductsWithFilters } from '@/services/product/productService';
import { fetchAllCategories, fetchSubcategoriesByParentId } from '@/services/categoryService';
import { Product, SortOption, Category } from '@/types';
import { SubcategoryItem } from '@/types/category.types';
import { toast } from '@/hooks/use-toast';
import { fetchWithTimeout } from '@/utils/fetchWithTimeout';

// Cache keys
const HOMEPAGE_PRODUCTS_CACHE_KEY = 'homepage_products_cache';
const HOMEPAGE_CATEGORIES_CACHE_KEY = 'homepage_categories_cache';
const PRODUCTS_CACHE_TTL = 5 * 60 * 1000; // 5 minutes
const CATEGORIES_CACHE_TTL = 10 * 60 * 1000; // 10 minutes

// Extend the category type for this hook usage to include topSubcategories and totalSubcategories
interface CategoryWithSubs extends Category {
  topSubcategories: SubcategoryItem[];
  totalSubcategories: number;
}

interface UseLoadHomePageResult {
  products: Product[];
  categories: CategoryWithSubs[];
  isLoadingProducts: boolean;
  isLoadingCategories: boolean;
  productsError: string | null;
  categoriesError: string | null;
  activeSort: SortOption;
  setActiveSort: (sort: SortOption) => void;
  refreshData: () => Promise<void>;
}

export function useLoadHomePage(): UseLoadHomePageResult {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<CategoryWithSubs[]>([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(true);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);
  const [productsError, setProductsError] = useState<string | null>(null);
  const [categoriesError, setCategoriesError] = useState<string | null>(null);
  const [activeSort, setActiveSort] = useState<SortOption>('newest');
  
  // Use refs to prevent duplicate requests
  const isLoadingProductsRef = useRef(false);
  const isLoadingCategoriesRef = useRef(false);
  const isMountedRef = useRef(true);
  const loadingTimeoutsRef = useRef<{products: ReturnType<typeof setTimeout> | null, categories: ReturnType<typeof setTimeout> | null}>({
    products: null,
    categories: null
  });
  
  // Cleanup function for timeouts
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
      if (loadingTimeoutsRef.current.products) {
        clearTimeout(loadingTimeoutsRef.current.products);
      }
      if (loadingTimeoutsRef.current.categories) {
        clearTimeout(loadingTimeoutsRef.current.categories);
      }
    };
  }, []);

  const loadProducts = useCallback(async () => {
    // Prevent duplicate calls
    if (isLoadingProductsRef.current) return;
    isLoadingProductsRef.current = true;
    
    setIsLoadingProducts(true);
    setProductsError(null);
    
    // Create a timeout to clear loading state
    if (loadingTimeoutsRef.current.products) {
      clearTimeout(loadingTimeoutsRef.current.products);
    }
    loadingTimeoutsRef.current.products = setTimeout(() => {
      if (isMountedRef.current && isLoadingProducts) {
        console.warn('Products loading timed out, clearing loading state');
        setIsLoadingProducts(false);
        setProductsError('Tải sản phẩm quá thời gian cho phép');
      }
    }, 10000); // 10 second timeout
    
    try {
      // Check for cached products first
      const cachedData = localStorage.getItem(HOMEPAGE_PRODUCTS_CACHE_KEY);
      if (cachedData) {
        try {
          const { products: cachedProducts, sort, timestamp } = JSON.parse(cachedData);
          const isExpired = Date.now() - timestamp > PRODUCTS_CACHE_TTL;
          const sortMatches = sort === activeSort;
          
          if (!isExpired && sortMatches && cachedProducts?.length > 0) {
            console.log('Using cached homepage products:', cachedProducts.length);
            setProducts(cachedProducts);
            setIsLoadingProducts(false);
            
            // Still fetch fresh data in background after a small delay
            setTimeout(() => {
              fetchFreshProducts();
            }, 2000);
            
            isLoadingProductsRef.current = false;
            return;
          }
        } catch (err) {
          console.error('Error parsing cached products:', err);
        }
      }
      
      // No valid cache, fetch fresh data
      await fetchFreshProducts();
    } catch (error) {
      console.error('Error in loadProducts:', error);
      setProductsError('Không thể tải dữ liệu sản phẩm. Vui lòng thử lại sau');
    } finally {
      isLoadingProductsRef.current = false;
      
      if (loadingTimeoutsRef.current.products) {
        clearTimeout(loadingTimeoutsRef.current.products);
        loadingTimeoutsRef.current.products = null;
      }
    }
  }, [activeSort]);
  
  // Separate function to fetch fresh products
  const fetchFreshProducts = async () => {
    try {
      const result = await fetchWithTimeout(
        fetchProductsWithFilters({ 
          sort: activeSort,
          limit: 12 // Limit to avoid loading too many products initially
        }),
        7000,
        'Quá thời gian tải dữ liệu sản phẩm'
      );
      
      // Don't update state if component unmounted
      if (!isMountedRef.current) return;
      
      if (Array.isArray(result)) {
        setProducts(result);
        
        // Update cache
        localStorage.setItem(HOMEPAGE_PRODUCTS_CACHE_KEY, JSON.stringify({
          products: result,
          sort: activeSort,
          timestamp: Date.now()
        }));
      } else if (result && Array.isArray(result.products)) {
        setProducts(result.products);
        
        // Update cache
        localStorage.setItem(HOMEPAGE_PRODUCTS_CACHE_KEY, JSON.stringify({
          products: result.products,
          sort: activeSort,
          timestamp: Date.now()
        }));
      } else {
        setProducts([]);
        setProductsError('Không có sản phẩm phù hợp');
      }
    } catch (error) {
      console.error('Lỗi khi tải sản phẩm:', error);
      setProductsError('Không thể tải dữ liệu sản phẩm. Vui lòng thử lại sau');
      
      // Don't show toast on initial load as it could be annoying
      // toast.error('Lỗi tải dữ liệu', 'Không thể tải danh sách sản phẩm. Vui lòng thử lại sau');
    } finally {
      if (isMountedRef.current) {
        setIsLoadingProducts(false);
      }
    }
  };

  const loadCategories = useCallback(async () => {
    // Prevent duplicate calls
    if (isLoadingCategoriesRef.current) return;
    isLoadingCategoriesRef.current = true;
    
    setIsLoadingCategories(true);
    setCategoriesError(null);
    
    // Create a timeout to clear loading state
    if (loadingTimeoutsRef.current.categories) {
      clearTimeout(loadingTimeoutsRef.current.categories);
    }
    loadingTimeoutsRef.current.categories = setTimeout(() => {
      if (isMountedRef.current && isLoadingCategories) {
        console.warn('Categories loading timed out, clearing loading state');
        setIsLoadingCategories(false);
        setCategoriesError('Tải danh mục quá thời gian cho phép');
      }
    }, 10000); // 10 second timeout
    
    try {
      // Check for cached categories first
      const cachedData = localStorage.getItem(HOMEPAGE_CATEGORIES_CACHE_KEY);
      if (cachedData) {
        try {
          const { categoriesWithSubs, timestamp } = JSON.parse(cachedData);
          const isExpired = Date.now() - timestamp > CATEGORIES_CACHE_TTL;
          
          if (!isExpired && categoriesWithSubs?.length > 0) {
            console.log('Using cached homepage categories:', categoriesWithSubs.length);
            setCategories(categoriesWithSubs);
            setIsLoadingCategories(false);
            
            // Still fetch fresh data in background after a small delay
            setTimeout(() => {
              fetchFreshCategories();
            }, 3000);
            
            isLoadingCategoriesRef.current = false;
            return;
          }
        } catch (err) {
          console.error('Error parsing cached categories:', err);
        }
      }
      
      // No valid cache, fetch fresh data
      await fetchFreshCategories();
    } catch (error) {
      console.error('Error in loadCategories:', error);
      setCategoriesError('Không thể tải danh mục. Vui lòng thử lại sau');
    } finally {
      isLoadingCategoriesRef.current = false;
      
      if (loadingTimeoutsRef.current.categories) {
        clearTimeout(loadingTimeoutsRef.current.categories);
        loadingTimeoutsRef.current.categories = null;
      }
    }
  }, []);
  
  // Separate function to fetch fresh categories
  const fetchFreshCategories = async () => {
    try {
      // Fetch all categories first
      const allCategories = await fetchWithTimeout(
        fetchAllCategories(),
        7000,
        'Quá thời gian tải danh mục'
      );
      
      // Don't update state if component unmounted
      if (!isMountedRef.current) return;
      
      if (Array.isArray(allCategories) && allCategories.length > 0) {
        // Filter main categories (no parent_id)
        const mainCategories = allCategories.filter(cat => !cat.parent_id);
        
        // Limit to top 8 main categories
        const topMainCategories = mainCategories.slice(0, 8);
        
        // Use Promise.allSettled to fetch subcategories for top main categories
        const subcategoryPromises = topMainCategories.map(cat => 
          fetchWithTimeout(
            fetchSubcategoriesByParentId(cat.id),
            5000,
            `Quá thời gian tải danh mục con cho ${cat.name || "danh mục"}`
          ).catch(err => {
            console.error(`Lỗi tải danh mục con cho ${cat.name}:`, err);
            return []; // Return empty array on error for this category
          })
        );
        
        const results = await Promise.allSettled(subcategoryPromises);
        
        // Process results and create categories with subcategories
        const categoriesWithSubs: CategoryWithSubs[] = topMainCategories.map((cat, index) => {
          const result = results[index];
          let subs: Category[] = [];
          
          if (result.status === 'fulfilled') {
            subs = result.value;
          } else {
            console.error(`Không thể tải danh mục con cho ${cat.name}:`, result.reason);
          }
          
          // Only take top 4 subs
          const topSubcategories: SubcategoryItem[] = subs.slice(0, 4).map(s => ({
            id: s.id,
            name: s.name,
            slug: s.slug,
          }));
          
          return {
            ...cat,
            topSubcategories,
            totalSubcategories: subs.length,
          };
        });

        if (!isMountedRef.current) return;
        
        setCategories(categoriesWithSubs);
        setCategoriesError(null);
        
        // Update cache
        localStorage.setItem(HOMEPAGE_CATEGORIES_CACHE_KEY, JSON.stringify({
          categoriesWithSubs,
          timestamp: Date.now()
        }));
      } else {
        if (!isMountedRef.current) return;
        setCategories([]);
        setCategoriesError('Không có danh mục nào');
      }
    } catch (error) {
      if (!isMountedRef.current) return;
      console.error('Lỗi khi tải danh mục:', error);
      setCategoriesError('Không thể tải danh mục. Vui lòng thử lại sau');
      // toast.error('Lỗi tải dữ liệu', 'Không thể tải danh mục. Vui lòng thử lại sau');
    } finally {
      if (isMountedRef.current) {
        setIsLoadingCategories(false);
      }
    }
  };

  const refreshData = useCallback(async () => {
    // Using Promise.allSettled to prevent one failure from blocking the other
    const promises = [loadProducts(), loadCategories()];
    const results = await Promise.allSettled(promises);
    
    // Log any errors for debugging
    results.forEach((result, index) => {
      if (result.status === 'rejected') {
        console.error(`Lỗi khi tải dữ liệu ${index === 0 ? 'sản phẩm' : 'danh mục'}:`, result.reason);
      }
    });
  }, [loadProducts, loadCategories]);

  // First fetch on mount - use sequential loading to reduce server load
  useEffect(() => {
    const initializeData = async () => {
      // Load categories first (typically smaller and more critical)
      await loadCategories();
      
      // Small delay before loading products to avoid parallel requests
      setTimeout(() => {
        loadProducts();
      }, 300);
    };
    
    initializeData();
  }, []);

  // Reload products when sort changes
  useEffect(() => {
    loadProducts();
  }, [activeSort]);

  return {
    products,
    categories,
    isLoadingProducts,
    isLoadingCategories,
    productsError,
    categoriesError,
    activeSort,
    setActiveSort,
    refreshData
  };
}
