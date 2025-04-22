
import React, { useRef, useCallback } from 'react';
import { Product } from '@/types';
import ProductCard from './ProductCard';
import { Button } from '@/components/ui/button';
import { ArrowRight, Loader2 } from 'lucide-react';
import VirtualizedGrid from '@/components/ui/virtualized/VirtualizedGrid';
import { GridChildComponentProps } from 'react-window';

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

  const containerRef = useRef<HTMLDivElement>(null);

  const calculateColumns = useCallback(() => {
    if (!containerRef.current) return 3;
    const width = containerRef.current.offsetWidth;
    if (width < 640) return 1; // Mobile
    if (width < 1024) return 2; // Tablet
    return 3; // Desktop
  }, []);

  const renderCell = useCallback(({ columnIndex, rowIndex, style, data }: GridChildComponentProps) => {
    const columnCount = calculateColumns();
    const itemIndex = rowIndex * columnCount + columnIndex;
    if (itemIndex >= products.length) return null;

    const product = products[itemIndex];
    return (
      <div style={style}>
        <ProductCard 
          key={product.id} 
          product={product}
          viewMode={viewMode}
        />
      </div>
    );
  }, [products, viewMode, calculateColumns]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[200px]">
        <Loader2 className="h-8 w-8 md:h-10 md:w-10 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-4 md:space-y-6" ref={containerRef}>
      {title && (
        <h2 className="text-xl md:text-2xl font-bold px-4 md:px-0">{title}</h2>
      )}
      {description && (
        <p className="text-sm md:text-base text-muted-foreground px-4 md:px-0">
          {description}
        </p>
      )}
      
      {products.length > 0 ? (
        <div className="relative">
          <div className="h-[800px]">
            <VirtualizedGrid
              items={products}
              columnCount={calculateColumns()}
              columnWidth={300}
              rowHeight={400}
              height={800}
              renderCell={renderCell}
              className="bg-background"
            />
          </div>
          
          {hasMore && (
            <div className="flex justify-center mt-6 md:mt-8">
              <Button
                variant="outline"
                size="lg"
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
                className="w-full sm:w-auto"
              >
                <a href={viewAllLink} className="flex items-center gap-2">
                  {viewAllLabel || "View All"}
                  <ArrowRight className="w-4 h-4 md:w-5 md:h-5" />
                </a>
              </Button>
            </div>
          )}
        </div>
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
