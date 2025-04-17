
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from "@/components/ui/use-toast";
import { supabase } from '@/integrations/supabase/client';
import { fetchCategoryBySlug } from '@/services/categoryService';
import { Category, Product, CategoryWithParent, PaginationState } from '@/types';

interface UseCategoryDataProps {
  categorySlug?: string;
  parentCategorySlug?: string;
}

export const useCategoryData = ({ categorySlug, parentCategorySlug }: UseCategoryDataProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [category, setCategory] = useState<CategoryWithParent | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<PaginationState>({
    page: 1,
    pageSize: 12,
    totalPages: 1,
    totalItems: 0
  });

  const fetchCategory = async () => {
    try {
      setLoading(true);
      setError(null);
      
      if (parentCategorySlug && categorySlug) {
        const parentCategory = await fetchCategoryBySlug(parentCategorySlug);
        
        if (!parentCategory) {
          setError('Parent category not found');
          setLoading(false);
          return;
        }
        
        const childCategory = await fetchCategoryBySlug(categorySlug);
        
        if (!childCategory) {
          setError('Category not found');
          setLoading(false);
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
        
        await fetchProductsByCategory(childCategory.id);
      } else if (categorySlug) {
        const fetchedCategory = await fetchCategoryBySlug(categorySlug);
        
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
            
          if (parentData) {
            setCategory({
              ...fetchedCategory,
              parent: parentData as Category
            });
            
            navigate(`/${parentData.slug}/${fetchedCategory.slug}`, { replace: true });
            return;
          }
        }
        
        setCategory(fetchedCategory);
        await fetchProductsByCategory(fetchedCategory.id);
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

  const fetchProductsByCategory = async (categoryId: string) => {
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
      
      setProducts(allProducts.map(item => ({
        id: item.id,
        title: item.title,
        description: item.description,
        price: Number(item.price),
        originalPrice: item.original_price ? Number(item.original_price) : undefined,
        images: item.images || [],
        categoryId: item.category_id,
        rating: Number(item.rating) || 0,
        reviewCount: item.review_count || 0,
        inStock: item.in_stock === true,
        stockQuantity: item.stock_quantity ?? 0,
        badges: Array.isArray(item.badges) ? item.badges : [],
        slug: item.slug,
        features: Array.isArray(item.features) ? item.features : [],
        specifications: item.specifications || {},
        salesCount: 0,
        createdAt: item.created_at
      })));
    } catch (error) {
      console.error('Error fetching products:', error);
      toast({
        title: "Error",
        description: "Failed to load products. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      setPagination(prev => ({ ...prev, page: newPage }));
      if (category) {
        fetchProductsByCategory(category.id);
      }
    }
  };

  useEffect(() => {
    fetchCategory();
  }, [categorySlug, parentCategorySlug]);

  return {
    category,
    products,
    loading,
    error,
    pagination,
    handlePageChange
  };
};
