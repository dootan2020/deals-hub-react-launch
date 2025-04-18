
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
    ? "flex gap-6 p-4" 
    : "flex flex-col h-full";

  const contentClasses = viewMode === "list"
    ? "flex-1"
    : "";

  return (
    <div className={`
      bg-white rounded-2xl border border-gray-100 p-4
      transition duration-300 hover:shadow-xl
      ${containerClasses}
    `}>
      <div className={contentClasses}>
        {/* Header with Badge and Title */}
        <div className="flex items-start gap-3 mb-3">
          <ProductBadge type={getBadgeType(product.title)} />
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-base text-gray-900 line-clamp-2">
              {product.title}
            </h3>
            <p className="text-sm text-gray-500 line-clamp-2 mt-1">
              {product.shortDescription || product.description}
            </p>
          </div>
        </div>

        {/* Price and Stock Information */}
        <div className="flex items-center justify-between mb-3">
          <span className="text-base font-bold text-primary">
            {formatPrice(product.price)}
          </span>
          <ProductStock stock={product.stockQuantity || 0} />
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-2 mt-auto">
          <Button
            variant="outline"
            size="sm"
            className="flex-1 min-w-[100px] text-sm"
            asChild
          >
            <a href={`/product/${product.slug}`}>
              <span>Xem chi tiết</span>
              <ArrowRight className="ml-1 h-3.5 w-3.5" />
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
            <ShoppingCart className="mr-1 h-3.5 w-3.5" />
            Mua Ngay
          </BuyNowButton>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;

