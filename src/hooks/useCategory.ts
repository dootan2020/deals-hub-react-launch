
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Category } from '@/types';
import { adaptCategory } from '@/utils/dataAdapters';
import { extractSafeData } from '@/utils/supabaseHelpers';

export interface CategoryWithParent extends Category {
  parent?: Category | null;
}

export const useCategory = (categorySlug: string) => {
  const [category, setCategory] = useState<CategoryWithParent | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const fetchCategory = async () => {
      if (!categorySlug) {
        setLoading(false);
        return;
      }

      setLoading(true);
      setError('');

      try {
        // Fetch the category data
        const { data, error } = await supabase
          .from('categories')
          .select('*')
          .eq('slug', categorySlug)
          .single();

        if (error) {
          throw error;
        }

        if (data) {
          const categoryData = extractSafeData<{
            id: string;
            name: string;
            description: string;
            slug: string;
            image: string;
            count: number;
            parent_id: string | null;
          }>(data);
          
          if (categoryData) {
            const adaptedCategory = adaptCategory(categoryData);
            const categoryWithParent: CategoryWithParent = {
              ...adaptedCategory,
              parent: null
            };

            // If category has a parent, fetch parent data
            if (categoryData.parent_id) {
              const { data: parentData, error: parentError } = await supabase
                .from('categories')
                .select('*')
                .eq('id', categoryData.parent_id)
                .single();

              if (!parentError && parentData) {
                const extractedParent = extractSafeData(parentData);
                if (extractedParent) {
                  categoryWithParent.parent = adaptCategory(extractedParent);
                }
              }
            }

            setCategory(categoryWithParent);
          } else {
            setCategory(null);
            setError('Could not process category data');
          }
        } else {
          setCategory(null);
          setError('Category not found');
        }
      } catch (err: any) {
        console.error('Error fetching category:', err);
        setCategory(null);
        setError(err.message || 'Failed to fetch category');
      } finally {
        setLoading(false);
      }
    };

    fetchCategory();
  }, [categorySlug]);

  return { category, loading, error };
};
