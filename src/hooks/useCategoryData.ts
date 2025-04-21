import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Category, SortOption } from '@/types';
import { toast } from '@/hooks/use-toast';

interface UseCategoryDataProps {
  categoryId?: string;
  sort?: SortOption;
}

export const useCategoryData = ({ categoryId, sort = 'popular' }: UseCategoryDataProps) => {
  const [category, setCategory] = useState<Category | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentSort, setCurrentSort] = useState<SortOption>(sort);

  useEffect(() => {
    const fetchCategory = async () => {
      setLoading(true);
      try {
        if (categoryId) {
          const { data, error } = await supabase
            .from('categories')
            .select('*')
            .eq('id', categoryId)
            .single();

          if (error) {
            throw error;
          }

          setCategory(data);
        } else {
          setCategory(null);
        }
      } catch (error) {
        if (process.env.NODE_ENV === 'development') {
          console.error("Error fetching category:", error);
        }
        toast.error("Error", "Failed to load category. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchCategory();
  }, [categoryId]);

  const handleSortChange = (newSort: string) => {
    setCurrentSort(newSort as SortOption);
  };

  return {
    category,
    loading,
    handleSortChange,
    currentSort
  };
};

