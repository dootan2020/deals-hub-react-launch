
import { useState, useEffect } from 'react';
import { Category, SortOption } from '@/types';
import { fetchCategoryBySlug } from '@/services/categoryService';

export interface UseCategoryDataProps {
  slug: string;
}

export const useCategoryData = ({ slug }: UseCategoryDataProps) => {
  const [category, setCategory] = useState<Category | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [currentSort, setCurrentSort] = useState<SortOption>('newest');
  const [products, setProducts] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [subcategories, setSubcategories] = useState<Category[]>([]);
  const [loadingMore, setLoadingMore] = useState<boolean>(false);
  const [hasMore, setHasMore] = useState<boolean>(false);
  const [activeFilters, setActiveFilters] = useState({ sort: 'newest' as SortOption });
  
  useEffect(() => {
    const loadCategory = async () => {
      setLoading(true);
      try {
        const data = await fetchCategoryBySlug(slug);
        setCategory(data);
        
        // Fetch subcategories if available
        if (data && data.subcategories) {
          setSubcategories(data.subcategories);
        }
        
        setError(null);
      } catch (error) {
        console.error('Error fetching category:', error);
        setError('Failed to load category data');
      } finally {
        setLoading(false);
      }
    };
    
    loadCategory();
  }, [slug]);
  
  const handleSortChange = (newSort: string) => {
    setCurrentSort(newSort as SortOption);
  };
  
  const loadMore = () => {
    // Placeholder for loading more products
    setLoadingMore(true);
    setTimeout(() => {
      setLoadingMore(false);
    }, 500);
  };
  
  const setSelectedCategory = (categoryId: string) => {
    // Placeholder for setting selected category
    console.log('Setting selected category:', categoryId);
  };
  
  return {
    category,
    loading,
    currentSort,
    handleSortChange,
    products,
    error,
    subcategories,
    loadingMore,
    hasMore,
    loadMore,
    activeFilters,
    setSelectedCategory
  };
};
