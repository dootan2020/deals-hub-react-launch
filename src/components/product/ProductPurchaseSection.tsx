
import React, { useState } from 'react';
import { Product } from '@/types';
import { ProductStock } from './ProductStock';
import { BuyNowButton } from '@/components/checkout/BuyNowButton';
import { toast } from '@/hooks/use-toast';

interface ProductPurchaseSectionProps {
  product: Product;
}

export const ProductPurchaseSection = ({ product }: ProductPurchaseSectionProps) => {
  const [quantity, setQuantity] = useState(1);

  const handleQuantityChange = (amount: number) => {
    const newQuantity = quantity + amount;
    if (newQuantity >= 1) {
      setQuantity(newQuantity);
      toast.success("Số lượng đã được cập nhật", `Số lượng: ${newQuantity}`);
    }
  };

  return (
    <div className="bg-card rounded-lg p-4 sm:p-6 shadow-sm transition-all duration-300 ease-in-out hover:shadow-md hover:border-primary/40 hover:scale-[1.01] hover:translate-y-[-4px]">
      {/* Stock and Sales Info */}
      <ProductStock 
        stock={product.stock_quantity || product.stock || 0}
        soldCount={product.stock_quantity || 0}
        className="mb-3 sm:mb-4"
      />
      
      {/* Price */}
      <div className="text-xl sm:text-2xl md:text-3xl font-bold text-primary mb-3 sm:mb-4">
        ${(product.price / 24000).toFixed(2)}
      </div>

      {/* Short Description */}
      <div className="text-text-light mb-5 sm:mb-6">
        <p className="text-sm sm:text-base">{product.short_description || product.description?.substring(0, 150)}</p>
      </div>

      {/* Purchase Actions */}
      <div className="flex flex-col gap-3 sm:gap-4">
        <div className="flex items-center border border-input rounded-md w-full h-12 sm:h-14 overflow-hidden">
          <button 
            className="flex items-center justify-center px-4 py-2 text-xl sm:text-2xl text-muted-foreground hover:text-primary focus:outline-none disabled:opacity-60"
            onClick={() => handleQuantityChange(-1)}
            disabled={quantity <= 1}
            aria-label="Giảm số lượng"
          >
            −
          </button>
          <input
            type="number"
            value={quantity}
            onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
            className="flex-1 w-full text-center border-0 focus:ring-0 text-lg sm:text-xl bg-transparent"
            min="1"
            inputMode="numeric"
            aria-label="Số lượng mua"
          />
          <button 
            className="flex items-center justify-center px-4 py-2 text-xl sm:text-2xl text-muted-foreground hover:text-primary focus:outline-none"
            onClick={() => handleQuantityChange(1)}
            aria-label="Tăng số lượng"
          >
            +
          </button>
        </div>
        
        {/* Buy button full width, spacing lớn hơn trên mobile */}
        <BuyNowButton
          kioskToken={product.kiosk_token}
          productId={product.id}
          quantity={quantity}
          isInStock={product.in_stock}
          className="w-full"
          product={product}
        />
      </div>
    </div>
  );
};
