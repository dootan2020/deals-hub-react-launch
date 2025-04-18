
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
}

export const BuyNowButton: React.FC<BuyNowButtonProps> = ({ 
  className, 
  variant = 'default',
  size = 'default'
}) => {
  return (
    <Button 
      variant={variant} 
      size={size}
      className={className}
      disabled
    >
      Buy Now (Disabled)
    </Button>
  );
};

export default BuyNowButton;
