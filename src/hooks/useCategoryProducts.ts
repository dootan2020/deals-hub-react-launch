
import { useState, useEffect } from 'react';
import { useToast } from "@/components/ui/use-toast";
import { supabase } from '@/integrations/supabase/client';
import { Product } from '@/types';
import { sortProducts, SortOption } from '@/utils/productFilters';

interface UseCategoryProductsProps {
  categoryId?: string;
  isProductsPage?: boolean;
  sort?: SortOption;
}

export const useCategoryProducts = ({ categoryId, isProductsPage = false, sort = 'recommended' }: UseCategoryProductsProps) => {
  const { toast } = useToast();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [currentSort, setCurrentSort] = useState(sort);
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
      
      // If we're filtering by category, also get products from subcategories
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
        kiosk_token: p.kiosk_token || '',
        createdAt: p.created_at
      }));

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
      toast({
        title: "Error",
        description: "Failed to load products. Please try again.",
        variant: "destructive"
      });
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
