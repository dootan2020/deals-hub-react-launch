
import React from 'react';
import { ProductCard } from './ProductCard';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { Product } from '@/types';

export interface EnhancedProductGridProps {
  products: Product[];
  showSort?: boolean;
  isLoading?: boolean;
  viewMode?: "grid" | "list";
  title?: string;
  description?: string;
  activeSort?: string;
  onSortChange?: React.Dispatch<React.SetStateAction<string>>;
  limit?: number;
  showViewAll?: boolean;
  viewAllLink?: string;
  viewAllLabel?: string;
  paginationType?: string;
  currentPage?: number;
  totalPages?: number;
  onPageChange?: (page: number) => void;
  // New props for "Load More" functionality
  loadingMore?: boolean;
  hasMore?: boolean;
  onLoadMore?: () => void;
}

const EnhancedProductGrid: React.FC<EnhancedProductGridProps> = ({ 
  products = [], 
  showSort = false,
  isLoading = false,
  viewMode = "grid",
  title,
  description,
  activeSort,
  onSortChange,
  limit,
  showViewAll,
  viewAllLink,
  viewAllLabel,
  paginationType,
  currentPage,
  totalPages,
  onPageChange,
  // New props
  loadingMore = false,
  hasMore = false,
  onLoadMore
}) => {
  const gridClasses = viewMode === "list"
    ? "space-y-4"
    : "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4";
    
  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[200px]">
        <Loader2 className="h-10 w-10 text-primary animate-spin" />
      </div>
    );
  }
  
  return (
    <div className="space-y-4">
      {title && <h2 className="text-2xl font-bold">{title}</h2>}
      {description && <p className="text-muted-foreground">{description}</p>}
      
      {showSort && (
        <div className="flex justify-end">
          <span className="text-sm text-muted-foreground">Enhanced sort functionality removed</span>
        </div>
      )}
      
      <div className={gridClasses}>
        {products.length > 0 ? (
          products.map((product) => (
            <ProductCard 
              key={product.id} 
              product={{...product, in_stock: product.inStock !== undefined ? product.inStock : true}}
              viewMode={viewMode}
            />
          ))
        ) : (
          <div className="p-4 text-center col-span-full">
            <p className="text-lg font-medium text-gray-500">No products found</p>
          </div>
        )}
      </div>
      
      {/* Load More Button */}
      {hasMore && onLoadMore && (
        <div className="flex justify-center mt-6">
          <Button
            variant="outline"
            size="lg"
            className="rounded-full px-8 transition-all duration-300 ease-in-out hover:border-gray-300 hover:bg-gray-50"
            onClick={onLoadMore}
            disabled={loadingMore}
          >
            {loadingMore ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Loading...
              </>
            ) : (
              'Load More'
            )}
          </Button>
        </div>
      )}
      
      {/* Pagination UI */}
      {paginationType === 'pagination' && totalPages && totalPages > 1 && (
        <div className="flex justify-center mt-6">
          <div className="flex space-x-2">
            {Array.from({ length: totalPages }).map((_, i) => (
              <button
                key={i}
                onClick={() => onPageChange && onPageChange(i + 1)}
                className={`px-3 py-1 rounded transition-all duration-300 ease-in-out ${
                  currentPage === i + 1 
                    ? 'bg-primary text-white' 
                    : 'bg-gray-100 hover:bg-gray-200'
                }`}
              >
                {i + 1}
              </button>
            ))}
          </div>
        </div>
      )}
      
      {showViewAll && viewAllLink && (
        <div className="flex justify-center mt-6">
          <a href={viewAllLink} className="text-primary hover:underline transition-colors">
            {viewAllLabel || "View All"}
          </a>
        </div>
      )}
    </div>
  );
};

export default EnhancedProductGrid;
