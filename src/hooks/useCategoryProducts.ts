
import { useState, useEffect } from 'react';
import { toast } from "@/hooks/use-toast";
import { supabase } from '@/integrations/supabase/client';
import { Product, SortOption } from '@/types';
import { sortProducts } from '@/utils/productFilters';

interface UseCategoryProductsProps {
  categoryId?: string;
  isProductsPage?: boolean;
  sort?: SortOption;
}

export const useCategoryProducts = ({ categoryId, isProductsPage = false, sort = 'popular' }: UseCategoryProductsProps) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [currentSort, setCurrentSort] = useState<SortOption>(sort);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 20; // Initial load size

  const fetchProducts = async (isLoadMore = false) => {
    try {
      const offset = isLoadMore ? products.length : 0;
      let query = supabase.from('products').select('*', { count: 'exact' });
      
      if (categoryId && !isProductsPage) {
        query = query.eq('category_id', categoryId);
      }
      
      if (isProductsPage && selectedCategory) {
        query = query.eq('category_id', selectedCategory);
      }
      
      const { data: fetchedProducts, error, count } = await query
        .range(offset, offset + PAGE_SIZE - 1);
        
      if (error) throw error;
      
      let allProducts = fetchedProducts || [];
      
      if (categoryId && !isProductsPage && !isLoadMore) {
        const { data: subcategories } = await supabase
          .from('categories')
          .select('id')
          .eq('parent_id', categoryId);
          
        if (subcategories && subcategories.length > 0) {
          const subcategoryIds = subcategories.map(sc => sc.id);
          
          const { data: subcategoryProducts } = await supabase
            .from('products')
            .select('*')
            .in('category_id', subcategoryIds)
            .range(0, PAGE_SIZE - allProducts.length - 1);
            
          if (subcategoryProducts) {
            allProducts = [...allProducts, ...subcategoryProducts];
          }
        }
      }
      
      console.log('Fetched products data:', allProducts);
      
      const mappedProducts = allProducts.map(p => ({
        id: p.id,
        title: p.title,
        description: p.description,
        short_description: p.short_description,
        price: Number(p.price),
        original_price: p.original_price ? Number(p.original_price) : undefined,
        images: p.images || [],
        category_id: p.category_id || '',
        rating: Number(p.rating) || 0,
        review_count: p.review_count || 0,
        in_stock: p.in_stock || false,
        stock_quantity: p.stock_quantity || 0,
        badges: p.badges || [],
        slug: p.slug,
        features: p.features || [],
        specifications: p.specifications as Record<string, string | number | boolean | object> || {},
        stock: p.stock || 0,
        kiosk_token: p.kiosk_token || '',
        created_at: p.created_at,
        updated_at: p.updated_at,
        last_synced_at: p.last_synced_at
      })) as Product[];

      console.log('Mapped products with kiosk_token:', mappedProducts.map(p => ({
        title: p.title, 
        kiosk_token: p.kiosk_token ? 'present' : 'missing'
      })));

      const sortedProducts = sortProducts(mappedProducts, currentSort);
      
      setProducts(prev => isLoadMore ? [...prev, ...sortedProducts] : sortedProducts);
      setHasMore((count || 0) > (isLoadMore ? products.length + sortedProducts.length : sortedProducts.length));
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error("Error fetching products:", error);
      }
      toast.error("Error", "Failed to load products. Please try again.");
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const loadMore = async () => {
    if (loadingMore) return;
    setLoadingMore(true);
    setPage(prev => prev + 1);
    await fetchProducts(true);
  };

  const handleSortChange = (newSort: string) => {
    setCurrentSort(newSort as SortOption);
    setProducts([]);
    setPage(1);
    setHasMore(true);
  };

  useEffect(() => {
    setLoading(true);
    setProducts([]);
    setPage(1);
    setHasMore(true);
    fetchProducts();
  }, [categoryId, isProductsPage, currentSort, selectedCategory]);

  return { 
    products, 
    loading,
    loadingMore,
    hasMore,
    loadMore,
    handleSortChange,
    setSelectedCategory 
  };
};
