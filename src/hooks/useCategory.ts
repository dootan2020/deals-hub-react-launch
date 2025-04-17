
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from "@/components/ui/use-toast";
import { supabase } from '@/integrations/supabase/client';
import { fetchCategoryBySlug } from '@/services/categoryService';
import { CategoryWithParent } from '@/types/category.types';

interface UseCategoryProps {
  categorySlug?: string;
  parentCategorySlug?: string;
}

export const useCategory = ({ categorySlug, parentCategorySlug }: UseCategoryProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [category, setCategory] = useState<CategoryWithParent | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCategory = async () => {
      try {
        setLoading(true);
        setError(null);
        
        if (parentCategorySlug && categorySlug) {
          const parentCategory = await fetchCategoryBySlug(parentCategorySlug);
          
          if (!parentCategory) {
            setError('Parent category not found');
            return;
          }
          
          const childCategory = await fetchCategoryBySlug(categorySlug);
          
          if (!childCategory) {
            setError('Category not found');
            return;
          }
          
          if (childCategory.parent_id !== parentCategory.id) {
            navigate(`/category/${categorySlug}`, { replace: true });
            return;
          }
          
          setCategory({
            ...childCategory,
            parent: parentCategory
          });
        } else if (categorySlug) {
          const fetchedCategory = await fetchCategoryBySlug(categorySlug);
          
          if (!fetchedCategory) {
            setError('Category not found');
            return;
          }
          
          if (fetchedCategory.parent_id) {
            const { data: parentData } = await supabase
              .from('categories')
              .select('*')
              .eq('id', fetchedCategory.parent_id)
              .maybeSingle();
              
            if (parentData) {
              setCategory({
                ...fetchedCategory,
                parent: parentData
              });
              
              navigate(`/category/${parentData.slug}/${fetchedCategory.slug}`, { replace: true });
              return;
            }
          }
          
          setCategory(fetchedCategory);
        } else {
          setError('Category not specified');
        }
      } catch (err) {
        console.error('Error fetching category:', err);
        setError('Failed to load category');
        toast({
          title: "Error",
          description: "Failed to load category data. Please try again.",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    fetchCategory();
  }, [categorySlug, parentCategorySlug, navigate, toast]);

  return { category, loading, error };
};
