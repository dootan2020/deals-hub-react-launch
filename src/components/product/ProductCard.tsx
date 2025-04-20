
import React from 'react';
import { Product } from '@/types';
import { Button } from '@/components/ui/button';
import BuyNowButton from '@/components/checkout/BuyNowButton';
import { ProductLogo } from './ProductLogo';
import { ArrowRight, ShoppingCart } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { formatUSD, convertVNDtoUSD } from '@/utils/currency';
import { useCurrencySettings } from '@/hooks/useCurrencySettings';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { ProductStock } from './ProductStock';
import { formatDistanceToNow, differenceInDays, parseISO } from 'date-fns';
import { vi } from 'date-fns/locale';

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
  const { data: currencySettings } = useCurrencySettings();
  const rate = currencySettings?.vnd_per_usd ?? 24000;
  
  const priceUSD = convertVNDtoUSD(product.price, rate);
  const originalPriceUSD = product.originalPrice 
    ? convertVNDtoUSD(product.originalPrice, rate)
    : undefined;

  const containerClasses = viewMode === "list" 
    ? "flex gap-6" 
    : "flex flex-col";

  const contentClasses = viewMode === "list"
    ? "flex-1"
    : "";

  // Make sure stock value is properly set and converted to number
  const stock = Number(product.stockQuantity || product.stock || 0);
  const salesCount = Number(product.salesCount || product.sales_count || 0);
  
  // Ensure we have a valid kiosk_token
  const hasKioskToken = Boolean(product.kiosk_token);
  
  // Product is in stock if stock > 0
  const isInStock = stock > 0;

  // Check if product is new (less than 7 days old)
  const isNewProduct = product.createdAt 
    ? differenceInDays(new Date(), parseISO(product.createdAt)) < 7
    : false;

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

        {/* Product Badges */}
        {(isNewProduct || !isInStock) && (
          <div className="flex gap-2 flex-wrap">
            {!isInStock && (
              <Badge variant="warning" className="text-xs">Hết hàng</Badge>
            )}
            {isNewProduct && (
              <Badge variant="success" className="text-xs">Mới</Badge>
            )}
          </div>
        )}

        {/* Price + Stock */}
        <div className="flex flex-col mt-auto">
          <span className="text-lg font-semibold text-primary">
            {formatUSD(priceUSD)}
          </span>
          <ProductStock stock={stock} soldCount={salesCount} />
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-2 mt-2">
          <Button
            variant="outline"
            size="sm"
            className="flex-1 min-w-[100px] text-sm font-normal border-primary/20 hover:border-primary/40"
            asChild
          >
            <a href={`/products/${product.slug}`}>
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
            isInStock={isInStock}
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
