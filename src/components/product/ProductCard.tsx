
import React from 'react';
import { Product } from '@/types';
import { Button } from '@/components/ui/button';
import BuyNowButton from '@/components/checkout/BuyNowButton';
import { formatPrice } from '@/utils/productUtils';
import { ProductLogo } from './ProductLogo';
import { ArrowRight, ShoppingCart } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface ProductCardProps {
  product: Product;
  viewMode?: "grid" | "list";
}

const getLogoType = (title: string): 'gmail' | 'facebook' | 'outlook' | 'default' => {
  const lowercaseTitle = title.toLowerCase();
  if (lowercaseTitle.includes('gmail')) return 'gmail';
  if (lowercaseTitle.includes('facebook')) return 'facebook';
  if (lowercaseTitle.includes('outlook')) return 'outlook';
  return 'default';
};

const ProductCard = ({ product, viewMode = "grid" }: ProductCardProps) => {
  const containerClasses = viewMode === "list" 
    ? "flex gap-6" 
    : "flex flex-col";

  const contentClasses = viewMode === "list"
    ? "flex-1"
    : "";

  return (
    <div className={cn(
      "group bg-white rounded-xl border border-primary/20",
      "transition-all duration-300 ease-in-out",
      "hover:shadow-md hover:border-primary/40",
      "p-6 h-full min-w-[300px]",
      containerClasses
    )}>
      <div className={cn("flex flex-col gap-4 w-full", contentClasses)}>
        {/* Header: Logo + Title */}
        <div className="flex items-start gap-4">
          <ProductLogo 
            type={getLogoType(product.title)} 
            size={32}
          />
          <div className="flex-1 min-w-0">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <h3 className="font-semibold text-[#1E1E1E] text-base leading-tight line-clamp-2">
                    {product.title}
                  </h3>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{product.title}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>

        {/* Description */}
        <p className="text-sm text-[#4B5563] line-clamp-2 min-h-[40px]">
          {product.shortDescription || product.description}
        </p>

        {/* Price + Stock */}
        <div className="flex items-center justify-between mt-auto">
          <span className="text-lg font-semibold text-primary">
            {formatPrice(product.price)}
          </span>
          <span className="text-sm text-gray-500">
            Còn {product.stockQuantity || 0} sản phẩm
          </span>
        </div>

        {/* Action Buttons */}
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
  );
};

export default ProductCard;
