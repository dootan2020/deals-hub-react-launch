
import React from 'react';
import { Button } from '@/components/ui/button';
import { ShoppingBag } from 'lucide-react';
import { usePurchaseDialog } from '@/hooks/use-purchase-dialog';
import EnhancedPurchaseDialog from '@/components/checkout/EnhancedPurchaseDialog';
import { Product } from '@/types';
import { prepareProductForPurchase } from '@/utils/buyNowUtils';
import { useRateLimitedAction } from '@/hooks/use-debounce';
import { toast } from '@/hooks/use-toast';

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
  children?: React.ReactNode;
}

export const BuyNowButton: React.FC<BuyNowButtonProps> = ({ 
  className, 
  variant = 'default',
  size = 'default',
  isInStock = true,
  onSuccess,
  kioskToken,
  productId,
  product,
  quantity = 1,
  promotionCode,
  children,
}) => {
  const { 
    open, 
    selectedProduct, 
    openDialog, 
    closeDialog, 
    handleConfirm,
    isVerifying,
    verifiedStock,
    verifiedPrice
  } = usePurchaseDialog();

  const {
    execute: executeOpenDialog,
    isExecuting,
    isDisabled,
    cooldown,
    cooldownText
  } = useRateLimitedAction(
    async (productToOpen: Product) => {
      return openDialog(productToOpen);
    },
    {
      cooldownMs: 2000,
      onRateLimit: (retryAfter) => {
        toast({
          title: "Vui lòng chờ",
          description: `Bạn đang thực hiện quá nhiều thao tác. Vui lòng thử lại sau ${retryAfter} giây.`
        });
      },
      onError: (error) => {
        toast({
          title: "Lỗi",
          description: error?.message || "Đã xảy ra lỗi khi mở hộp thoại mua hàng",
          variant: "destructive"
        });
      }
    }
  );

  const handleClick = () => {
    const preparedProduct = prepareProductForPurchase(product, productId, kioskToken);
    if (preparedProduct) {
      executeOpenDialog(preparedProduct);
    }
  };

  const handleConfirmPurchase = async (quantity: number, code?: string) => {
    const success = await handleConfirm(quantity, code);
    if (success && onSuccess) onSuccess();
    return success;
  };

  const buttonDisabled = !isInStock || isDisabled;
  
  let buttonLabel = children;
  if (!buttonLabel) {
    if (!isInStock) {
      buttonLabel = (
        <>
          <ShoppingBag className="w-4 h-4 mr-2" />
          Hết Hàng
        </>
      );
    } else if (cooldown > 0) {
      buttonLabel = (
        <>
          <ShoppingBag className="w-4 h-4 mr-2" />
          Mua Ngay {cooldownText && `(${cooldownText})`}
        </>
      );
    } else {
      buttonLabel = (
        <>
          <ShoppingBag className="w-4 h-4 mr-2" />
          Mua Ngay
        </>
      );
    }
  }

  return (
    <>
      <Button 
        variant={variant} 
        size={size}
        className={className}
        disabled={buttonDisabled}
        onClick={handleClick}
      >
        {buttonLabel}
      </Button>

      {selectedProduct && (
        <EnhancedPurchaseDialog
          open={open}
          onOpenChange={() => closeDialog()}
          product={selectedProduct}
          onConfirm={handleConfirmPurchase}
          isVerifying={isVerifying}
          verifiedStock={verifiedStock}
          verifiedPrice={verifiedPrice}
        />
      )}
    </>
  );
};

export default BuyNowButton;
