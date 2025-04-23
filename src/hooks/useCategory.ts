
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Category } from '@/types';
import { extractSafeData } from '@/utils/supabaseHelpers';
import { prepareQueryParam } from '@/utils/supabaseTypeUtils';

// Define the extended Category type with parent data
export interface CategoryWithParent extends Category {
  parent?: Category | null;
}

interface UseCategoryProps {
  categorySlug?: string;
  parentCategorySlug?: string;
}

export const useCategory = ({ categorySlug, parentCategorySlug }: UseCategoryProps) => {
  const [category, setCategory] = useState<CategoryWithParent | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchCategory = useCallback(async () => {
    if (!categorySlug) {
      setCategory(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError('');

    try {
      // First, fetch the category by slug
      const { data: categoryData, error: categoryError } = await supabase
        .from('categories')
        .select('*')
        .eq('slug', categorySlug)
        .single();

      if (categoryError) throw new Error(categoryError.message);
      
      const safeCategory = extractSafeData<Category>(categoryData);
      if (!safeCategory) {
        throw new Error('Category not found');
      }

      const category: CategoryWithParent = { ...safeCategory, parent: null };

      // If this category has a parent_id, fetch the parent category
      if (category.parent_id) {
        const { data: parentData, error: parentError } = await supabase
          .from('categories')
          .select('*')
          .eq('id', category.parent_id)
          .single();

        if (parentError) {
          console.error('Error fetching parent category:', parentError);
        } else {
          const safeParent = extractSafeData<Category>(parentData);
          if (safeParent) {
            category.parent = safeParent;
          }
        }
      } 
      // If parentCategorySlug is provided but no parent_id, look up by slug
      else if (parentCategorySlug) {
        const { data: parentData, error: parentError } = await supabase
          .from('categories')
          .select('*')
          .eq('slug', parentCategorySlug)
          .single();

        if (parentError) {
          console.error('Error fetching parent category by slug:', parentError);
        } else {
          const safeParent = extractSafeData<Category>(parentData);
          if (safeParent) {
            category.parent = safeParent;
          }
        }
      }

      setCategory(category);
    } catch (err) {
      console.error('Error fetching category:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch category');
    } finally {
      setLoading(false);
    }
  }, [categorySlug, parentCategorySlug]);

  useEffect(() => {
    fetchCategory();
  }, [fetchCategory]);

  return { category, loading, error, refetch: fetchCategory };
};
