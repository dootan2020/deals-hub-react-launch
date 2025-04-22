
import React from 'react';
import { Button } from '@/components/ui/button';
import { ShoppingBag, Loader2 } from 'lucide-react';
import { usePurchaseDialog } from '@/hooks/use-purchase-dialog';
import PurchaseConfirmDialog from './PurchaseConfirmDialog';
import { ensureProductFields } from '@/utils/productUtils';
import { Product } from '@/types';

interface BuyNowButtonProps {
  product?: Product;
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
    // Make sure we have a complete product object
    // If product is directly provided, use it. Otherwise construct minimal product
    if (product) {
      // Use the provided product directly
      openDialog(product);
    } else {
      // Construct a minimal product with all required fields
      const minimalProduct = ensureProductFields({
        id: productId || '',
        kiosk_token: kioskToken || '',
        title: 'Product',
        price: 0,
        stockQuantity: 10,
        description: '',
        images: [],
        categoryId: '',
        rating: 0,
        reviewCount: 0,
        badges: [],
        features: [],
        slug: '',
        inStock: true,
        createdAt: new Date().toISOString() // Add missing required field
      });
      
      // Open the purchase dialog with the minimal product
      openDialog(minimalProduct);
    }
  };

  // Handle confirmation with callback
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
        product={selectedProduct}
        onConfirm={handleConfirmPurchase}
        isVerifying={isVerifying}
        verifiedStock={verifiedStock}
        verifiedPrice={verifiedPrice}
      />
    </>
  );
};

export default BuyNowButton;
