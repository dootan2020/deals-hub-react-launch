
import React from 'react';
import { cn } from '@/lib/utils';
import { getStockBadgeClasses } from '@/utils/productUtils';

interface ProductStockProps {
  stock: number;
  className?: string;
}

export const ProductStock: React.FC<ProductStockProps> = ({ stock, className }) => {
  if (!stock && stock !== 0) return null;

  return (
    <span 
      className={cn(
        "inline-flex px-2 py-0.5 text-xs font-medium rounded-full",
        getStockBadgeClasses(stock),
        className
      )}
      aria-label="Product stock remaining"
    >
      Còn lại: {stock}
    </span>
  );
};
