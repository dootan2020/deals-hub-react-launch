
import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import ProductGrid from '@/components/product/ProductGrid';
import { toast } from '@/hooks/use-toast';
import ProductSorter from '@/components/product/ProductSorter';
import ViewToggle from '@/components/product/ViewToggle';
import { useCategoriesContext } from '@/context/CategoriesContext';
import { SortOption } from '@/types';
import { fetchProductsWithFilters } from '@/services/product';

const ProductsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const initialSort = (searchParams.get('sort') || 'newest') as SortOption;
  const { categories } = useCategoriesContext();
  
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(false);
  const [sort, setSort] = useState<SortOption>(initialSort);
  const [loadingMore, setLoadingMore] = useState(false);

  useEffect(() => {
    const loadProducts = async () => {
      try {
        setLoading(true);
        const result = await fetchProductsWithFilters({
          sort: sort,
        });
        
        // Fix: Access the products array from the result
        const fetchedProducts = result.products || [];
        
        console.log('Products in ProductsPage:', fetchedProducts.length);
        
        setProducts(fetchedProducts);
        setHasMore(result.currentPage < result.totalPages);
      } catch (error) {
        console.error('Error loading products:', error);
        toast({
          title: 'Error',
          description: 'Failed to load products',
          variant: 'destructive'
        });
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, [sort]);
  
  const handleSortChange = (value: string) => {
    setSort(value as SortOption);
    const newSearchParams = new URLSearchParams(searchParams);
    newSearchParams.set('sort', value);
    setSearchParams(newSearchParams);
  };

  const loadMore = () => {
    console.log('Load more functionality temporarily disabled');
  };

  const handleViewChange = (newView: 'grid' | 'list') => {
    setViewMode(newView);
  };

  return (
    <Layout>
      <div className="bg-background py-8 min-h-screen">
        <div className="container-custom">
          <div className="space-y-8">
            <div>
              <h1 className="text-3xl font-bold mb-4">All Products</h1>
              <p className="text-muted-foreground">
                Browse our collection of digital products
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg border border-gray-100 shadow-sm">
              <div className="flex justify-between items-center mb-6">
                <ProductSorter 
                  currentSort={sort} 
                  onSortChange={handleSortChange} 
                />
                <ViewToggle 
                  currentView={viewMode}
                  onViewChange={handleViewChange}
                />
              </div>

              <ProductGrid 
                products={products}
                viewMode={viewMode}
                isLoading={loading}
                loadingMore={loadingMore}
                hasMore={hasMore}
                onLoadMore={loadMore}
              />
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ProductsPage;
