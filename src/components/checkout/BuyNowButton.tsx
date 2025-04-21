
import React from 'react';
import { Button } from '@/components/ui/button';
import { ShoppingBag } from 'lucide-react';
import { usePurchaseDialog } from '@/hooks/use-purchase-dialog';
import PurchaseConfirmDialog from './PurchaseConfirmDialog';
import { Product } from '@/types';
import { prepareProductForPurchase } from '@/utils/buyNowUtils';

// Define a local Product interface that matches the expected structure
interface BuyNowButtonProduct {
  id: string;
  kiosk_token: string;
  title: string;
  price: number;
  stockQuantity: number;
  description?: string;
  images?: string[];
  categoryId?: string;
  rating?: number;
  reviewCount?: number;
  badges?: string[];
  features?: string[];
  slug?: string;
  inStock?: boolean;
  specifications?: Record<string, string | number | boolean | object>;
  createdAt?: string;
  stock?: number;
  shortDescription?: string;
}

interface BuyNowButtonProps {
  product?: BuyNowButtonProduct;
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

  // Handle button click - open dialog
  const handleClick = () => {
    // Prepare product for dialog using extracted utility function
    const preparedProduct = prepareProductForPurchase(product, productId, kioskToken);
    openDialog(preparedProduct);
  };

  const handleConfirmPurchase = async (quantity: number, code?: string) => {
    await handleConfirm(quantity, code);
    if (onSuccess) onSuccess();
  };

  return (
    <>
      <Button 
        variant={variant} 
        size={size}
        className={className}
        disabled={!isInStock}
        onClick={handleClick}
      >
        {children || (
          <>
            <ShoppingBag className="w-4 h-4 mr-2" />
            {!isInStock ? 'Hết Hàng' : 'Mua Ngay'}
          </>
        )}
      </Button>

      <PurchaseConfirmDialog
        open={open}
        onOpenChange={closeDialog}
        product={selectedProduct ?? undefined}
        onConfirm={handleConfirmPurchase}
        isVerifying={isVerifying}
        verifiedStock={verifiedStock}
        verifiedPrice={verifiedPrice}
      />
    </>
  );
};

export default BuyNowButton;
