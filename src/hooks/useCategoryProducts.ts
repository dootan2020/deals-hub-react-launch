
import { useState, useEffect } from 'react';
import { useToast } from "@/components/ui/use-toast";
import { supabase } from '@/integrations/supabase/client';
import { Product } from '@/types';
import { PaginationState } from '@/types/category.types';
import { sortProducts } from '@/utils/productFilters';

interface UseCategoryProductsProps {
  categoryId?: string;
  isProductsPage?: boolean;
  sort?: string;
}

export const useCategoryProducts = ({ categoryId, isProductsPage = false, sort = 'recommended' }: UseCategoryProductsProps) => {
  const { toast } = useToast();
  const [products, setProducts] = useState<Product[]>([]);
  const [pagination, setPagination] = useState<PaginationState>({
    page: 1,
    pageSize: 12,
    totalPages: 1,
    totalItems: 0
  });
  const [loading, setLoading] = useState(true);
  const [currentSort, setCurrentSort] = useState(sort);

  const fetchProducts = async () => {
    try {
      let query = supabase.from('products').select('*', { count: 'exact' });
      
      if (categoryId && !isProductsPage) {
        query = query.eq('category_id', categoryId);
      }
      
      const from = (pagination.page - 1) * pagination.pageSize;
      const to = pagination.page * pagination.pageSize - 1;
      
      const { data: fetchedProducts, error, count } = await query
        .range(from, to);
        
      if (error) throw error;
      
      let allProducts = fetchedProducts || [];
      let totalCount = count || 0;
      
      // If we're filtering by category, also get products from subcategories
      if (categoryId && !isProductsPage) {
        const { data: subcategories } = await supabase
          .from('categories')
          .select('id')
          .eq('parent_id', categoryId);
          
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
      }
      
      setPagination(prev => ({
        ...prev,
        totalItems: totalCount,
        totalPages: Math.ceil(totalCount / prev.pageSize)
      }));
      
      // Map and sort the products
      const mappedProducts: Product[] = allProducts.map(p => ({
        id: p.id,
        title: p.title,
        description: p.description,
        shortDescription: p.short_description,
        price: Number(p.price),
        originalPrice: p.original_price ? Number(p.original_price) : undefined,
        images: p.images || [],
        categoryId: p.category_id,
        rating: Number(p.rating),
        reviewCount: p.review_count || 0,
        inStock: p.in_stock || false,
        stockQuantity: p.stock_quantity || 0,
        badges: p.badges || [],
        slug: p.slug,
        features: p.features || [],
        specifications: p.specifications as Record<string, string | number | boolean | object> || {},
        salesCount: p.stock_quantity || 0,
        stock: p.stock || 0,
        createdAt: p.created_at
      }));

      const sortedProducts = sortProducts(mappedProducts, currentSort);
      setProducts(sortedProducts);
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error("Error fetching products:", error);
      }
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

  const handleSortChange = (newSort: string) => {
    setCurrentSort(newSort);
  };

  useEffect(() => {
    fetchProducts();
  }, [categoryId, pagination.page, isProductsPage, currentSort]);

  return { products, pagination, handlePageChange, handleSortChange, loading };
};
