
import React from 'react';
import { cn } from '@/lib/utils';
import { getStockBadgeClasses } from '@/utils/productUtils';

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
    <div className={cn("mt-1 flex items-center justify-between", className)}>
      <span 
        className={cn(
          "badge-stock inline-block rounded-full px-3 py-0.5 text-xs font-medium",
          getStockBadgeClasses(stock)
        )}
      >
        Còn lại: <strong>{stock}</strong>
      </span>
      <span 
        className="badge-sold inline-block rounded-full px-3 py-0.5 text-xs font-medium bg-blue-500/10 text-blue-700"
      >
        Đã bán: <strong>{soldDisplay}</strong>
      </span>
    </div>
  );
};
