import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogFooter } from '@/components/ui/dialog';
import { Product } from '@/types';
import { convertVNDtoUSD } from '@/utils/currency';
import { useCurrencySettings } from '@/hooks/useCurrencySettings';
import { DialogHeader } from './purchase-dialog/DialogHeader';
import { DialogContent as PurchaseDialogContent } from './purchase-dialog/DialogContent';
import { DialogFooterButtons } from './purchase-dialog/DialogFooterButtons';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';

interface PurchaseConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product?: Product;
  onConfirm: (quantity: number, promotionCode?: string) => void;
  isVerifying?: boolean;
  verifiedStock?: number | null;
  verifiedPrice?: number | null;
}

export const PurchaseConfirmDialog: React.FC<PurchaseConfirmDialogProps> = ({
  open,
  onOpenChange,
  product,
  onConfirm,
  isVerifying = false,
  verifiedStock = null,
  verifiedPrice = null
}) => {
  const { user } = useAuth();
  const { data: currencySettings } = useCurrencySettings();
  const rate = currencySettings?.vnd_per_usd ?? 24000;
  
  const [quantity, setQuantity] = useState(1);
  const [promotionCode, setPromotionCode] = useState('');
  const [userBalance, setUserBalance] = useState<number | null>(null);
  const [isLoadingBalance, setIsLoadingBalance] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const productPriceUSD = product ? 
    convertVNDtoUSD(verifiedPrice || product.price, rate) : 0;
  
  const totalPriceUSD = productPriceUSD * quantity;
  
  const hasEnoughBalance = userBalance !== null && userBalance >= totalPriceUSD;

  useEffect(() => {
    const fetchUserBalance = async () => {
      if (!open || !user) return;
      
      setIsLoadingBalance(true);
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('balance')
          .eq('id', user.id)
          .maybeSingle();

        if (error) {
          console.error('Error fetching user balance:', error);
          setUserBalance(0);
          return;
        }

        if (data && typeof data.balance === 'number') {
          setUserBalance(data.balance);
        } else {
          console.warn('No balance data found');
          setUserBalance(0);
        }
      } catch (error) {
        console.error('Exception in fetchUserBalance:', error);
        setUserBalance(0);
      } finally {
        setIsLoadingBalance(false);
      }
    };

    fetchUserBalance();
  }, [open, user]);

  useEffect(() => {
    if (!open) {
      setQuantity(1);
      setPromotionCode('');
    }
  }, [open]);

  const handleQuantityChange = (newQuantity: number) => {
    const maxQuantity = verifiedStock ?? product?.stockQuantity ?? 1;
    const validQuantity = Math.min(Math.max(1, newQuantity), maxQuantity);
    setQuantity(validQuantity);
    
    console.log(`Quantity changed: ${validQuantity} (max: ${maxQuantity})`);
  };

  const handleSubmit = async () => {
    const maxQuantity = verifiedStock ?? product?.stockQuantity ?? 1;
    
    if (quantity < 1) {
      toast.error("Số lượng không hợp lệ");
      return;
    }
    
    if (quantity > maxQuantity) {
      toast.error(`Số lượng không thể vượt quá ${maxQuantity}`);
      return;
    }

    setIsSubmitting(true);
    try {
      await onConfirm(quantity, promotionCode);
    } catch (error) {
      console.error("Error during purchase confirmation:", error);
      toast.error("Có lỗi xảy ra khi xác nhận mua hàng");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!product) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader isVerifying={isVerifying} />
        
        <PurchaseDialogContent
          product={product}
          isVerifying={isVerifying}
          quantity={quantity}
          verifiedStock={verifiedStock}
          verifiedPrice={verifiedPrice}
          priceUSD={productPriceUSD}
          totalPriceUSD={totalPriceUSD}
          promotionCode={promotionCode}
          onQuantityChange={handleQuantityChange}
          onPromotionCodeChange={setPromotionCode}
          isLoadingBalance={isLoadingBalance}
          userBalance={userBalance}
        />
        
        <DialogFooter className="flex flex-col sm:flex-row gap-2">
          <DialogFooterButtons
            onCancel={() => onOpenChange(false)}
            onConfirm={handleSubmit}
            isSubmitting={isSubmitting}
            isVerifying={isVerifying}
            hasEnoughBalance={hasEnoughBalance}
          />
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default PurchaseConfirmDialog;
