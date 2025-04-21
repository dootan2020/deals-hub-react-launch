
import { useState, useEffect } from 'react';
import { fetchProductsWithFilters } from '@/services/productService';
import { Product, SortOption } from '@/types';
import { toast } from '@/hooks/use-toast';
import { fetchWithTimeout } from '@/utils/fetchWithTimeout';

interface UseCategoryProductsProps {
  categoryId?: string | null;
  sort?: SortOption;
  isProductsPage?: boolean;
  slug?: string;
}

export const useCategoryProducts = ({ categoryId, sort = 'newest', isProductsPage = false }: UseCategoryProductsProps) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(false);

  useEffect(() => {
    const fetchProducts = async () => {
      if (!isProductsPage && !categoryId) {
        setProducts([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);
      
      try {
        const result = await fetchWithTimeout(
          fetchProductsWithFilters({
            category: categoryId,
            sort: sort
          }),
          7000,
          'Quá thời gian tải dữ liệu sản phẩm'
        );
        
        if (result && Array.isArray(result.products)) {
          setProducts(result.products);
          setHasMore(result.totalPages > 1);
        } else if (Array.isArray(result)) {
          setProducts(result);
          setHasMore(false);
        } else {
          setProducts([]);
          setHasMore(false);
        }
      } catch (err) {
        console.error('Lỗi tải sản phẩm:', err);
        setError('Không thể tải sản phẩm. Vui lòng thử lại sau.');
        toast.error('Lỗi tải dữ liệu', 'Không thể tải sản phẩm. Vui lòng thử lại sau.');
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [categoryId, sort, isProductsPage]);

  const handleSortChange = (newSort: string) => {
    // This is just a placeholder, the actual implementation would update the sort state
    console.log('Sort changed to:', newSort);
  };

  const setSelectedCategory = (categoryId: string) => {
    // This is just a placeholder, the actual implementation would update the category
    console.log('Selected category:', categoryId);
  };

  const loadMore = async () => {
    setLoadingMore(true);
    try {
      // Thêm logic tải thêm sản phẩm ở đây
      setTimeout(() => {
        setLoadingMore(false);
      }, 500);
    } catch (err) {
      console.error('Lỗi tải thêm sản phẩm:', err);
      toast.error('Lỗi tải dữ liệu', 'Không thể tải thêm sản phẩm.');
      setLoadingMore(false);
    }
  };

  return { 
    products, 
    loading, 
    error, 
    loadingMore,
    hasMore,
    loadMore,
    handleSortChange,
    setSelectedCategory 
  };
};
