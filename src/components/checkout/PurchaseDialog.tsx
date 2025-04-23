
import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Product } from '@/types';
import { formatCurrency } from '@/utils/currency';
import { Loader2 } from 'lucide-react';

interface PurchaseDialogProps {
  product: Product;
  isOpen: boolean;
  onClose: () => void;
  initialQuantity?: number;
}

export const PurchaseDialog: React.FC<PurchaseDialogProps> = ({
  product,
  isOpen,
  onClose,
  initialQuantity = 1,
}) => {
  const [quantity, setQuantity] = useState(initialQuantity);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const handlePurchase = async () => {
    setIsSubmitting(true);
    // Simulate purchase process
    setTimeout(() => {
      setIsSubmitting(false);
      onClose();
    }, 1500);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <div className="space-y-4 py-2">
          <h2 className="text-lg font-semibold text-center">{product.title}</h2>
          
          <div className="flex justify-between items-center">
            <span>Quantity:</span>
            <span>{quantity}</span>
          </div>
          
          <div className="flex justify-between items-center">
            <span>Price per item:</span>
            <span>{formatCurrency(product.price)}</span>
          </div>
          
          <div className="flex justify-between items-center font-semibold">
            <span>Total:</span>
            <span>{formatCurrency(product.price * quantity)}</span>
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button onClick={handlePurchase} disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              'Confirm Purchase'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default PurchaseDialog;
