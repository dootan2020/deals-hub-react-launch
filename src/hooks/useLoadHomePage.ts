
import { useState, useEffect } from 'react';
import { fetchProductsWithFilters } from '@/services/product/productService';
import { fetchMainCategories } from '@/services/categoryService';
import { Product, SortOption, Category } from '@/types';
import { toast } from '@/hooks/use-toast';

interface UseLoadHomePageResult {
  products: Product[];
  categories: Category[];
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
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(true);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);
  const [productsError, setProductsError] = useState<string | null>(null);
  const [categoriesError, setCategoriesError] = useState<string | null>(null);
  const [activeSort, setActiveSort] = useState<SortOption>('newest');

  const loadProducts = async () => {
    setIsLoadingProducts(true);
    setProductsError(null);
    
    try {
      // Sử dụng timeout để đảm bảo không loading mãi
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
      // Sử dụng timeout để đảm bảo không loading mãi
      const categoryPromise = fetchMainCategories();
      const timeoutPromise = new Promise<null>((_, reject) => 
        setTimeout(() => reject(new Error('Quá thời gian tải danh mục')), 10000)
      );
      
      const result = await Promise.race([categoryPromise, timeoutPromise]);
      
      if (Array.isArray(result) && result.length > 0) {
        setCategories(result);
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
