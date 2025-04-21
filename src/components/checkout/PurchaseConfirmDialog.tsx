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
  product: Product;
  onPurchase: (productId: string, quantity: number, promotionCode: string) => Promise<void>;
  onClose: () => void;
  isOpen: boolean;
}

export const PurchaseConfirmDialog = ({ product, onPurchase, onClose, isOpen }: PurchaseConfirmDialogProps) => {
  const [quantity, setQuantity] = useState(1);
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [verifiedStock, setVerifiedStock] = useState<number | null>(null);
  const [verifiedPrice, setVerifiedPrice] = useState<number | null>(null);
  const [promotionCode, setPromotionCode] = useState('');
  const { data: currencySettings } = useCurrencySettings();
  const { userBalance, isLoading: isLoadingBalance } = useUserBalance();
  const vndToUsdRate = currencySettings?.vnd_per_usd || 24000;
  const priceUSD = product.price / vndToUsdRate;
  const totalPriceUSD = priceUSD * quantity;
  const hasEnoughBalance = userBalance !== null && userBalance >= totalPriceUSD;

  useEffect(() => {
    const verifyProductDetails = async () => {
      setIsVerifying(true);
      try {
        // Simulate API verification (replace with actual API call)
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Simulate fetching updated stock and price from an API
        const updatedStock = Math.floor(Math.random() * (product.stock_quantity || product.stock || 100));
        const updatedPrice = product.price;

        setVerifiedStock(updatedStock);
        setVerifiedPrice(updatedPrice);
      } catch (error) {
        console.error("Error verifying product details:", error);
        toast({
          title: "Error",
          description: "Failed to verify product details. Please try again.",
          type: "destructive",
        });
      } finally {
        setIsVerifying(false);
      }
    };

    if (isOpen) {
      verifyProductDetails();
    }
  }, [isOpen, product.price, product.stock, product.stock_quantity]);

  const handlePurchase = async () => {
    setIsPurchasing(true);
    try {
      if (!product.id) {
        throw new Error("Product ID is missing.");
      }
      await onPurchase(product.id, quantity, promotionCode);
      toast.success("Purchase successful!");
      onClose();
    } catch (error: any) {
      console.error("Purchase failed:", error);
      toast.error(error?.message || "Purchase failed. Please try again.");
    } finally {
      setIsPurchasing(false);
    }
  };

  const handleDialogClose = () => {
    onClose();
  };

  // Update the references to stockQuantity to stock_quantity
  const handleQuantityChange = (newQuantity: number) => {
    if (newQuantity >= 1 && newQuantity <= (verifiedStock ?? product.stock_quantity ?? 1)) {
      setQuantity(newQuantity);
    }
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
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
            onClick={handleDialogClose}
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
