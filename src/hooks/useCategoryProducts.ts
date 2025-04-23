
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Product, Category } from '@/types';
import { extractSafeData } from '@/utils/supabaseHelpers';
import { prepareQueryParam } from '@/utils/supabaseTypeUtils';

const PAGE_SIZE = 12; // Number of products per page

export const useCategoryProducts = (categoryId?: string) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [childCategories, setChildCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  
  // Fetch products in category
  const fetchProducts = useCallback(async (page = 1, reset = false) => {
    if (!categoryId) {
      setProducts([]);
      setLoading(false);
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      const from = (page - 1) * PAGE_SIZE;
      const to = from + PAGE_SIZE - 1;
      
      // Fetch products count first for this category
      const countQuery = await supabase
        .from('products')
        .select('id', { count: 'exact' })
        .eq('category_id', prepareQueryParam(categoryId));
        
      if (countQuery.error) throw new Error(countQuery.error.message);
      setTotal(countQuery.count || 0);
      
      // Then fetch the actual products with pagination
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('category_id', prepareQueryParam(categoryId))
        .order('created_at', { ascending: false })
        .range(from, to);
        
      if (error) throw new Error(error.message);
      
      // Transform data to make sure it matches our Product type
      const processedProducts = data.map(product => {
        const safeProduct = extractSafeData<Product>(product);
        return {
          ...(safeProduct || {}),
          inStock: safeProduct?.in_stock || false,
          in_stock: safeProduct?.inStock || false,
        } as Product;
      });
      
      setProducts(reset ? processedProducts : [...products, ...processedProducts]);
    } catch (err) {
      console.error('Error fetching products:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch products');
    } finally {
      setLoading(false);
    }
  }, [categoryId, products]);
  
  // Fetch child categories
  const fetchChildCategories = useCallback(async () => {
    if (!categoryId) {
      setChildCategories([]);
      return;
    }
    
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('parent_id', prepareQueryParam(categoryId));
        
      if (error) throw new Error(error.message);
      
      const childCats = data.map(cat => {
        const safeCategory = extractSafeData<Category>(cat);
        if (!safeCategory) {
          return {
            id: '',
            name: '',
            description: '',
            slug: '',
            image: '',
            count: 0,
            parent_id: null
          } as Category;
        }
        return safeCategory;
      });
      
      setChildCategories(childCats);
    } catch (err) {
      console.error('Error fetching child categories:', err);
    }
  }, [categoryId]);
  
  // Initial data fetch
  useEffect(() => {
    if (categoryId) {
      setPage(1);
      fetchProducts(1, true);
      fetchChildCategories();
    }
  }, [categoryId, fetchProducts, fetchChildCategories]);
  
  // Function to load more products
  const fetchMore = useCallback(async () => {
    const nextPage = page + 1;
    await fetchProducts(nextPage);
    setPage(nextPage);
  }, [page, fetchProducts]);
  
  // Function to refresh current products
  const refresh = useCallback(() => {
    setPage(1);
    fetchProducts(1, true);
  }, [fetchProducts]);
  
  return {
    products,
    childCategories,
    loading,
    error,
    total,
    fetchMore,
    refresh
  };
};
