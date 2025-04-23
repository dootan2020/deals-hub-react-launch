
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Product, Category, FilterParams, SortOption } from '@/types';
import { adaptCategory, adaptProduct } from '@/utils/dataAdapters';
import { extractSafeData } from '@/utils/supabaseHelpers';

interface UseCategoryProductsOptions {
  categorySlug: string;
  filterParams?: FilterParams;
  limit?: number;
  page?: number;
}

export const useCategoryProducts = ({ 
  categorySlug, 
  filterParams = {}, 
  limit = 10,
  page = 1 
}: UseCategoryProductsOptions) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [category, setCategory] = useState<Category | null>(null);
  const [childCategories, setChildCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [total, setTotal] = useState<number>(0);
  const [sort, setSort] = useState<SortOption>(filterParams.sort || 'popular');

  const refresh = () => {
    fetchCategoryProducts();
  };

  const fetchMore = async () => {
    if (!category) return;
    
    try {
      // Products query
      let query = supabase
        .from('products')
        .select('*')
        .eq('category_id', category.id)
        .range((page * limit), ((page + 1) * limit) - 1);
      
      // Apply filters
      if (filterParams.minPrice) {
        query = query.gte('price', filterParams.minPrice);
      }
      
      if (filterParams.maxPrice) {
        query = query.lte('price', filterParams.maxPrice);
      }
      
      if (filterParams.inStock) {
        query = query.eq('inStock', filterParams.inStock);
      }
      
      // Apply sorting
      switch (filterParams.sort || sort) {
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
      
      const { data, error: productsError } = await query;
      
      if (productsError) {
        throw productsError;
      }
      
      if (data) {
        const newProducts: Product[] = [];
        
        for (const item of data) {
          const extractedProduct = extractSafeData(item);
          if (extractedProduct) {
            const product = adaptProduct(extractedProduct);
            newProducts.push(product);
          }
        }
        
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
      
      const extractedCategory = extractSafeData(categoryData);
      if (!extractedCategory) {
        throw new Error('Failed to extract category data');
      }
      
      const currentCategory = adaptCategory(extractedCategory);
      setCategory(currentCategory);
      
      // Get child categories
      const { data: childCategoriesData, error: childCategoriesError } = await supabase
        .from('categories')
        .select('*')
        .eq('parentId', currentCategory.id);
      
      if (!childCategoriesError && childCategoriesData) {
        const children = [];
        for (const child of childCategoriesData) {
          const extractedChild = extractSafeData(child);
          if (extractedChild) {
            children.push(adaptCategory(extractedChild));
          }
        }
        setChildCategories(children);
      } else {
        setChildCategories([]);
      }
      
      // Products query with count
      const { count } = await supabase
        .from('products')
        .select('*', { count: 'exact', head: true })
        .eq('category_id', currentCategory.id);
      
      setTotal(count || 0);
      
      // Products query
      let query = supabase
        .from('products')
        .select('*')
        .eq('category_id', currentCategory.id)
        .range(0, limit - 1);
      
      // Apply filters
      if (filterParams.minPrice) {
        query = query.gte('price', filterParams.minPrice);
      }
      
      if (filterParams.maxPrice) {
        query = query.lte('price', filterParams.maxPrice);
      }
      
      if (filterParams.inStock) {
        query = query.eq('inStock', filterParams.inStock);
      }
      
      // Apply sorting
      switch (filterParams.sort || sort) {
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
      
      if (productsData) {
        const fetchedProducts: Product[] = [];
        
        for (const item of productsData) {
          const extractedProduct = extractSafeData(item);
          if (extractedProduct) {
            const product = adaptProduct(extractedProduct);
            fetchedProducts.push(product);
          }
        }
        
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
  }, [categorySlug, JSON.stringify(filterParams), limit]);

  const handleSortChange = (newSort: SortOption) => {
    setSort(newSort);
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
    handleSortChange 
  };
};
