
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Product } from '@/types';
import { DialogHeader as CustomDialogHeader } from './purchase-dialog/DialogHeader';
import { DialogContent as CustomDialogContent } from './purchase-dialog/DialogContent';
import { DialogFooterButtons } from './purchase-dialog/DialogFooterButtons';
import { usePurchaseToast } from '@/hooks/purchase/usePurchaseToast';
import { toast } from 'sonner';

interface PurchaseDialogProps {
  product: Product;
  isOpen: boolean;
  onClose: () => void;
  initialQuantity?: number;
}

export const PurchaseDialog = ({
  product,
  isOpen,
  onClose,
  initialQuantity = 1
}: PurchaseDialogProps) => {
  const [quantity, setQuantity] = useState(initialQuantity);
  const [isVerifying, setIsVerifying] = useState(false);
  const [verifiedStock, setVerifiedStock] = useState<number | null>(null);
  const [verifiedPrice, setVerifiedPrice] = useState<number | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [promotionCode, setPromotionCode] = useState('');
  const [userBalance, setUserBalance] = useState<number | null>(null);
  const [isLoadingBalance, setIsLoadingBalance] = useState(false);
  
  // Price calculations
  const priceUSD = product.price / 24000; // Using a fixed conversion rate, you might want to use a dynamic one
  const totalPriceUSD = priceUSD * quantity;

  const { notifyLoading, notifySuccess, notifyError } = usePurchaseToast();

  const handleQuantityChange = (newQuantity: number) => {
    setQuantity(newQuantity);
  };

  const handlePromotionCodeChange = (code: string) => {
    setPromotionCode(code);
  };

  const handlePurchase = async () => {
    setIsProcessing(true);
    notifyLoading();
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      notifySuccess(
        "Purchase Successful",
        `You have purchased ${quantity} ${product.title}`
      );
      
      onClose();
    } catch (error) {
      console.error("Purchase error:", error);
      notifyError(
        "Purchase Failed",
        "There was an error processing your purchase. Please try again."
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const handleVerifyProduct = async () => {
    if (!product) return;
    
    setIsVerifying(true);
    
    try {
      // Simulate API verification
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Use product's stock as verified stock for now
      setVerifiedStock(product.stock || 0);
      setVerifiedPrice(product.price);
      
      setIsLoadingBalance(true);
      // Simulate fetching user balance
      await new Promise(resolve => setTimeout(resolve, 800));
      setUserBalance(50); // Mock balance
      setIsLoadingBalance(false);
      
    } catch (error) {
      console.error("Error verifying product:", error);
      toast.error("Failed to verify product availability");
      setVerifiedStock(null);
      setVerifiedPrice(null);
    } finally {
      setIsVerifying(false);
    }
  };

  // Verify product when dialog opens
  React.useEffect(() => {
    if (isOpen) {
      handleVerifyProduct();
    }
  }, [isOpen]);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Purchase {product.title}</DialogTitle>
        </DialogHeader>
        
        <CustomDialogHeader 
          title={product.title}
          onClose={onClose}
        />
        
        <CustomDialogContent
          product={product}
          isVerifying={isVerifying}
          quantity={quantity}
          verifiedStock={verifiedStock}
          verifiedPrice={verifiedPrice}
          priceUSD={priceUSD}
          totalPriceUSD={totalPriceUSD}
          promotionCode={promotionCode}
          onQuantityChange={handleQuantityChange}
          onPromotionCodeChange={handlePromotionCodeChange}
          isLoadingBalance={isLoadingBalance}
          userBalance={userBalance}
        />
        
        <DialogFooterButtons
          onClose={onClose}
          onPurchase={handlePurchase}
          isProcessing={isProcessing}
          isVerifying={isVerifying}
          hasBalance={userBalance !== null && userBalance >= totalPriceUSD}
          isLoadingBalance={isLoadingBalance}
        />
      </DialogContent>
    </Dialog>
  );
};

export default PurchaseDialog;
