
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
  
  useEffect(() => {
    const loadCategory = async () => {
      setLoading(true);
      try {
        const data = await fetchCategoryBySlug(slug);
        setCategory(data);
      } catch (error) {
        console.error('Error fetching category:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadCategory();
  }, [slug]);
  
  const handleSortChange = (newSort: string) => {
    setCurrentSort(newSort as SortOption);
  };
  
  return {
    category,
    loading,
    currentSort,
    handleSortChange
  };
};
