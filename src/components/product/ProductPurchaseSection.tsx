
import React from 'react';
import { Product } from '@/types';
import { Button } from '@/components/ui/button';
import { MinusIcon, PlusIcon, ShoppingCart } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

export interface ProductPurchaseSectionProps {
  product: Product;
  quantity?: number;
  onQuantityChange?: (quantity: number) => void;
}

const ProductPurchaseSection: React.FC<ProductPurchaseSectionProps> = ({ 
  product, 
  quantity = 1, 
  onQuantityChange = () => {} 
}) => {
  const handleIncreaseQuantity = () => {
    if (product.inStock && quantity < product.stock) {
      onQuantityChange(quantity + 1);
    }
  };

  const handleDecreaseQuantity = () => {
    if (quantity > 1) {
      onQuantityChange(quantity - 1);
    }
  };

  const calculateTotalPrice = () => {
    return product.price * quantity;
  };

  return (
    <div className="bg-white shadow-md rounded-lg p-6">
      <div className="mb-4">
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-lg font-semibold">Giá</h3>
          {product.inStock ? (
            <Badge className="bg-green-500 hover:bg-green-600">Còn hàng</Badge>
          ) : (
            <Badge variant="destructive">Hết hàng</Badge>
          )}
        </div>
        <div className="flex items-center">
          <div className="text-2xl font-bold text-primary mr-3">{formatCurrency(product.price)}</div>
          {product.originalPrice && product.originalPrice > product.price && (
            <div className="text-lg text-gray-400 line-through">{formatCurrency(product.originalPrice)}</div>
          )}
        </div>
      </div>

      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-2">Số lượng</h3>
        <div className="flex items-center">
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={handleDecreaseQuantity}
            disabled={quantity <= 1}
          >
            <MinusIcon className="h-4 w-4" />
          </Button>
          <span className="mx-4 text-lg font-medium">{quantity}</span>
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={handleIncreaseQuantity}
            disabled={!product.inStock || quantity >= product.stock}
          >
            <PlusIcon className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-2">Tổng cộng</h3>
        <div className="text-2xl font-bold text-primary">{formatCurrency(calculateTotalPrice())}</div>
      </div>

      <Button 
        className="w-full"
        disabled={!product.inStock}
      >
        <ShoppingCart className="h-5 w-5 mr-2" />
        Thêm vào giỏ hàng
      </Button>
    </div>
  );
};

export default ProductPurchaseSection;
