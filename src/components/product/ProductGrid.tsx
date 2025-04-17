import React, { useState, useEffect, useCallback } from 'react';
import ProductCard from './ProductCard';
import { Product, FilterParams } from '@/types';
import { Loader2, RefreshCw } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  isLoading: externalLoading = false
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
        page
      };
      
      const fetchedProducts = await fetchProductsWithFilters(filters);
      
      const pageSize = 12;
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
  }, [activeSort, categoryId, toast, externalProducts]);

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

  const handleSortChange = (value: string) => {
    if (onSortChange) {
      onSortChange(value);
    }
  };
  
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
  
  return (
    <div className="w-full">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <div>
          {title && <h2 className="text-2xl font-bold mb-2 text-text">{title}</h2>}
          {description && <p className="text-text-light mb-4 max-w-3xl">{description}</p>}
        </div>
        
        {showSort && (
          <div className="w-full md:w-auto mt-4 md:mt-0">
            <Select value={activeSort} onValueChange={handleSortChange}>
              <SelectTrigger className="w-full md:w-[220px] focus:ring-primary">
                <SelectValue placeholder="Sort By" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="recommended">Recommended</SelectItem>
                <SelectItem value="price-low-high">Price: Low to High</SelectItem>
                <SelectItem value="price-high-low">Price: High to Low</SelectItem>
                <SelectItem value="newest">Newest</SelectItem>
                <SelectItem value="rating">Highest Rated</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}
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
      ) : products.length > 0 ? (
        <div className="space-y-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
          
          {hasMore && !externalProducts && (
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
