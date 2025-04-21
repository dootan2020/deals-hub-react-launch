
import React from 'react';
import { Button } from '@/components/ui/button';
import { ShoppingBag, Loader2 } from 'lucide-react';
import { usePurchaseDialog } from '@/hooks/use-purchase-dialog';
import PurchaseConfirmDialog from './PurchaseConfirmDialog';
import { ensureProductFields } from '@/utils/productUtils';
import { Product } from '@/types';

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

  // Handle button click - open dialog
  const handleClick = () => {
    // Ensure product object matches Product type
    if (product) {
      // Use the provided product directly
      openDialog(ensureProductFields(product));
    } else {
      // Ensure all required fields are present
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
        // Add additional missing Product fields with safe defaults
        specifications: {},
        createdAt: new Date().toISOString(),
        stock: 10,
        api_stock: 10,
        api_price: 0,
        original_price: 0,
        last_synced_at: new Date().toISOString(),
        short_description: '',
        external_id: '',
        api_name: '',
      });
      openDialog(minimalProduct);
    }
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
