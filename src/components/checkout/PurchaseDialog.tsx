
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Product } from '@/types';
import { DialogHeader } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Loader2, ShoppingCart } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
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
  const [isProcessing, setIsProcessing] = useState(false);
  const [userBalance, setUserBalance] = useState<number | null>(null);
  const [isLoadingBalance, setIsLoadingBalance] = useState(false);
  const { userBalance: authBalance, isLoadingBalance: authLoading } = useAuth();
  
  // Price calculations
  const totalPrice = product.price * quantity;

  useEffect(() => {
    setUserBalance(authBalance);
    setIsLoadingBalance(authLoading);
  }, [authBalance, authLoading]);

  const handleQuantityChange = (newQuantity: number) => {
    if (newQuantity > 0 && newQuantity <= product.stock) {
      setQuantity(newQuantity);
    }
  };

  const handlePurchase = async () => {
    setIsProcessing(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      toast.success(
        "Purchase Successful",
        `You have purchased ${quantity} ${product.title}`
      );
      
      onClose();
    } catch (error) {
      console.error("Purchase error:", error);
      toast.error(
        "Purchase Failed",
        "There was an error processing your purchase. Please try again."
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const hasEnoughBalance = userBalance !== null && userBalance >= totalPrice;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <h2 className="text-lg font-semibold">{product.title}</h2>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          {/* Product Info */}
          <div className="flex items-center space-x-4">
            <div className="h-16 w-16 rounded bg-gray-100 overflow-hidden">
              {product.images && product.images[0] && (
                <img 
                  src={product.images[0]} 
                  alt={product.title} 
                  className="h-full w-full object-cover"
                />
              )}
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Price:</div>
              <div className="font-medium">
                {new Intl.NumberFormat('vi-VN', {
                  style: 'currency',
                  currency: 'VND'
                }).format(product.price)}
              </div>
            </div>
          </div>
          
          {/* Quantity Selector */}
          <div className="flex flex-col items-center space-y-2 py-4">
            <div className="flex items-center">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => handleQuantityChange(quantity - 1)}
                disabled={quantity <= 1 || isProcessing}
              >-</Button>
              <div className="w-16 text-center">{quantity}</div>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => handleQuantityChange(quantity + 1)}
                disabled={quantity >= product.stock || isProcessing}
              >+</Button>
            </div>
            <div className="text-sm text-muted-foreground">
              Available: {product.stock}
            </div>
          </div>
          
          {/* Balance and Total */}
          <div className="flex justify-between items-center p-3 bg-secondary/20 rounded-md border border-border">
            <div className="flex flex-col">
              <span className="text-sm text-muted-foreground">Balance:</span>
              {isLoadingBalance ? (
                <div className="flex items-center gap-1">
                  <Loader2 className="h-3 w-3 animate-spin" />
                  <span className="text-sm">Loading...</span>
                </div>
              ) : (
                <span className="font-medium">
                  {new Intl.NumberFormat('vi-VN', {
                    style: 'currency',
                    currency: 'VND'
                  }).format(userBalance || 0)}
                </span>
              )}
            </div>
            <div className="flex flex-col items-end">
              <span className="text-sm text-muted-foreground">Total:</span>
              <span className="font-medium text-primary">
                {new Intl.NumberFormat('vi-VN', {
                  style: 'currency',
                  currency: 'VND'
                }).format(totalPrice)}
              </span>
            </div>
          </div>
          
          {!isLoadingBalance && !hasEnoughBalance && (
            <div className="bg-red-50 border border-red-200 text-red-800 p-3 rounded-md text-sm">
              Insufficient balance. Please add funds to your account.
            </div>
          )}
        </div>
        
        <div className="flex justify-between gap-4 mt-4">
          <Button 
            variant="outline" 
            className="flex-1" 
            onClick={onClose} 
            disabled={isProcessing}
          >
            Cancel
          </Button>
          <Button 
            variant="default" 
            className="flex-1 bg-primary text-white" 
            disabled={!hasEnoughBalance || isProcessing || isLoadingBalance}
            onClick={handlePurchase}
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" /> 
                Processing
              </>
            ) : (
              <>
                <ShoppingCart className="w-4 h-4 mr-2" /> 
                Purchase
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PurchaseDialog;
