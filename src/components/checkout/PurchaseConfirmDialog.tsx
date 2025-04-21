
import React, { useState, useEffect } from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from '@/components/ui/button';
import { Product } from '@/types';
import { Loader2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { useCurrencySettings } from '@/hooks/useCurrencySettings';
import { DialogContent as DialogContentComponent } from './purchase-dialog/DialogContent';
import { useUserBalance } from '@/hooks/useUserBalance';

interface PurchaseConfirmDialogProps {
  product?: Product;
  onConfirm: (quantity: number, promotionCode?: string) => Promise<void>;
  open: boolean;
  onOpenChange: (isOpen: boolean) => void;
  isVerifying: boolean;
  verifiedStock: number | null;
  verifiedPrice: number | null;
}

export const PurchaseConfirmDialog = ({
  product,
  onConfirm,
  open,
  onOpenChange,
  isVerifying,
  verifiedStock,
  verifiedPrice
}: PurchaseConfirmDialogProps) => {
  const [quantity, setQuantity] = useState(1);
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [promotionCode, setPromotionCode] = useState('');
  const { data: currencySettings } = useCurrencySettings();
  const { userBalance, isLoading: isLoadingBalance } = useUserBalance();
  
  if (!product) return null;
  
  const vndToUsdRate = currencySettings?.vnd_per_usd || 24000;
  const priceUSD = product.price / vndToUsdRate;
  const totalPriceUSD = priceUSD * quantity;
  const hasEnoughBalance = userBalance !== null && userBalance >= totalPriceUSD;

  useEffect(() => {
    if (open && product) {
      setQuantity(1);
      setPromotionCode('');
    }
  }, [open, product]);

  const handlePurchase = async () => {
    setIsPurchasing(true);
    try {
      await onConfirm(quantity, promotionCode);
      toast.success("Purchase successful!");
    } catch (error: any) {
      console.error("Purchase failed:", error);
      toast.error("Purchase failed", error?.message || "Please try again");
    } finally {
      setIsPurchasing(false);
    }
  };

  // Update the references to stock_quantity to use the getter if needed
  const handleQuantityChange = (newQuantity: number) => {
    if (newQuantity >= 1 && newQuantity <= (verifiedStock ?? product.stock_quantity ?? 1)) {
      setQuantity(newQuantity);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle>Purchase Confirmation</AlertDialogTitle>
          <AlertDialogDescription>
            You are about to purchase {product.title}
          </AlertDialogDescription>
        </AlertDialogHeader>
        
        <DialogContentComponent
          product={product}
          isVerifying={isVerifying}
          quantity={quantity}
          verifiedStock={verifiedStock}
          verifiedPrice={verifiedPrice}
          priceUSD={priceUSD}
          totalPriceUSD={totalPriceUSD}
          promotionCode={promotionCode}
          onQuantityChange={handleQuantityChange}
          onPromotionCodeChange={setPromotionCode}
          isLoadingBalance={isLoadingBalance}
          userBalance={userBalance}
        />
        
        <AlertDialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="w-full"
            disabled={isPurchasing}
          >
            Cancel
          </Button>
          <Button
            onClick={handlePurchase}
            className="w-full"
            disabled={
              isPurchasing || 
              isVerifying || 
              (verifiedStock !== null && verifiedStock < 1) || 
              !hasEnoughBalance
            }
          >
            {isPurchasing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              'Purchase Now'
            )}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
