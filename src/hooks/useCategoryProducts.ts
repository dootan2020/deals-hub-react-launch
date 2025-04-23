import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { safeId, extractSafeData } from '@/utils/supabaseHelpers';

// Define types for product and category
export interface Product {
  id: string;
  title: string;
  description: string;
  price: number;
  original_price?: number | null;
  images?: string[];
  slug: string;
  in_stock?: boolean;
  category_id?: string;
  badges?: string[];
}

export interface Category {
  id: string;
  name: string;
  description: string;
  slug: string;
  count: number;
  parent_id?: string | null;
}

export function useCategoryProducts(
  categorySlug?: string,
  options = { 
    limit: 12, 
    initialFetch: true,
    includeChildren: true,
    sortBy: 'created_at',
    sortOrder: 'desc'
  }
) {
  const [products, setProducts] = useState<Product[]>([]);
  const [category, setCategory] = useState<Category | null>(null);
  const [childCategories, setChildCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(options.initialFetch);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState(0);

  // Function to fetch a single category by slug
  const fetchCategory = useCallback(async () => {
    if (!categorySlug) return null;
    
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('slug', categorySlug)
        .maybeSingle();
        
      if (error) throw error;
      
      const categoryData = extractSafeData<Category>(data);
      return categoryData;
    } catch (err) {
      console.error('Error fetching category:', err);
      return null;
    }
  }, [categorySlug]);

  // Function to fetch child categories
  const fetchChildCategories = useCallback(async (parentId: string) => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('parent_id', safeId(parentId));
        
      if (error) throw error;
      
      // Process each item individually since we can't cast the whole array at once
      return (data || []).map(item => {
        if (!item) return null;
        
        return {
          id: item.id || '',
          name: item.name || '',
          description: item.description || '',
          slug: item.slug || '',
          count: item.count || 0,
          parent_id: item.parent_id || null
        } as Category;
      }).filter(Boolean) as Category[];
    } catch (err) {
      console.error('Error fetching child categories:', err);
      return [];
    }
  }, []);

  // Fetch products based on category and options
  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      let categoryId: string | null = null;
      let childCategoryIds: string[] = [];

      // Fetch the category to get its ID
      const fetchedCategory = await fetchCategory();
      if (fetchedCategory) {
        setCategory(fetchedCategory);
        categoryId = fetchedCategory.id;
      }

      // If including children, fetch child categories and their IDs
      if (options.includeChildren && categoryId) {
        const children = await fetchChildCategories(categoryId);
        setChildCategories(children);
        childCategoryIds = children.map(child => child.id);
      }

      // Construct the query
      let query = supabase
        .from('products')
        .select('*, categories(name)', { count: 'exact' })
        .order(options.sortBy, { ascending: options.sortOrder === 'asc' })
        .limit(options.limit);

      // Apply category filter
      if (categoryId) {
        const categoryFilter = [categoryId, ...childCategoryIds];
        query = query.in('category_id', categoryFilter);
      }

      const { data, error, count } = await query;

      if (error) throw error;

      // Process the data
      const productList = (data || []).map(item => {
        if (!item) return null;

        return {
          id: item.id || '',
          title: item.title || '',
          description: item.description || '',
          price: item.price || 0,
          original_price: item.original_price || null,
          images: item.images || [],
          slug: item.slug || '',
          in_stock: item.in_stock || false,
          category_id: item.category_id || '',
          badges: item.badges || []
        } as Product;
      }).filter(Boolean) as Product[];

      setProducts(productList);
      setTotal(count || 0);
    } catch (err) {
      console.error('Error fetching products:', err);
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  }, [categorySlug, options.limit, options.sortBy, options.sortOrder, options.includeChildren, fetchCategory, fetchChildCategories]);

  useEffect(() => {
    if (options.initialFetch) {
      fetchProducts();
    }
  }, [fetchProducts, options.initialFetch]);

  return {
    products,
    loading,
    error,
    category,
    childCategories,
    total,
    fetchMore: () => {}, // Implement as needed
    refresh: () => {}    // Implement as needed
  };
}
