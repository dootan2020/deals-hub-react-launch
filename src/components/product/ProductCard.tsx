
import React from 'react';
import { Product } from '@/types';
import { Button } from '@/components/ui/button';
import BuyNowButton from '@/components/checkout/BuyNowButton';
import { ProductLogo } from './ProductLogo';
import { ArrowRight, ShoppingCart } from 'lucide-react';
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
    ? "flex flex-col md:flex-row gap-4 md:gap-6" 
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

  // For debugging
  console.log(`Product: ${product.title}, Stock: ${stock}, Type: ${typeof stock}, isInStock: ${isInStock}`);

  return (
    <div className={cn(
      "group bg-white rounded-xl border border-primary/20",
      "transition-all duration-300 ease-in-out",
      "hover:shadow-md hover:border-primary/40",
      "p-4 md:p-6 h-full min-w-[280px] md:min-w-[300px]",
      containerClasses
    )}>
      <div className={cn("flex flex-col gap-3 md:gap-4 w-full", contentClasses)}>
        {/* Header: Logo + Title */}
        <div className="flex items-start gap-3 md:gap-4">
          <ProductLogo 
            type={getLogoType(product.title)} 
            size={28}
          />
          <div className="flex-1 min-w-0">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <h3 className="font-semibold text-[#1E1E1E] text-sm md:text-base leading-tight line-clamp-2">
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
        <p className="text-xs md:text-sm text-[#4B5563] line-clamp-2 min-h-[32px] md:min-h-[40px]">
          {product.shortDescription || product.description}
        </p>

        {/* Price + Stock */}
        <div className="flex flex-col mt-auto">
          <span className="text-base md:text-lg font-semibold text-primary">
            {formatUSD(priceUSD)}
          </span>
          <ProductStock stock={stock} soldCount={salesCount} />
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-2 mt-2">
          <Button
            variant="outline"
            size="sm"
            className="flex-1 min-w-[90px] md:min-w-[100px] text-xs md:text-sm font-normal border-primary/20 hover:border-primary/40"
            asChild
          >
            <a href={`/product/${product.slug}`}>
              <span>Chi tiết</span>
              <ArrowRight className="ml-1.5 h-3 w-3 md:h-3.5 md:w-3.5" />
            </a>
          </Button>
          
          <BuyNowButton
            productId={product.id}
            kioskToken={product.kiosk_token}
            variant="default"
            size="sm"
            className="flex-1 min-w-[90px] md:min-w-[100px] bg-gradient-to-r from-primary to-primary-dark text-xs md:text-sm"
            isInStock={isInStock}
            product={product}
          >
            <ShoppingCart className="mr-1.5 h-3 w-3 md:h-3.5 md:w-3.5" />
            Mua ngay
          </BuyNowButton>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
