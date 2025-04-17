
import React, { useState } from 'react';
import ProductCard from './ProductCard';
import { Product } from '@/types';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ProductGridProps {
  products: Product[];
  title?: string;
  description?: string;
  showSort?: boolean;
  onSortChange?: (sort: string) => void;
  activeSort?: string;
}

const ProductGrid: React.FC<ProductGridProps> = ({ 
  products,
  title,
  description,
  showSort = false,
  onSortChange,
  activeSort = 'recommended'
}) => {
  const handleSortChange = (value: string) => {
    if (onSortChange) {
      onSortChange(value);
    }
  };
  
  return (
    <div className="w-full">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          {title && <h2 className="text-2xl font-bold mb-2">{title}</h2>}
          {description && <p className="text-text-light mb-4">{description}</p>}
        </div>
        
        {showSort && (
          <div className="w-full md:w-auto mt-4 md:mt-0">
            <Select value={activeSort} onValueChange={handleSortChange}>
              <SelectTrigger className="w-full md:w-[200px]">
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

      {products.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
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
