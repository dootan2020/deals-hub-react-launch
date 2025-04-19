
import React from 'react';
import { Product } from '@/types';
import { Button } from '@/components/ui/button';
import BuyNowButton from '@/components/checkout/BuyNowButton';
import { formatPrice } from '@/utils/productUtils';
import { ProductBadge } from './ProductBadge';
import { ProductStock } from './ProductStock';
import { ArrowRight, ShoppingCart } from 'lucide-react';

interface ProductCardProps {
  product: Product;
  viewMode?: "grid" | "list";
}

const getBadgeType = (title: string): 'gmail' | 'facebook' | 'outlook' | 'default' => {
  const lowercaseTitle = title.toLowerCase();
  if (lowercaseTitle.includes('gmail')) return 'gmail';
  if (lowercaseTitle.includes('facebook')) return 'facebook';
  if (lowercaseTitle.includes('outlook')) return 'outlook';
  return 'default';
};

const ProductCard = ({ product, viewMode = "grid" }: ProductCardProps) => {
  const containerClasses = viewMode === "list" 
    ? "flex gap-6 p-5" 
    : "flex flex-col h-full";

  const contentClasses = viewMode === "list"
    ? "flex-1"
    : "";

  return (
    <div className={`
      bg-[#F3F4F6] rounded-xl border border-[#E5E7EB] p-5
      shadow-sm transition-all duration-300 ease-in-out 
      hover:shadow-md hover:bg-gray-50/50 hover:border-gray-200
      ${containerClasses}
    `}>
      <div className={contentClasses}>
        <div className="flex flex-col gap-4">
          <div className="flex items-start gap-3">
            <ProductBadge type={getBadgeType(product.title)} />
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-base text-[#1E1E1E] line-clamp-2">
                {product.title}
              </h3>
              <p className="text-sm text-[#4B5563] line-clamp-2 mt-1">
                {product.shortDescription || product.description}
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-base font-bold text-primary">
              {formatPrice(product.price)}
            </span>
            <ProductStock stock={product.stockQuantity || 0} />
          </div>

          <div className="flex flex-wrap gap-2 mt-auto">
            <Button
              variant="outline"
              size="sm"
              className="flex-1 min-w-[100px] text-sm font-normal"
              asChild
            >
              <a href={`/product/${product.slug}`}>
                <span>Details</span>
                <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
              </a>
            </Button>
            
            <BuyNowButton
              productId={product.id}
              kioskToken={product.kiosk_token}
              variant="default"
              size="sm"
              className="flex-1 min-w-[100px] bg-gradient-to-r from-primary to-primary-dark text-sm"
              isInStock={product.inStock}
              product={product}
            >
              <ShoppingCart className="mr-1.5 h-3.5 w-3.5" />
              Buy Now
            </BuyNowButton>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
