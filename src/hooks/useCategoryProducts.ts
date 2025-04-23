
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Product } from '@/types';

export const useCategoryProducts = (categoryId: string | null, sort = 'newest') => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [page, setPage] = useState(1);

  const fetchProducts = useCallback(async () => {
    if (!categoryId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      let query = supabase
        .from('products')
        .select('*, category:category_id(*)')
        .eq('category_id', categoryId);

      // Apply sorting
      switch (sort) {
        case 'price-low':
          query = query.order('price', { ascending: true });
          break;
        case 'price-high':
          query = query.order('price', { ascending: false });
          break;
        case 'popular':
          query = query.order('sales_count', { ascending: false });
          break;
        case 'newest':
        default:
          query = query.order('created_at', { ascending: false });
          break;
      }

      // Apply pagination
      const perPage = 12;
      const from = (page - 1) * perPage;
      const to = from + perPage - 1;
      query = query.range(from, to);

      const { data, error } = await query;

      if (error) throw error;

      // Transform data to match Product interface
      const transformedProducts = (data || []).map((item: any): Product => ({
        id: item.id,
        title: item.title,
        slug: item.slug,
        description: item.description,
        shortDescription: item.short_description || '',
        price: Number(item.price),
        originalPrice: item.original_price ? Number(item.original_price) : undefined,
        images: item.images || [],
        categoryId: item.category_id,
        rating: Number(item.rating || 0),
        reviewCount: Number(item.review_count || 0),
        inStock: Boolean(item.in_stock),
        stockQuantity: Number(item.stock_quantity || 0),
        badges: item.badges || [],
        features: item.features || [],
        specifications: item.specifications || {},
        salesCount: Number(item.sales_count || 0),
        stock: Number(item.stock || 0),
        kiosk_token: item.kiosk_token || '',
        createdAt: item.created_at,
        category: item.category ? {
          id: item.category.id,
          name: item.category.name,
          slug: item.category.slug,
          description: item.category.description,
          image: item.category.image,
          count: item.category.count || 0,
          parentId: item.category.parent_id,
          createdAt: item.category.created_at,
          category: null
        } : null
      }));

      setProducts(prevProducts => (page === 1 ? transformedProducts : [...prevProducts, ...transformedProducts]));
      setHasMore(transformedProducts.length === perPage);
    } catch (err: any) {
      console.error('Error fetching category products:', err);
      setError(err.message || 'Failed to fetch products');
    } finally {
      setLoading(false);
    }
  }, [categoryId, page, sort]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const loadMore = useCallback(() => {
    if (!loading && hasMore) {
      setPage(prevPage => prevPage + 1);
    }
  }, [loading, hasMore]);

  const resetProducts = useCallback(() => {
    setProducts([]);
    setPage(1);
  }, []);

  return {
    products,
    loading,
    error,
    hasMore,
    loadMore,
    resetProducts
  };
};
