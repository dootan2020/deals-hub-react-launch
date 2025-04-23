import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Product, SortOption, FilterParams, Category } from '@/types';
import { fetchProductsWithFilters } from '@/services/product';
import { useSearchParams } from 'react-router-dom';

interface UseSubcategoryProductsResult {
  products: Product[];
  category: Category | null;
  loading: boolean;
  error: string | null;
  sortOption: SortOption;
  setSortOption: (option: SortOption) => void;
  filterParams: FilterParams;
  setFilterParams: (params: FilterParams) => void;
}

export const useSubcategoryProducts = (categorySlug: string | undefined): UseSubcategoryProductsResult => {
  const [products, setProducts] = useState<Product[]>([]);
  const [category, setCategory] = useState<Category | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [sortOption, setSortOption] = useState<SortOption>('newest');
  const [filterParams, setFilterParams] = useState<FilterParams>({});
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const initialSort = (searchParams.get('sort') || 'newest') as SortOption;
    setSortOption(initialSort);
  }, [searchParams]);

  useEffect(() => {
    loadProducts();
  }, [categorySlug, sortOption, filterParams]);

  const loadProducts = async (forceRefresh = false) => {
    if (!categorySlug) return;
    
    setLoading(true);
    try {
      // Get current category first
      const { data: categoryData } = await supabase
        .from('categories')
        .select('*')
        .eq('slug', categorySlug)
        .single();
    
      if (!categoryData) {
        setError('Category not found');
        setLoading(false);
        return;
      }
    
      setCategory(adaptCategory(categoryData));
    
      // Then fetch products with this category
      const result = await fetchProductsWithFilters({
        category: categoryData.id,
        sort: sortOption,
        // Use the correct key 'category' instead of 'subcategory'
        ...filterParams
      });
    
      if (result && result.products) {
        setProducts(result.products);
      } else {
        setProducts([]);
      }
    } catch (err) {
      setError('Error loading products');
      console.error('Error loading products:', err);
    } finally {
      setLoading(false);
    }
  };

  // Fix the adaptCategory function return type
  const adaptCategory = (category: any) => {
    return {
      id: category.id,
      name: category.name,
      slug: category.slug,
      description: category.description,
      image: category.image,
      count: category.count,
      parent_id: category.parent_id,
      created_at: category.created_at
    };
  };

  return {
    products,
    category,
    loading,
    error,
    sortOption,
    setSortOption,
    filterParams,
    setFilterParams
  };
};
