
import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import ProductCard from './ProductCard';
import ProductCardList from './ProductCardList';
import { Product, FilterParams } from '@/types';
import { Loader2, RefreshCw } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { fetchProductsWithFilters } from '@/services/product';
import { useToast } from '@/components/ui/use-toast';

interface ProductGridProps {
  initialProducts?: Product[];
  products?: Product[];
  title?: string;
  description?: string;
  showSort?: boolean;
  onSortChange?: (sort: string) => void;
  activeSort?: string;
  categoryId?: string;
  isLoading?: boolean;
  limit?: number;
  showViewAll?: boolean;
  viewAllLink?: string;
  viewAllLabel?: string;
  viewMode?: 'grid' | 'list'; // Added viewMode prop
}

const ProductGrid: React.FC<ProductGridProps> = ({ 
  initialProducts,
  products: externalProducts,
  title,
  description,
  showSort = false,
  onSortChange,
  activeSort = 'recommended',
  categoryId,
  isLoading: externalLoading = false,
  limit,
  showViewAll = false,
  viewAllLink = '/products',
  viewAllLabel = 'View all products',
  viewMode = 'grid' // Default to grid view
}) => {
  const [products, setProducts] = useState<Product[]>(initialProducts || externalProducts || []);
  const [isLoading, setIsLoading] = useState(!initialProducts && !externalProducts);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const { toast } = useToast();

  const fetchProducts = useCallback(async (page = 1, append = false) => {
    if (externalProducts) return;

    try {
      setError(null);
      if (page === 1) {
        setIsLoading(true);
      } else {
        setIsLoadingMore(true);
      }
      
      const filters: FilterParams = {
        sort: activeSort,
        categoryId,
        page,
        limit
      };
      
      const fetchedProducts = await fetchProductsWithFilters(filters);
      
      const pageSize = limit || 12;
      if (fetchedProducts.length < pageSize) {
        setHasMore(false);
      }
      
      if (append) {
        setProducts(prev => [...prev, ...fetchedProducts]);
      } else {
        setProducts(fetchedProducts);
      }
    } catch (err) {
      console.error('Error fetching products:', err);
      setError('Failed to load products. Please try again.');
      toast({
        title: "Error",
        description: "Failed to load products. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  }, [activeSort, categoryId, toast, externalProducts, limit]);

  useEffect(() => {
    if (externalProducts) {
      setProducts(externalProducts);
      setIsLoading(false);
      setError(null);
      return;
    }
    
    if (initialProducts) {
      setProducts(initialProducts);
      setIsLoading(false);
      setError(null);
      return;
    }

    setPage(1);
    setHasMore(true);
    fetchProducts(1, false);
  }, [initialProducts, externalProducts, activeSort, categoryId, fetchProducts]);
  
  const handleLoadMore = async () => {
    const nextPage = page + 1;
    await fetchProducts(nextPage, true);
    setPage(nextPage);
  };
  
  const handleRetry = () => {
    setPage(1);
    setHasMore(true);
    fetchProducts(1, false);
  };
  
  const showLoading = isLoading || externalLoading;
  
  // Limit displayed products if limit prop is provided
  const displayedProducts = limit && products.length > limit 
    ? products.slice(0, limit) 
    : products;
  
  return (
    <div className="w-full">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <div>
          {title && <h2 className="text-2xl font-bold mb-2 text-text">{title}</h2>}
          {description && <p className="text-text-light mb-4 max-w-3xl">{description}</p>}
        </div>
      </div>

      {showLoading ? (
        <div className="flex justify-center items-center min-h-[300px]">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
          <p className="ml-3 text-text-light">Loading products...</p>
        </div>
      ) : error ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-xl text-red-600 mb-4">{error}</p>
          <Button 
            onClick={handleRetry}
            variant="outline"
            className="gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Try Again
          </Button>
        </div>
      ) : displayedProducts.length > 0 ? (
        <div className="space-y-8">
          {viewMode === 'grid' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {displayedProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="space-y-6">
              {displayedProducts.map((product) => (
                <ProductCardList key={product.id} product={product} />
              ))}
            </div>
          )}
          
          {showViewAll && (
            <div className="flex justify-center mt-8">
              <Button 
                variant="outline" 
                size="lg" 
                className="min-w-[150px] bg-primary/10 hover:bg-primary/20 text-primary border border-primary/30 font-semibold px-8 py-6 flex items-center transition-all duration-300"
                asChild
              >
                <Link to={viewAllLink} className="flex items-center">
                  {viewAllLabel}
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    className="w-5 h-5 ml-2"
                  >
                    <path
                      fillRule="evenodd"
                      d="M3 10a.75.75 0 01.75-.75h10.638L10.23 5.29a.75.75 0 111.04-1.08l5.5 5.25a.75.75 0 010 1.08l-5.5 5.25a.75.75 0 11-1.04-1.08l4.158-3.96H3.75A.75.75 0 013 10z"
                      clipRule="evenodd"
                    />
                  </svg>
                </Link>
              </Button>
            </div>
          )}
          
          {hasMore && !externalProducts && !limit && !showViewAll && (
            <div className="flex justify-center mt-8">
              <Button 
                onClick={handleLoadMore}
                disabled={isLoadingMore}
                className="px-8"
                size="lg"
              >
                {isLoadingMore ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Loading...
                  </>
                ) : (
                  'Load More'
                )}
              </Button>
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-xl text-text-light">No products found</p>
          <p className="text-text-light mt-2">Try adjusting your filters or check back later for new products</p>
        </div>
      )}
    </div>
  );
};

export default ProductGrid;
