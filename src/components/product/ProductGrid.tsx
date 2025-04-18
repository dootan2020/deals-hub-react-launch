
import React from 'react';
import { Product } from '@/types';
import ProductCard from './ProductCard';

export interface ProductGridProps {
  products?: Product[];
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
}

const ProductGrid: React.FC<ProductGridProps> = ({ 
  products = [], 
  viewMode = "grid",
  title,
  description,
  showViewAll,
  viewAllLink,
  viewAllLabel
}) => {
  const gridClasses = viewMode === "list"
    ? "space-y-4"
    : "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4";

  return (
    <div className="space-y-4">
      {title && <h2 className="text-2xl font-bold">{title}</h2>}
      {description && <p className="text-muted-foreground">{description}</p>}
      
      <div className={gridClasses}>
        {products.map((product) => (
          <ProductCard 
            key={product.id} 
            product={product}
            viewMode={viewMode}
          />
        ))}
      </div>
      
      {showViewAll && viewAllLink && (
        <div className="flex justify-center mt-6">
          <a href={viewAllLink} className="text-primary hover:underline">
            {viewAllLabel || "View All"}
          </a>
        </div>
      )}
    </div>
  );
};

export default ProductGrid;
