
import React from 'react';
import { Button } from '@/components/ui/button';
import { ShoppingBag } from 'lucide-react';

interface BuyNowButtonProps {
  product?: any;
  kioskToken?: string;
  productId?: string;
  quantity?: number;
  className?: string;
  variant?: 'default' | 'outline' | 'secondary' | 'ghost' | 'link' | 'destructive';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  isInStock?: boolean;
  promotionCode?: string;
  onSuccess?: () => void;
}

export const BuyNowButton: React.FC<BuyNowButtonProps> = ({ 
  className, 
  variant = 'default',
  size = 'default',
  isInStock = true,
  onSuccess,
  kioskToken,
  productId,
  quantity = 1,
  promotionCode
}) => {
  const handleBuyNow = () => {
    console.log("Buy Now clicked with:", { kioskToken, productId, quantity, promotionCode });
    if (onSuccess) onSuccess();
  };

  return (
    <Button 
      variant={variant} 
      size={size}
      className={className}
      disabled={!isInStock}
      onClick={handleBuyNow}
    >
      <ShoppingBag className="w-4 h-4 mr-2" />
      {isInStock ? 'Buy Now' : 'Out of Stock'}
    </Button>
  );
};

export default BuyNowButton;
