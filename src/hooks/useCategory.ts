
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from "@/hooks/use-toast";
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
        
        // Handle cases where we're on the /products route with no slug
        if (!categorySlug && !parentCategorySlug) {
          if (process.env.NODE_ENV === 'development') {
            console.log('No category slug provided, likely on products page');
          }
          setLoading(false);
          return;
        }
        
        if (parentCategorySlug && categorySlug) {
          // Nested category case
          const parentCategory = await fetchCategoryBySlug(parentCategorySlug);
          if (process.env.NODE_ENV === 'development') {
            console.log('Parent category fetched:', parentCategory);
          }
          
          if (!parentCategory) {
            setError('Parent category not found');
            setLoading(false);
            return;
          }
          
          const childCategory = await fetchCategoryBySlug(categorySlug);
          if (process.env.NODE_ENV === 'development') {
            console.log('Child category fetched:', childCategory);
          }
          
          if (!childCategory) {
            setError('Category not found');
            setLoading(false);
            return;
          }
          
          if (childCategory.parent_id !== parentCategory.id) {
            if (process.env.NODE_ENV === 'development') {
              console.log('Child category does not belong to parent, redirecting');
            }
            navigate(`/category/${categorySlug}`, { replace: true });
            return;
          }
          
          setCategory({
            ...childCategory,
            parent: parentCategory
          });
        } else if (categorySlug) {
          // Top level category case
          const fetchedCategory = await fetchCategoryBySlug(categorySlug);
          if (process.env.NODE_ENV === 'development') {
            console.log('Single category fetched:', fetchedCategory);
          }
          
          if (!fetchedCategory) {
            setError('Category not found');
            setLoading(false);
            return;
          }
          
          if (fetchedCategory.parent_id) {
            const { data: parentData } = await supabase
              .from('categories')
              .select('*')
              .eq('id', fetchedCategory.parent_id)
              .maybeSingle();
              
            if (process.env.NODE_ENV === 'development') {
              console.log('Parent data fetched for single category:', parentData);
            }
              
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
      } catch (err: any) {
        if (process.env.NODE_ENV === 'development') {
          console.error('Error fetching category:', err);
        }
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
