
import React from 'react';
import { Product } from '@/types';
import { Button } from '@/components/ui/button';
import BuyNowButton from '@/components/checkout/BuyNowButton';
import { formatPrice } from '@/utils/productUtils';

interface ProductCardProps {
  product: Product;
  viewMode?: "grid" | "list";
}

const ProductCard = ({ product, viewMode = "grid" }: ProductCardProps) => {
  const containerClasses = viewMode === "list" 
    ? "flex gap-6 p-4" 
    : "flex flex-col h-full";

  const imageClasses = viewMode === "list"
    ? "w-48 h-48 flex-shrink-0"
    : "w-full aspect-square";

  return (
    <div className={`bg-white rounded-lg border border-gray-100 shadow-sm hover:shadow-md transition-shadow ${containerClasses}`}>
      <div className={imageClasses}>
        <img
          src={product.images[0] || '/placeholder.svg'}
          alt={product.title}
          className="w-full h-full object-cover rounded-t-lg"
        />
      </div>
      
      <div className={`flex flex-col ${viewMode === "grid" ? "p-4" : "flex-1"}`}>
        <h3 className="text-lg font-semibold mb-2 line-clamp-2">{product.title}</h3>
        
        <p className="text-sm text-gray-600 mb-3 line-clamp-2">{product.shortDescription}</p>
        
        <div className={`flex ${viewMode === "grid" ? "flex-col gap-2" : "items-center justify-between mt-auto"}`}>
          <div className="flex items-baseline gap-2">
            <span className="text-xl font-bold text-primary">{formatPrice(product.price)}</span>
            {product.originalPrice && product.originalPrice > product.price && (
              <span className="text-sm text-gray-500 line-through">
                {formatPrice(product.originalPrice)}
              </span>
            )}
          </div>
          
          <BuyNowButton
            productId={product.id}
            variant="default"
            className="w-full"
            isInStock={product.inStock}
          />
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
