
import { useState } from 'react';
import { Button, ButtonProps } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { ShoppingBag } from 'lucide-react';
import { PurchaseConfirmDialog } from './PurchaseConfirmDialog';

export interface BuyNowButtonProps extends ButtonProps {
  productId: string;
  onPurchaseSuccess?: () => void;
  quantity?: number;
}

export const BuyNowButton = ({ 
  productId, 
  onPurchaseSuccess, 
  className, 
  quantity = 1,
  ...props 
}: BuyNowButtonProps) => {
  const [dialogOpen, setDialogOpen] = useState(false);

  const handleClick = () => {
    setDialogOpen(true);
  };

  const handlePurchaseSuccess = () => {
    if (onPurchaseSuccess) {
      onPurchaseSuccess();
    }
  };

  return (
    <>
      <Button
        variant="default"
        className={cn('bg-primary hover:bg-primary-dark transition-colors', className)}
        onClick={handleClick}
        {...props}
      >
        <ShoppingBag className="mr-2 h-4 w-4" />
        Buy Now
      </Button>

      <PurchaseConfirmDialog
        isOpen={dialogOpen}
        setIsOpen={setDialogOpen}
        productId={productId}
        quantity={quantity}
        onPurchaseSuccess={handlePurchaseSuccess}
      />
    </>
  );
};
