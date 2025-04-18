
import React from 'react';
import { cn } from '@/lib/utils';

interface ProductStockProps {
  stock: number;
  className?: string;
}

export const ProductStock: React.FC<ProductStockProps> = ({ stock, className }) => {
  return (
    <span className={cn(
      "text-xs text-gray-500 whitespace-nowrap",
      className
    )}>
      Còn lại: {stock}
    </span>
  );
};

