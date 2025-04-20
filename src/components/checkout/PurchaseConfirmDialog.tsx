
import React, { useState, useEffect } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter,
  DialogDescription
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Product } from '@/types';
import { convertVNDtoUSD, formatUSD } from '@/utils/currency';
import { AlertTriangle, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';
import { useCurrencySettings } from '@/hooks/useCurrencySettings';
import { QuantitySelector } from './purchase-dialog/QuantitySelector';
import { BalanceInfo } from './purchase-dialog/BalanceInfo';
import { DialogFooterButtons } from './purchase-dialog/DialogFooterButtons';

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
    // Make sure newQuantity is valid and within range
    const maxQuantity = verifiedStock ?? product?.stockQuantity ?? 1;
    const validQuantity = Math.min(Math.max(1, newQuantity), maxQuantity);
    setQuantity(validQuantity);
    
    // Log for debugging
    console.log(`Quantity changed: ${validQuantity} (max: ${maxQuantity})`);
  };

  const handleSubmit = async () => {
    // Additional validation before submitting
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
        <DialogHeader className="bg-muted px-6 py-4 -mx-6 -mt-6 border-b border-border">
          <DialogTitle className="text-xl font-semibold text-foreground">
            {isVerifying ? 'Đang xác minh tồn kho...' : 'Xác nhận mua hàng'}
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground mt-1">
            {isVerifying ? 
              'Vui lòng đợi trong khi chúng tôi kiểm tra tồn kho sản phẩm' : 
              'Vui lòng xác nhận thông tin mua hàng của bạn'}
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          {/* Product Title */}
          <div className="space-y-2">
            <h3 className="font-medium text-lg text-center">{product.title}</h3>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Đơn giá:</span>
              <span className="font-medium text-primary">
                {formatUSD(productPriceUSD)}
                {verifiedPrice && verifiedPrice !== product.price && (
                  <span className="ml-2 text-xs text-muted-foreground">
                    (Đã cập nhật)
                  </span>
                )}
              </span>
            </div>
          </div>

          {isVerifying ? (
            <div className="flex flex-col items-center py-8 space-y-4">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground">
                Đang kiểm tra tồn kho và cập nhật giá...
              </p>
            </div>
          ) : (
            <>
              {/* Centered Quantity Selector */}
              <div className="flex flex-col items-center space-y-2 py-4">
                <QuantitySelector
                  quantity={quantity}
                  maxQuantity={verifiedStock ?? product.stockQuantity ?? 1}
                  onQuantityChange={handleQuantityChange}
                  verifiedStock={verifiedStock}
                  productStock={product.stockQuantity ?? 0}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="promotionCode">Mã giảm giá (tùy chọn):</Label>
                <Input
                  id="promotionCode"
                  value={promotionCode}
                  onChange={(e) => setPromotionCode(e.target.value)}
                  placeholder="Nhập mã giảm giá nếu có"
                  className="w-full"
                />
              </div>
              
              <BalanceInfo
                isLoadingBalance={isLoadingBalance}
                userBalance={userBalance}
                totalPriceUSD={totalPriceUSD}
              />
              
              {!isLoadingBalance && !hasEnoughBalance && (
                <Alert className="bg-red-50 border-red-200 text-red-800">
                  <AlertTriangle className="h-4 w-4 text-red-600" />
                  <AlertDescription className="text-red-800">
                    Số dư tài khoản của bạn không đủ để thực hiện giao dịch này.
                  </AlertDescription>
                </Alert>
              )}
              
              {!isVerifying && verifiedStock !== null && verifiedStock < (product.stockQuantity || 0) && (
                <Alert className="bg-amber-50 border-amber-200">
                  <AlertTriangle className="h-4 w-4 text-amber-500" />
                  <AlertDescription className="text-amber-800">
                    Tồn kho thực tế ({verifiedStock}) thấp hơn dự kiến.
                  </AlertDescription>
                </Alert>
              )}
            </>
          )}
        </div>
        
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
