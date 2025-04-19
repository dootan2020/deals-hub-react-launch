
import React, { useState } from 'react';
import { Product } from '@/types';
import { ProductStock } from './ProductStock';
import { BuyNowButton } from '@/components/checkout/BuyNowButton';

interface ProductPurchaseSectionProps {
  product: Product;
}

export const ProductPurchaseSection = ({ product }: ProductPurchaseSectionProps) => {
  const [quantity, setQuantity] = useState(1);

  const handleQuantityChange = (amount: number) => {
    const newQuantity = quantity + amount;
    if (newQuantity >= 1) {
      setQuantity(newQuantity);
    }
  };

  return (
    <div className="bg-card rounded-lg p-6 shadow-sm">
      <div className="flex flex-col gap-4">
        {/* Stock Badges */}
        <ProductStock 
          stock={product.stockQuantity || product.stock || 0}
          soldCount={product.salesCount || 0}
        />
        
        {/* Price */}
        <div className="text-2xl md:text-3xl font-bold text-primary">
          ${(product.price / 24000).toFixed(2)}
        </div>

        {/* Purchase Actions */}
        <div className="flex items-center gap-4 mt-2">
          <div className="flex items-center border border-input rounded-md w-36">
            <button 
              className="px-4 py-2 text-muted-foreground hover:text-primary"
              onClick={() => handleQuantityChange(-1)}
              disabled={quantity <= 1}
            >
              -
            </button>
            <input
              type="number"
              value={quantity}
              onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
              className="w-full text-center border-0 focus:ring-0"
              min="1"
            />
            <button 
              className="px-4 py-2 text-muted-foreground hover:text-primary"
              onClick={() => handleQuantityChange(1)}
            >
              +
            </button>
          </div>
          
          <BuyNowButton
            kioskToken={product.kiosk_token}
            productId={product.id}
            quantity={quantity}
            isInStock={product.inStock}
            className="flex-1"
            product={product}
          />
        </div>
      </div>
    </div>
  );
};
