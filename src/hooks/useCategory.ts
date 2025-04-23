import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { safeId, extractSafeData } from '@/utils/supabaseHelpers';

// Type definitions for category data
interface Category {
  id: string;
  name: string;
  description: string;
  slug: string;
  image?: string;
  count?: number;
  parent_id?: string | null;
}

interface CategoryWithParent extends Category {
  parent?: Category | null;
}

export function useCategory(slug?: string, initialFetch: boolean = true) {
  const [category, setCategory] = useState<CategoryWithParent | null>(null);
  const [loading, setLoading] = useState(initialFetch);
  const [error, setError] = useState<string | null>(null);

  const fetchCategory = useCallback(async () => {
    if (!slug) {
      setCategory(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Fetch the category by slug
      const { data: categoryData, error: categoryError } = await supabase
        .from('categories')
        .select('*')
        .eq('slug', slug)
        .maybeSingle();

      if (categoryError) throw new Error(categoryError.message);
      
      // Use extractSafeData to handle the response safely
      const safeCategoryData = extractSafeData<Category>(categoryData);
      
      if (!safeCategoryData) {
        throw new Error('Category not found');
      }
      
      // Now we have a properly typed category
      const result: CategoryWithParent = {
        ...safeCategoryData,
        parent: null
      };

      // If this category has a parent, fetch the parent data
      if (safeCategoryData.parent_id) {
        const { data: parentData, error: parentError } = await supabase
          .from('categories')
          .select('*')
          .eq('id', safeId(safeCategoryData.parent_id))
          .maybeSingle();

        if (parentError) {
          console.error('Error fetching parent category:', parentError);
        } else {
          // Use extractSafeData to handle the parent response safely
          const safeParentData = extractSafeData<Category>(parentData);
          if (safeParentData) {
            result.parent = safeParentData;
          }
        }
      }

      setCategory(result);
    } catch (err) {
      console.error('Error in fetchCategory:', err);
      setError(err instanceof Error ? err.message : String(err));
      setCategory(null);
    } finally {
      setLoading(false);
    }
  }, [slug]);

  useEffect(() => {
    if (initialFetch) {
      fetchCategory();
    }
  }, [fetchCategory, initialFetch]);

  return {
    category,
    loading,
    error,
    fetchCategory,
  };
}
