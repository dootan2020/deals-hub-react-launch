
import { useState, useEffect } from 'react';
import { fetchProductsWithFilters } from '@/services/product/productService';
import { fetchAllCategories, fetchSubcategoriesByParentId } from '@/services/categoryService';
import { Product, SortOption, Category, SubcategoryItem } from '@/types';
import { toast } from '@/hooks/use-toast';

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
      const productPromise = fetchProductsWithFilters({ sort: activeSort });
      const timeoutPromise = new Promise<null>((_, reject) => 
        setTimeout(() => reject(new Error('Quá thời gian tải dữ liệu sản phẩm')), 10000)
      );
      
      const result = await Promise.race([productPromise, timeoutPromise]);
      
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
      setProductsError('Không thể tải dữ liệu sản phẩm');
      toast.error('Lỗi tải dữ liệu', 'Không thể tải danh sách sản phẩm. Vui lòng thử lại sau');
    } finally {
      setIsLoadingProducts(false);
    }
  };

  const loadCategories = async () => {
    setIsLoadingCategories(true);
    setCategoriesError(null);
    
    try {
      const categoryPromise = fetchAllCategories();
      const timeoutPromise = new Promise<Category[]>((_, reject) => 
        setTimeout(() => reject(new Error('Quá thời gian tải danh mục')), 10000)
      );
      
      const result = await Promise.race([categoryPromise, timeoutPromise]);
      
      if (Array.isArray(result) && result.length > 0) {
        // Filter main categories (no parent_id)
        const mainCategories = result.filter(cat => !cat.parent_id);
        
        // For each main category, fetch top 4 subcategories and total count
        const categoriesWithSubs: CategoryWithSubs[] = await Promise.all(
          mainCategories.map(async (cat) => {
            const subs = await fetchSubcategoriesByParentId(cat.id);
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
          })
        );

        setCategories(categoriesWithSubs);
        setCategoriesError(null);
      } else {
        setCategories([]);
        setCategoriesError('Không có danh mục nào');
      }
    } catch (error) {
      console.error('Lỗi khi tải danh mục:', error);
      setCategoriesError('Không thể tải danh mục');
      toast.error('Lỗi tải dữ liệu', 'Không thể tải danh mục. Vui lòng thử lại sau');
    } finally {
      setIsLoadingCategories(false);
    }
  };

  const refreshData = async () => {
    await Promise.allSettled([loadProducts(), loadCategories()]);
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
