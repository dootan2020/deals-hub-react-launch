
import React from 'react';
import { Button } from '@/components/ui/button';

// Empty Buy Now button - placeholder after deletion
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
  isInStock,
  onSuccess,
  kioskToken,
  productId,
  quantity,
  promotionCode
}) => {
  return (
    <Button 
      variant={variant} 
      size={size}
      className={className}
      disabled
      onClick={() => {
        console.log("Buy Now clicked with:", { kioskToken, productId, quantity, promotionCode });
        if (onSuccess) onSuccess();
      }}
    >
      Buy Now (Disabled)
    </Button>
  );
};

export default BuyNowButton;
