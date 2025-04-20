
import React from 'react';
import { Product } from '@/types';
import { formatUSD } from '@/utils/currency';

interface ProductInfoProps {
  product: Product;
  verifiedPrice: number | null;
  priceUSD: number;
}

export const ProductInfo = ({ product, verifiedPrice, priceUSD }: ProductInfoProps) => {
  return (
    <div className="space-y-2">
      <h3 className="font-medium text-lg text-center">{product.title}</h3>
      <div className="flex justify-between items-center">
        <span className="text-muted-foreground">Đơn giá:</span>
        <span className="font-medium text-primary">
          {formatUSD(priceUSD)}
          {verifiedPrice && verifiedPrice !== product.price && (
            <span className="ml-2 text-xs text-muted-foreground">
              (Đã cập nhật)
            </span>
          )}
        </span>
      </div>
    </div>
  );
};
