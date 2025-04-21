
import React from 'react';
import { Button } from '@/components/ui/button';
import { ShoppingBag } from 'lucide-react';
import { usePurchaseDialog } from '@/hooks/use-purchase-dialog';
import PurchaseConfirmDialog from './PurchaseConfirmDialog';
import { ensureProductFields } from '@/utils/productUtils';
import { Product } from '@/types';

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
    // Ensure product object matches Product type and all required fields
    if (product) {
      // Ensure required fields are satisfied as per 'Product' type everywhere
      openDialog(ensureProductFields({
        ...product,
        description: product.description || "", // Make description required (fallback empty string)
        specifications: product.specifications && Object.keys(product.specifications).length > 0
          ? product.specifications
          : {}, // Ensure correct type and not undefined
      } as unknown as Partial<Product>));
    } else {
      const minimalProduct = ensureProductFields({
        id: productId || '',
        kiosk_token: kioskToken || '',
        title: 'Product',
        price: 0,
        stockQuantity: 10,
        description: '', // Always set to string
        images: [],
        categoryId: '',
        rating: 0,
        reviewCount: 0,
        badges: [],
        features: [],
        slug: '',
        inStock: true,
        specifications: {},
        createdAt: new Date().toISOString(),
        stock: 10,
        shortDescription: '',
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
