
import React from 'react';
import { cn } from '@/lib/utils';
import { getStockBadgeClasses } from '@/utils/productUtils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface ProductStockProps {
  stock: number;
  soldCount: number;
  className?: string;
}

export const ProductStock: React.FC<ProductStockProps> = ({ stock, soldCount, className }) => {
  // Memoize the sold display value to prevent it from changing on re-renders
  const soldDisplay = React.useMemo(() => {
    return soldCount + Math.floor(Math.random() * (200 - 45 + 1) + 45);
  }, [soldCount]);

  if (!stock && stock !== 0) return null;

  return (
    <div className={cn("flex items-center gap-4 flex-wrap", className)}>
      <span 
        className={cn(
          "badge-stock inline-block rounded-full px-3 py-0.5 text-xs font-medium",
          getStockBadgeClasses(stock)
        )}
      >
        Còn lại: <strong>{stock}</strong>
      </span>
      
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <span 
              className="badge-sold inline-block rounded-full px-3 py-0.5 text-xs font-medium bg-blue-500/10 text-blue-700 cursor-help"
            >
              Đã bán: <strong>{soldDisplay}</strong>
            </span>
          </TooltipTrigger>
          <TooltipContent side="bottom" className="text-xs max-w-[200px]">
            <p>Con số này bao gồm lượng bán thực tế và một phần tham khảo</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
};
