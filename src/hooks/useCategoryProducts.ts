import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Product, FilterParams } from '@/types';
import { fetchProductsWithFilters } from '@/services/product';

export const useCategoryProducts = (categorySlug: string, sortOption: string, filterParams: FilterParams) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);

  useEffect(() => {
    loadProducts();
  }, [categorySlug, sortOption, filterParams]);

  const loadProducts = async () => {
    setLoading(true);
    try {
      const result = await fetchProductsWithFilters({
        category: categorySlug,
        sort: sortOption,
        ...filterParams
      });

      if (result) {
        setProducts(result.products || []);
        setHasMore(result.currentPage < result.totalPages);
        setCurrentPage(result.currentPage);
        setTotalProducts(result.total);
      } else {
        setError('Failed to load products');
      }
    } catch (err) {
      setError('Error loading products');
      console.error('Error loading products:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadMore = async () => {
    if (!hasMore) return;

    setLoading(true);
    try {
      const result = await fetchProductsWithFilters({
        category: categorySlug,
        sort: sortOption,
        page: currentPage + 1,
        ...filterParams
      });

      if (result) {
        setProducts([...products, ...(result.products || [])]);
        setHasMore(result.currentPage < result.totalPages);
        setCurrentPage(result.currentPage);
      } else {
        setError('Failed to load more products');
      }
    } catch (err) {
      setError('Error loading more products');
      console.error('Error loading more products:', err);
    } finally {
      setLoading(false);
    }
  };

  return { products, loading, error, hasMore, loadMore, totalProducts };
};
