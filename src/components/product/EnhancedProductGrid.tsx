import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import ProductCard from './ProductCard';
import ProductCardList from './ProductCardList';
import { Product, FilterParams } from '@/types';
import { Loader2, RefreshCw, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { fetchProductsWithFilters } from '@/services/product';
import { useToast } from '@/hooks/use-toast';
import ViewToggle from '@/components/category/ViewToggle';
import SkeletonLoader from '@/components/ui/skeleton-loader';

interface EnhancedProductGridProps {
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
  paginationType?: 'infinite-scroll' | 'load-more' | 'pagination';
  viewMode?: 'grid' | 'list';
  currentPage?: number;
  totalPages?: number;
  onPageChange?: (page: number) => void;
}

const EnhancedProductGrid: React.FC<EnhancedProductGridProps> = ({ 
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
  paginationType = 'load-more',
  viewMode: externalViewMode,
  currentPage,
  totalPages,
  onPageChange
}) => {
  const [products, setProducts] = useState<Product[]>(initialProducts || externalProducts || []);
  const [isLoading, setIsLoading] = useState(!initialProducts && !externalProducts);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>(externalViewMode || 'grid');
  const { toast } = useToast();

  useEffect(() => {
    if (externalViewMode) {
      setViewMode(externalViewMode);
    }
  }, [externalViewMode]);

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
      setIsInitialLoad(false);
    }
  }, [activeSort, categoryId, toast, externalProducts, limit]);

  useEffect(() => {
    if (externalProducts) {
      setProducts(externalProducts);
      setIsLoading(false);
      setError(null);
      setIsInitialLoad(false);
      return;
    }
    
    if (initialProducts) {
      setProducts(initialProducts);
      setIsLoading(false);
      setError(null);
      setIsInitialLoad(false);
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

  const renderPagination = () => {
    if (paginationType !== 'pagination' || (totalPages && totalPages <= 1)) return null;
    
    const currentPageToUse = currentPage || page;
    const totalPagesToUse = totalPages || Math.ceil(products.length / 12);
    const handlePageChangeFunction = onPageChange || handlePageChange;

    const renderPageNumbers = () => {
      const pages = [];
      const maxVisiblePages = 5;
      
      pages.push(
        <Button
          key={1}
          variant={currentPageToUse === 1 ? "default" : "outline"}
          size="sm"
          className={`px-3 py-1 ${currentPageToUse === 1 ? 'bg-primary text-white' : ''}`}
          onClick={() => handlePageChangeFunction(1)}
        >
          1
        </Button>
      );

      let startPage = Math.max(2, currentPageToUse - Math.floor(maxVisiblePages / 2));
      let endPage = Math.min(totalPagesToUse - 1, startPage + maxVisiblePages - 3);
      
      if (startPage > 2) {
        pages.push(<span key="ellipsis1" className="px-2">...</span>);
      }

      for (let i = startPage; i <= endPage; i++) {
        pages.push(
          <Button
            key={i}
            variant={currentPageToUse === i ? "default" : "outline"}
            size="sm"
            className={`px-3 py-1 ${currentPageToUse === i ? 'bg-primary text-white' : ''}`}
            onClick={() => handlePageChangeFunction(i)}
          >
            {i}
          </Button>
        );
      }

      if (endPage < totalPagesToUse - 1) {
        pages.push(<span key="ellipsis2" className="px-2">...</span>);
      }

      if (totalPagesToUse > 1) {
        pages.push(
          <Button
            key={totalPagesToUse}
            variant={currentPageToUse === totalPagesToUse ? "default" : "outline"}
            size="sm"
            className={`px-3 py-1 ${currentPageToUse === totalPagesToUse ? 'bg-primary text-white' : ''}`}
            onClick={() => handlePageChangeFunction(totalPagesToUse)}
          >
            {totalPagesToUse}
          </Button>
        );
      }

      return pages;
    };

    return (
      <div className="flex justify-center mt-10">
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChangeFunction(currentPageToUse - 1)}
            disabled={currentPageToUse === 1}
            className="px-2"
          >
            <ChevronLeft className="h-4 w-4" />
            <span className="sr-only">Previous Page</span>
          </Button>
          
          <div className="flex items-center space-x-2">
            {renderPageNumbers()}
          </div>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChangeFunction(currentPageToUse + 1)}
            disabled={currentPageToUse === totalPagesToUse || totalPagesToUse === 0}
            className="px-2"
          >
            <ChevronRight className="h-4 w-4" />
            <span className="sr-only">Next Page</span>
          </Button>
        </div>
      </div>
    );
  };

  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > Math.max(totalPages, 1) || newPage === page) return;
    
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    fetchProducts(newPage, false);
  };
  
  const handleRetry = () => {
    setPage(1);
    setHasMore(true);
    fetchProducts(1, false);
  };
  
  const handleViewModeChange = (mode: 'grid' | 'list') => {
    setViewMode(mode);
    localStorage.setItem('productViewMode', mode);
  };

  useEffect(() => {
    const savedViewMode = localStorage.getItem('productViewMode') as 'grid' | 'list' | null;
    if (savedViewMode) {
      setViewMode(savedViewMode);
    }
  }, []);

  const showLoading = isLoading || externalLoading;

  const totalPages = Math.ceil(products.length / 12);

  const displayedProducts = limit && products.length > limit 
    ? products.slice(0, limit) 
    : products;

  const renderSkeletons = () => {
    if (viewMode === 'grid') {
      return (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {[...Array(8)].map((_, index) => (
            <div key={index} className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden p-3 h-[380px]">
              <SkeletonLoader className="h-48 mb-4" />
              <SkeletonLoader className="h-6 w-3/4 mb-4" />
              <SkeletonLoader className="h-4 w-1/4 mb-3" />
              <SkeletonLoader className="h-4 mb-3" count={2} />
              <SkeletonLoader className="h-6 w-1/3 mb-4" />
              <SkeletonLoader className="h-10" />
            </div>
          ))}
        </div>
      );
    } else {
      return (
        <div className="space-y-6">
          {[...Array(5)].map((_, index) => (
            <div key={index} className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden p-4 flex">
              <SkeletonLoader className="h-48 w-48 mr-4" />
              <div className="flex-1">
                <SkeletonLoader className="h-6 w-3/4 mb-4" />
                <SkeletonLoader className="h-4 w-1/4 mb-3" />
                <SkeletonLoader className="h-4 mb-3" count={3} />
                <div className="flex justify-between mt-4">
                  <SkeletonLoader className="h-6 w-1/4" />
                  <SkeletonLoader className="h-10 w-32" />
                </div>
              </div>
            </div>
          ))}
        </div>
      );
    }
  };

  return (
    <div className="w-full">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <div>
          {title && <h2 className="text-2xl font-bold mb-2 text-text">{title}</h2>}
          {description && <p className="text-text-light mb-4 max-w-3xl">{description}</p>}
        </div>
        
        <div className="w-full md:w-auto mt-4 md:mt-0 flex flex-wrap gap-3 items-center">
          {!externalViewMode && (
            <ViewToggle 
              currentView={viewMode} 
              onViewChange={handleViewModeChange} 
            />
          )}
        </div>
      </div>

      {showLoading ? (
        isInitialLoad ? (
          renderSkeletons()
        ) : (
          <div className="flex justify-center items-center min-h-[300px]">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
            <p className="ml-3 text-text-light">Loading products...</p>
          </div>
        )
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
                className="min-w-[150px] bg-primary/10 hover:bg-primary/20 text-primary border border-primary/30 font-semibold px-8 py-6 flex items-center transition-all duration-300 shadow-sm"
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
          
          {renderPagination()}

          {paginationType === 'load-more' && hasMore && !externalProducts && !limit && !showViewAll && (
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

export default EnhancedProductGrid;
