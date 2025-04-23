
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Product, Category, FilterParams, SortOption } from '@/types';
import { adaptCategory, adaptProduct } from '@/utils/dataAdapters';
import { extractSafeData } from '@/utils/supabaseHelpers';

export interface UseCategoryProductsOptions {
  categorySlug: string;
  filterParams?: FilterParams;
  limit?: number;
  page?: number;
  isProductsPage?: boolean;
}

export const useCategoryProducts = (options: UseCategoryProductsOptions | string) => {
  // Handle string parameter for backwards compatibility
  const categorySlug = typeof options === 'string' ? options : options.categorySlug;
  const filterParams = typeof options !== 'string' ? options.filterParams || {} : {};
  const limit = typeof options !== 'string' ? options.limit || 10 : 10;
  const initialPage = typeof options !== 'string' ? options.page || 1 : 1;
  
  const [products, setProducts] = useState<Product[]>([]);
  const [category, setCategory] = useState<Category | null>(null);
  const [childCategories, setChildCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [total, setTotal] = useState<number>(0);
  const [sort, setSort] = useState<SortOption>(filterParams.sort || 'popular');
  const [page, setPage] = useState<number>(initialPage);

  const refresh = () => {
    fetchCategoryProducts();
  };

  const fetchMore = async () => {
    if (!category) return;
    
    const nextPage = page + 1;
    setPage(nextPage);
    
    try {
      // Products query
      let query = supabase
        .from('products')
        .select('*')
        .eq('category_id', category.id)
        .range((nextPage - 1) * limit, (nextPage * limit) - 1);
      
      // Apply filters
      if (filterParams.minPrice) {
        query = query.gte('price', filterParams.minPrice);
      }
      
      if (filterParams.maxPrice) {
        query = query.lte('price', filterParams.maxPrice);
      }
      
      if (filterParams.inStock !== undefined) {
        query = query.eq('in_stock', filterParams.inStock);
      }
      
      // Apply sorting
      const sortOption = filterParams.sort || sort;
      switch (sortOption) {
        case 'price-low':
          query = query.order('price', { ascending: true });
          break;
        case 'price-high':
          query = query.order('price', { ascending: false });
          break;
        case 'newest':
          query = query.order('created_at', { ascending: false });
          break;
        case 'popular':
        default:
          query = query.order('sales_count', { ascending: false });
      }
      
      const { data: productsData, error: productsError } = await query;
      
      if (productsError) {
        throw productsError;
      }
      
      if (productsData && Array.isArray(productsData)) {
        const newProducts = productsData.map(item => {
          const safeItem = extractSafeData(item);
          return safeItem ? adaptProduct(safeItem) : null;
        }).filter(Boolean) as Product[];
        
        setProducts(prev => [...prev, ...newProducts]);
      }
    } catch (err: any) {
      console.error('Error fetching more products:', err);
    }
  };

  const fetchCategoryProducts = async () => {
    if (!categorySlug) {
      setLoading(false);
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      // First, get the category
      const { data: categoryData, error: categoryError } = await supabase
        .from('categories')
        .select('*')
        .eq('slug', categorySlug)
        .single();
      
      if (categoryError) {
        throw categoryError;
      }
      
      if (!categoryData) {
        throw new Error('Category not found');
      }
      
      // Safely extract category data and adapt to our model
      const categoryObj = adaptCategory(categoryData);
      setCategory(categoryObj);
      
      // Get child categories
      const { data: childCategoriesData, error: childCategoriesError } = await supabase
        .from('categories')
        .select('*')
        .eq('parent_id', categoryObj.id);
      
      if (!childCategoriesError && childCategoriesData && Array.isArray(childCategoriesData)) {
        const children = childCategoriesData.map(item => {
          const safeItem = extractSafeData(item);
          return safeItem ? adaptCategory(safeItem) : null;
        }).filter(Boolean) as Category[];
        
        setChildCategories(children);
      } else {
        setChildCategories([]);
      }
      
      // Get total count of products
      const { count, error: countError } = await supabase
        .from('products')
        .select('*', { count: 'exact', head: true })
        .eq('category_id', categoryObj.id);
      
      if (countError) {
        console.error('Error fetching product count:', countError);
      }
      
      setTotal(count || 0);
      
      // Query products
      let query = supabase
        .from('products')
        .select('*')
        .eq('category_id', categoryObj.id)
        .range(0, limit - 1);
      
      // Apply filters
      if (filterParams.minPrice) {
        query = query.gte('price', filterParams.minPrice);
      }
      
      if (filterParams.maxPrice) {
        query = query.lte('price', filterParams.maxPrice);
      }
      
      if (filterParams.inStock !== undefined) {
        query = query.eq('in_stock', filterParams.inStock);
      }
      
      // Apply sorting
      const sortOption = filterParams.sort || sort;
      switch (sortOption) {
        case 'price-low':
          query = query.order('price', { ascending: true });
          break;
        case 'price-high':
          query = query.order('price', { ascending: false });
          break;
        case 'newest':
          query = query.order('created_at', { ascending: false });
          break;
        case 'popular':
        default:
          query = query.order('sales_count', { ascending: false });
      }
      
      const { data: productsData, error: productsError } = await query;
      
      if (productsError) {
        throw productsError;
      }
      
      if (productsData && Array.isArray(productsData)) {
        const fetchedProducts = productsData.map(item => {
          const safeItem = extractSafeData(item);
          return safeItem ? adaptProduct(safeItem) : null;
        }).filter(Boolean) as Product[];
        
        setProducts(fetchedProducts);
      }
    } catch (err: any) {
      console.error('Error fetching category products:', err);
      setError(err.message || 'Failed to fetch category and products');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategoryProducts();
  }, [categorySlug, JSON.stringify(filterParams), limit, initialPage]);

  const handleSortChange = (newSort: SortOption) => {
    setSort(newSort);
    refresh();
  };

  return { 
    products, 
    category, 
    childCategories, 
    loading, 
    error, 
    total, 
    fetchMore, 
    refresh, 
    sort, 
    handleSortChange,
    // Add missing properties needed by consumers
    loadingMore: false,
    hasMore: total > products.length,
    loadMore: fetchMore,
    setSelectedCategory: (categoryId: string | null) => {}
  };
};
