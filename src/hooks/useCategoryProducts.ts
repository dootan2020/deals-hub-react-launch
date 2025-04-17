
import { useState, useEffect } from 'react';
import { useToast } from "@/components/ui/use-toast";
import { supabase } from '@/integrations/supabase/client';
import { Product } from '@/types';
import { PaginationState } from '@/types/category.types';

interface UseCategoryProductsProps {
  categoryId?: string;
}

export const useCategoryProducts = ({ categoryId }: UseCategoryProductsProps) => {
  const { toast } = useToast();
  const [products, setProducts] = useState<Product[]>([]);
  const [pagination, setPagination] = useState<PaginationState>({
    page: 1,
    pageSize: 12,
    totalPages: 1,
    totalItems: 0
  });
  const [loading, setLoading] = useState(true);

  const fetchProducts = async () => {
    if (!categoryId) return;

    try {
      const { data: directProducts, error, count } = await supabase
        .from('products')
        .select('*', { count: 'exact' })
        .eq('category_id', categoryId)
        .range(
          (pagination.page - 1) * pagination.pageSize,
          pagination.page * pagination.pageSize - 1
        );
        
      if (error) throw error;
      
      const { data: subcategories } = await supabase
        .from('categories')
        .select('id')
        .eq('parent_id', categoryId);
        
      let allProducts = directProducts || [];
      let totalCount = count || 0;
      
      if (subcategories && subcategories.length > 0) {
        const subcategoryIds = subcategories.map(sc => sc.id);
        
        const { count: subCount } = await supabase
          .from('products')
          .select('*', { count: 'exact' })
          .in('category_id', subcategoryIds);
          
        totalCount += subCount || 0;
        
        const remainingItems = pagination.pageSize - allProducts.length;
        
        if (remainingItems > 0) {
          const { data: subcategoryProducts } = await supabase
            .from('products')
            .select('*')
            .in('category_id', subcategoryIds)
            .range(0, remainingItems - 1);
            
          if (subcategoryProducts) {
            allProducts = [...allProducts, ...subcategoryProducts];
          }
        }
      }
      
      setPagination(prev => ({
        ...prev,
        totalItems: totalCount,
        totalPages: Math.ceil(totalCount / prev.pageSize)
      }));
      
      setProducts(allProducts);
    } catch (error) {
      console.error('Error fetching products:', error);
      toast({
        title: "Error",
        description: "Failed to load products. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      setPagination(prev => ({ ...prev, page: newPage }));
    }
  };

  useEffect(() => {
    if (categoryId) {
      fetchProducts();
    }
  }, [categoryId, pagination.page]);

  return { products, pagination, handlePageChange, loading };
};
