
import React, { useState } from 'react';
import { Product } from '@/types';
import { ProductStock } from './ProductStock';
import { BuyNowButton } from '@/components/checkout/BuyNowButton';
import { ProductTrustBadges } from './ProductTrustBadges';

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
    <div className="grid md:grid-cols-2 gap-6">
      {/* Left side: Product information */}
      <div className="bg-card rounded-lg p-6 shadow-sm">
        <div className="flex flex-col gap-4">
          {/* Stock Badges */}
          <ProductStock 
            stock={product.stockQuantity || product.stock || 0}
            soldCount={product.salesCount || 0}
            className="mb-2"
          />
          
          {/* Price */}
          <div className="text-2xl md:text-3xl font-bold text-primary">
            ${(product.price / 24000).toFixed(2)}
          </div>

          {/* Description */}
          <div className="mt-4 text-text-light">
            <p>{product.shortDescription || product.description.substring(0, 150)}</p>
          </div>
        </div>
      </div>

      {/* Right side: Purchase box */}
      <div className="bg-card rounded-lg p-6 shadow-sm md:sticky md:top-24 self-start">
        <div className="flex flex-col gap-4">
          {/* Price */}
          <div className="text-xl font-semibold text-primary">
            ${(product.price / 24000).toFixed(2)}
          </div>
          
          {/* Purchase Actions */}
          <div className="flex flex-col gap-4 mt-2">
            <div className="flex items-center border border-input rounded-md w-full">
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
              className="w-full py-3"
              product={product}
            />
          </div>

          {/* Trust Badges */}
          <ProductTrustBadges />
        </div>
      </div>
    </div>
  );
};
