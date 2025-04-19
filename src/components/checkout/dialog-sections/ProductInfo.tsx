
import React from 'react';
import { formatPrice } from '@/utils/productUtils';
import { Product } from '@/types';

interface ProductInfoProps {
  product: Product;
  maxQuantity: number;
}

export const ProductInfo = ({ product, maxQuantity }: ProductInfoProps) => {
  return (
    <div className="space-y-3 bg-gray-50 p-4 rounded-lg border border-gray-100">
      <h3 className="font-bold text-lg text-gray-900">{product.title}</h3>
      <div className="flex justify-between text-sm text-gray-600">
        <span>Đơn giá:</span>
        <span className="font-medium text-gray-900">{formatPrice(product.price)}</span>
      </div>
      <div className="flex justify-between text-sm text-gray-600">
        <span>Kho còn lại:</span>
        <span className="font-medium text-gray-900">{maxQuantity} sản phẩm</span>
      </div>
    </div>
  );
};
