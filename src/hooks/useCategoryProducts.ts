
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
  sort?: SortOption;
}

export const useCategoryProducts = (options: UseCategoryProductsOptions | string) => {
  // Process options whether it's a string or an object
  const categorySlug = typeof options === 'string' ? options : options.categorySlug;
  const filterParams = typeof options !== 'string' ? options.filterParams || {} : {};
  const limit = typeof options !== 'string' ? options.limit || 10 : 10;
  const initialPage = typeof options !== 'string' ? options.page || 1 : 1;
  const customSort = typeof options !== 'string' ? options.sort : undefined;
  const isProductsPage = typeof options !== 'string' ? options.isProductsPage : false;
  
  const [products, setProducts] = useState<Product[]>([]);
  const [category, setCategory] = useState<Category | null>(null);
  const [childCategories, setChildCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [total, setTotal] = useState<number>(0);
  const [sort, setSort] = useState<SortOption>(customSort || filterParams.sort || 'popular');
  const [page, setPage] = useState<number>(initialPage);
  const [loadingMore, setLoadingMore] = useState(false);

  const refresh = () => {
    fetchCategoryProducts();
  };

  const fetchMore = async () => {
    if (!category) return;
    
    setLoadingMore(true);
    const nextPage = page + 1;
    setPage(nextPage);
    
    try {
      let query = supabase
        .from('products')
        .select('*')

      // If using on products page without category, don't filter by category
      if (!isProductsPage || (isProductsPage && category)) {
        query = query.eq('category_id', category.id);
      }
      
      query = query.range((nextPage - 1) * limit, (nextPage * limit) - 1);
      
      if (filterParams.minPrice) {
        query = query.gte('price', filterParams.minPrice);
      }
      
      if (filterParams.maxPrice) {
        query = query.lte('price', filterParams.maxPrice);
      }
      
      if (filterParams.inStock !== undefined) {
        query = query.eq('in_stock', filterParams.inStock);
      }
      
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
    } finally {
      setLoadingMore(false);
    }
  };

  const fetchCategoryProducts = async () => {
    if (!categorySlug && !isProductsPage) {
      setLoading(false);
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      // Only fetch category if we have a categorySlug
      if (categorySlug) {
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
        
        const categoryObj = adaptCategory(categoryData);
        setCategory(categoryObj);
        
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
      }
      
      // For products page, fetch all products
      let query = supabase.from('products').select('*', { count: 'exact' });
      
      // If not products page or if we have a category on products page
      if (category && (!isProductsPage || (isProductsPage && categorySlug))) {
        query = query.eq('category_id', category.id);
      }
      
      const { count, error: countError } = await query.select('*', { count: 'exact', head: true });
      
      if (countError) {
        console.error('Error fetching product count:', countError);
      }
      
      setTotal(count || 0);
      
      // Fetch actual products
      query = supabase.from('products').select('*');
      
      // Filter by category if needed
      if (category && (!isProductsPage || (isProductsPage && categorySlug))) {
        query = query.eq('category_id', category.id);
      }
      
      query = query.range(0, limit - 1);
      
      if (filterParams.minPrice) {
        query = query.gte('price', filterParams.minPrice);
      }
      
      if (filterParams.maxPrice) {
        query = query.lte('price', filterParams.maxPrice);
      }
      
      if (filterParams.inStock !== undefined) {
        query = query.eq('in_stock', filterParams.inStock);
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
  }, [categorySlug, JSON.stringify(filterParams), limit, initialPage, isProductsPage]);

  const handleSortChange = (newSort: SortOption) => {
    setSort(newSort);
    refresh();
  };

  // Function for ProductsPage to filter by category
  const setSelectedCategory = (categoryId: string | null) => {
    if (!categoryId) return;
    
    // TODO: Implement category filtering logic
    console.log('Filtering by category:', categoryId);
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
    loadingMore,
    hasMore: total > products.length,
    loadMore: fetchMore,
    setSelectedCategory
  };
};
