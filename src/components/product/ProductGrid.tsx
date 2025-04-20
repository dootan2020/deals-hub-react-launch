
import React from 'react';
import { Product } from '@/types';
import ProductCard from './ProductCard';
import { Button } from '@/components/ui/button';
import { ArrowRight, Loader2 } from 'lucide-react';

export interface ProductGridProps {
  products?: Product[];
  showSort?: boolean;
  isLoading?: boolean;
  loadingMore?: boolean;
  viewMode?: "grid" | "list";
  title?: string;
  description?: string;
  activeSort?: string;
  onSortChange?: (value: string) => void;
  limit?: number;
  showViewAll?: boolean;
  viewAllLink?: string;
  viewAllLabel?: string;
  hasMore?: boolean;
  onLoadMore?: () => void;
}

const ProductGrid: React.FC<ProductGridProps> = ({ 
  products = [], 
  viewMode = "grid",
  title,
  description,
  isLoading,
  loadingMore,
  hasMore,
  onLoadMore,
  showViewAll,
  viewAllLink,
  viewAllLabel
}) => {
  const gridClasses = viewMode === "list"
    ? "space-y-4"
    : "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 max-w-[1200px] mx-auto";

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[200px]">
        <Loader2 className="h-8 w-8 md:h-10 md:w-10 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-4 md:space-y-6">
      {title && (
        <h2 className="text-xl md:text-2xl font-bold px-4 md:px-0">{title}</h2>
      )}
      {description && (
        <p className="text-sm md:text-base text-muted-foreground px-4 md:px-0">
          {description}
        </p>
      )}
      
      {products.length > 0 ? (
        <>
          <div className={gridClasses}>
            {products.map((product) => (
              <ProductCard 
                key={product.id} 
                product={product}
                viewMode={viewMode}
              />
            ))}
          </div>
          
          {/* Load More Button */}
          {hasMore && (
            <div className="flex justify-center mt-6 md:mt-8">
              <Button
                variant="outline"
                size="lg"
                className="rounded-full px-6 md:px-8 text-sm transition-all duration-300 ease-in-out hover:border-gray-300 hover:bg-gray-50"
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
          
          {showViewAll && viewAllLink && (
            <div className="flex justify-center mt-6 md:mt-8 px-4 md:px-0">
              <Button
                asChild
                size="lg"
                className="w-full sm:w-auto transition-all duration-300 ease-in-out"
              >
                <a href={viewAllLink} className="flex items-center gap-2">
                  {viewAllLabel || "View All"}
                  <ArrowRight className="w-4 h-4 md:w-5 md:h-5 transition-transform duration-200" />
                </a>
              </Button>
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-8 md:py-12">
          <p className="text-sm md:text-base text-muted-foreground">
            No products found
          </p>
        </div>
      )}
    </div>
  );
};

export default ProductGrid;
