
import { useState, useEffect } from 'react';
import { fetchProductsWithFilters } from '@/services/product/productService';
import { fetchAllCategories, fetchSubcategoriesByParentId } from '@/services/categoryService';
import { Product, SortOption, Category } from '@/types';
import { SubcategoryItem } from '@/types/category.types';
import { toast } from '@/hooks/use-toast';
import { fetchWithTimeout } from '@/utils/fetchWithTimeout';

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

  const loadProducts = async () => {
    setIsLoadingProducts(true);
    setProductsError(null);
    
    try {
      const result = await fetchWithTimeout(
        fetchProductsWithFilters({ sort: activeSort }),
        7000,
        'Quá thời gian tải dữ liệu sản phẩm'
      );
      
      if (Array.isArray(result)) {
        setProducts(result);
      } else if (result && Array.isArray(result.products)) {
        setProducts(result.products);
      } else {
        setProducts([]);
        setProductsError('Không có sản phẩm phù hợp');
      }
    } catch (error) {
      console.error('Lỗi khi tải sản phẩm:', error);
      setProductsError('Không thể tải dữ liệu sản phẩm. Vui lòng thử lại sau');
      toast.error('Lỗi tải dữ liệu', 'Không thể tải danh sách sản phẩm. Vui lòng thử lại sau');
    } finally {
      setIsLoadingProducts(false);
    }
  };

  const loadCategories = async () => {
    setIsLoadingCategories(true);
    setCategoriesError(null);
    
    try {
      // Fetch all categories first
      const allCategories = await fetchWithTimeout(
        fetchAllCategories(),
        7000,
        'Quá thời gian tải danh mục'
      );
      
      if (Array.isArray(allCategories) && allCategories.length > 0) {
        // Filter main categories (no parent_id)
        const mainCategories = allCategories.filter(cat => !cat.parent_id);
        
        // Use Promise.allSettled to fetch subcategories for all main categories
        const subcategoryPromises = mainCategories.map(cat => 
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
        const categoriesWithSubs: CategoryWithSubs[] = mainCategories.map((cat, index) => {
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

        setCategories(categoriesWithSubs);
        setCategoriesError(null);
      } else {
        setCategories([]);
        setCategoriesError('Không có danh mục nào');
      }
    } catch (error) {
      console.error('Lỗi khi tải danh mục:', error);
      setCategoriesError('Không thể tải danh mục. Vui lòng thử lại sau');
      toast.error('Lỗi tải dữ liệu', 'Không thể tải danh mục. Vui lòng thử lại sau');
    } finally {
      setIsLoadingCategories(false);
    }
  };

  const refreshData = async () => {
    // Using Promise.allSettled to prevent one failure from blocking the other
    const results = await Promise.allSettled([loadProducts(), loadCategories()]);
    
    // Log any errors for debugging
    results.forEach((result, index) => {
      if (result.status === 'rejected') {
        console.error(`Lỗi khi tải dữ liệu ${index === 0 ? 'sản phẩm' : 'danh mục'}:`, result.reason);
      }
    });
  };

  useEffect(() => {
    loadProducts();
  }, [activeSort]);

  useEffect(() => {
    loadCategories();
  }, []);

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
