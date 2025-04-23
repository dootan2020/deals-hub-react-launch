
import React from 'react';
import { Button } from '@/components/ui/button';
import { ShoppingCart } from 'lucide-react';

export interface BuyNowButtonProps {
  productId: string;
  quantity?: number;
  onPurchaseSuccess: () => void;
  className?: string;
  disabled?: boolean;
  variant?: "default" | "secondary" | "outline";
  size?: "default" | "sm" | "lg" | "icon";
}

export function BuyNowButton({
  productId,
  quantity = 1,
  onPurchaseSuccess,
  className = '',
  disabled = false,
  variant = "default",
  size = "default"
}: BuyNowButtonProps) {
  const handleClick = () => {
    // Buy now logic here
    console.log(`Buying product ${productId}, quantity: ${quantity}`);
    onPurchaseSuccess();
  };

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleClick}
      disabled={disabled}
      className={className}
    >
      <ShoppingCart className="mr-2 h-4 w-4" />
      Buy
    </Button>
  );
}

export default BuyNowButton;
