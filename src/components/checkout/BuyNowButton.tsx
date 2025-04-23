
import { Button, ButtonProps } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { ShoppingBag } from 'lucide-react';

export interface BuyNowButtonProps extends ButtonProps {
  productId: string;
  onPurchaseSuccess?: () => void;
  quantity?: number; // Add quantity prop
}

export const BuyNowButton = ({ 
  productId, 
  onPurchaseSuccess, 
  className, 
  quantity = 1, // Default to 1
  ...props 
}: BuyNowButtonProps) => {
  const handleClick = () => {
    // Add purchase logic here
    console.log(`Buying product ${productId}, quantity: ${quantity}`);
    if (onPurchaseSuccess) {
      onPurchaseSuccess();
    }
  };

  return (
    <Button
      variant="default"
      className={cn('bg-primary hover:bg-primary-dark transition-colors', className)}
      onClick={handleClick}
      {...props}
    >
      <ShoppingBag className="mr-2 h-4 w-4" />
      Buy Now
    </Button>
  );
};
