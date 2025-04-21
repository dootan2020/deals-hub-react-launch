
import { useState, useEffect } from 'react';
import { fetchProductsWithFilters } from '@/services/productService';
import { Product, SortOption } from '@/types';

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
      try {
        // Map our UI sort options to API sort options if they're different
        let apiSortOption = sort;
        
        const result = await fetchProductsWithFilters({
          category: categoryId, // Using category instead of categoryId
          sort: apiSortOption
        });
        
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
        
        setError(null);
      } catch (err) {
        console.error('Error fetching products:', err);
        setError('Failed to load products');
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

  const loadMore = () => {
    setLoadingMore(true);
    // Simulating loading more products
    setTimeout(() => {
      setLoadingMore(false);
    }, 500);
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
