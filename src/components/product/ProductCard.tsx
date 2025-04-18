
import React from 'react';
import { Product } from '@/types';
import { Button } from '@/components/ui/button';
import BuyNowButton from '@/components/checkout/BuyNowButton';
import { formatPrice } from '@/utils/productUtils';
import { ShoppingCart } from 'lucide-react';

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

  const contentClasses = viewMode === "list"
    ? "flex-1 flex flex-col justify-between"
    : "flex flex-col flex-1 p-4";

  return (
    <div className={`bg-white rounded-lg border border-gray-100 shadow-sm hover:shadow-md transition-shadow ${containerClasses}`}>
      <div className={imageClasses}>
        <img
          src={product.images[0] || '/placeholder.svg'}
          alt={product.title}
          className="w-full h-full object-cover rounded-t-lg"
        />
      </div>
      
      <div className={contentClasses}>
        <div>
          <h3 className="text-lg font-semibold mb-2 line-clamp-2">{product.title}</h3>
          <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
            {product.shortDescription || product.description}
          </p>
        </div>
        
        <div className={`mt-auto ${viewMode === "list" ? "flex items-center justify-between" : "space-y-3"}`}>
          <div className="flex items-baseline gap-2">
            <span className="text-xl font-bold text-primary">{formatPrice(product.price)}</span>
            {product.originalPrice && product.originalPrice > product.price && (
              <span className="text-sm text-muted-foreground line-through">
                {formatPrice(product.originalPrice)}
              </span>
            )}
          </div>
          
          <div className={viewMode === "list" ? "flex gap-2" : "mt-3"}>
            <BuyNowButton
              productId={product.id}
              kioskToken={product.kiosk_token}
              variant="default"
              size="sm"
              className="w-full"
              isInStock={product.inStock}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
