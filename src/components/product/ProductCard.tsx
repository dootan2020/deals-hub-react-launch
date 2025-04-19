
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
      bg-white rounded-xl border border-primary/20
      shadow-sm transition-all duration-300 ease-in-out 
      hover:shadow-md hover:border-primary/40 p-5
      ${containerClasses}
    `}>
      <div className={contentClasses}>
        <div className="flex flex-col gap-4">
          <div className="flex items-start gap-3">
            <ProductBadge type={getBadgeType(product.title)} />
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-[#1E1E1E] text-left">
                {product.title}
              </h3>
              <p className="text-sm text-[#4B5563] mt-1 text-left line-clamp-2">
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

          <div className="flex flex-wrap gap-2 mt-2">
            <Button
              variant="outline"
              size="sm"
              className="flex-1 min-w-[100px] text-sm font-normal border-primary/20 hover:border-primary/40"
              asChild
            >
              <a href={`/product/${product.slug}`}>
                <span>Chi tiết</span>
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
              Mua ngay
            </BuyNowButton>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
