
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { getStockBadgeClasses } from '@/utils/productUtils';

interface ProductStockProps {
  stock: number;
  className?: string;
}

const ProductStock: React.FC<ProductStockProps> = ({ stock, className = '' }) => {
  let label = 'In Stock';
  let badgeClasses = getStockBadgeClasses(stock);
  
  if (stock === 0) {
    label = 'Out of Stock';
  } else if (stock < 5) {
    label = 'Low Stock';
  }
  
  return (
    <Badge className={`${badgeClasses} ${className}`} variant="outline">
      {label}: {stock}
    </Badge>
  );
};

export default ProductStock;
