
import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogFooter
} from "@/components/ui/dialog";
import { formatCurrency } from '@/lib/utils';
import { Product } from '@/types';
import { DialogHeader } from './purchase-dialog/DialogHeader';
import { DialogContent as PurchaseDialogContent } from './purchase-dialog/DialogContent';
import { DialogFooterButtons } from './purchase-dialog/DialogFooterButtons';
import { useUserBalance } from '@/hooks/useUserBalance';

interface EnhancedPurchaseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product: Product;
  onConfirm: (quantity: number, code?: string) => Promise<boolean>;
  isVerifying: boolean;
  verifiedStock: number | null;
  verifiedPrice: number | null;
}

const EnhancedPurchaseDialog: React.FC<EnhancedPurchaseDialogProps> = ({
  open,
  onOpenChange,
  product,
  onConfirm,
  isVerifying,
  verifiedStock,
  verifiedPrice
}) => {
  const [quantity, setQuantity] = useState(1);
  const [promotionCode, setPromotionCode] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { isLoading: isLoadingBalance, userBalance } = useUserBalance();

  const priceUSD = verifiedPrice !== null ? verifiedPrice : product.price;
  const totalPriceUSD = priceUSD * quantity;
  const hasEnoughBalance = userBalance !== null && userBalance >= totalPriceUSD;

  const handleConfirm = async () => {
    setIsSubmitting(true);
    try {
      await onConfirm(quantity, promotionCode);
      onOpenChange(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader isVerifying={isVerifying} />
        
        <PurchaseDialogContent
          product={product}
          isVerifying={isVerifying}
          quantity={quantity}
          verifiedStock={verifiedStock}
          verifiedPrice={verifiedPrice}
          priceUSD={priceUSD}
          totalPriceUSD={totalPriceUSD}
          promotionCode={promotionCode}
          onQuantityChange={setQuantity}
          onPromotionCodeChange={setPromotionCode}
          isLoadingBalance={isLoadingBalance}
          userBalance={userBalance}
        />
        
        <DialogFooter className="flex flex-row justify-end gap-2 pt-4">
          <DialogFooterButtons
            onCancel={handleCancel}
            onConfirm={handleConfirm}
            isSubmitting={isSubmitting}
            isVerifying={isVerifying}
            hasEnoughBalance={hasEnoughBalance}
          />
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EnhancedPurchaseDialog;
