
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
  showViewAll,
  viewAllLink,
  viewAllLabel,
  isLoading,
  loadingMore,
  hasMore,
  onLoadMore
}) => {
  const gridClasses = viewMode === "list"
    ? "space-y-4"
    : "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4";

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[200px]">
        <Loader2 className="h-10 w-10 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {title && <h2 className="text-2xl font-bold">{title}</h2>}
      {description && <p className="text-muted-foreground">{description}</p>}
      
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
            <div className="flex justify-center mt-8">
              <Button
                variant="outline"
                size="lg"
                className="rounded-full px-8"
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
            <div className="flex justify-center mt-8">
              <Button
                asChild
                size="lg"
                className="group hover:scale-105 transition-transform duration-200"
              >
                <a href={viewAllLink} className="flex items-center gap-2">
                  {viewAllLabel || "View All"}
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-200" />
                </a>
              </Button>
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No products found</p>
        </div>
      )}
    </div>
  );
};

export default ProductGrid;

