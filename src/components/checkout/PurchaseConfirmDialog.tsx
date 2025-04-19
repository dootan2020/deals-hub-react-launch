
import React, { useState, useEffect } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter,
  DialogDescription
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Product } from '@/types';
import { formatUSD, convertVNDtoUSD } from '@/utils/currency';
import { Loader2, CreditCard, AlertTriangle, Plus, Minus, Check } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';
import { useCurrencySettings } from '@/hooks/useCurrencySettings';

interface PurchaseConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product?: Product;
  onConfirm: (quantity: number, promotionCode?: string) => void;
}

export const PurchaseConfirmDialog: React.FC<PurchaseConfirmDialogProps> = ({
  open,
  onOpenChange,
  product,
  onConfirm
}) => {
  const { user } = useAuth();
  const { data: currencySettings } = useCurrencySettings();
  const rate = currencySettings?.vnd_per_usd ?? 24000;
  
  // State
  const [quantity, setQuantity] = useState(1);
  const [promotionCode, setPromotionCode] = useState('');
  const [userBalance, setUserBalance] = useState<number | null>(null);
  const [isLoadingBalance, setIsLoadingBalance] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Calculate product price in USD
  const productPriceUSD = product ? convertVNDtoUSD(product.price, rate) : 0;
  
  // Calculate total price in USD
  const totalPriceUSD = productPriceUSD * quantity;
  
  // Check if user has enough balance
  const hasEnoughBalance = userBalance !== null && userBalance >= totalPriceUSD;

  // Fetch user balance directly from Supabase when dialog opens
  useEffect(() => {
    const fetchUserBalance = async () => {
      if (!open || !user) return;
      
      setIsLoadingBalance(true);
      try {
        // Fetch balance directly from Supabase
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

  // Reset dialog state when it opens/closes
  useEffect(() => {
    if (!open) {
      setQuantity(1);
      setPromotionCode('');
    }
  }, [open]);

  // Handle quantity change with bounds check
  const handleQuantityChange = (amount: number) => {
    const maxQuantity = product?.stockQuantity || 1;
    const newQuantity = Math.min(Math.max(1, quantity + amount), maxQuantity);
    setQuantity(newQuantity);
  };

  // Handle direct quantity input with validation
  const handleQuantityInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value, 10);
    if (isNaN(value)) return;
    
    const maxQuantity = product?.stockQuantity || 1;
    setQuantity(Math.min(Math.max(1, value), maxQuantity));
  };

  // Handle confirmation
  const handleConfirm = async () => {
    if (!product || !hasEnoughBalance) return;

    setIsSubmitting(true);
    try {
      await onConfirm(quantity, promotionCode || undefined);
      // Dialog will be closed by the parent component on successful confirmation
    } catch (error) {
      console.error('Error confirming purchase:', error);
      toast.error('Đã xảy ra lỗi khi xử lý giao dịch');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!product) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center text-xl font-medium">Xác nhận mua hàng</DialogTitle>
          <DialogDescription className="text-center text-sm text-muted-foreground">
            Vui lòng xác nhận thông tin mua hàng của bạn
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          {/* Product info */}
          <div className="space-y-2 pb-2 border-b border-border">
            <h3 className="font-medium text-lg">{product.title}</h3>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Đơn giá:</span>
              <span className="font-medium text-primary">{formatUSD(productPriceUSD)}</span>
            </div>
          </div>
          
          {/* Quantity selector */}
          <div className="space-y-2">
            <Label htmlFor="quantity">Số lượng:</Label>
            <div className="flex items-center border rounded-md">
              <Button 
                type="button" 
                variant="ghost" 
                size="sm" 
                className="rounded-r-none"
                onClick={() => handleQuantityChange(-1)}
                disabled={quantity <= 1}
              >
                <Minus className="h-4 w-4" />
              </Button>
              <Input
                id="quantity"
                type="number"
                value={quantity}
                onChange={handleQuantityInput}
                min={1}
                max={product.stockQuantity}
                className="border-0 text-center w-16"
              />
              <Button 
                type="button" 
                variant="ghost" 
                size="sm" 
                className="rounded-l-none"
                onClick={() => handleQuantityChange(1)}
                disabled={quantity >= (product.stockQuantity || 1)}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <div className="text-xs text-muted-foreground">
              Còn lại: {product.stockQuantity || 0} sản phẩm
            </div>
          </div>
          
          {/* Promotion code */}
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
          
          {/* User balance */}
          <div className="flex justify-between items-center p-3 bg-secondary/20 rounded-md border border-border">
            <div className="flex flex-col">
              <span className="text-sm text-muted-foreground">Số dư tài khoản:</span>
              {isLoadingBalance ? (
                <div className="flex items-center gap-1">
                  <Loader2 className="h-3 w-3 animate-spin" />
                  <span className="text-sm">Đang tải...</span>
                </div>
              ) : (
                <span className="font-medium">{formatUSD(userBalance || 0)}</span>
              )}
            </div>
            <div className="flex flex-col items-end">
              <span className="text-sm text-muted-foreground">Tổng tiền:</span>
              <span className="font-medium text-primary">{formatUSD(totalPriceUSD)}</span>
            </div>
          </div>
          
          {/* Warning if balance is not enough */}
          {!isLoadingBalance && !hasEnoughBalance && (
            <Alert className="bg-red-50 border-red-200 text-red-800">
              <AlertTriangle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-800">
                Số dư tài khoản của bạn không đủ để thực hiện giao dịch này.
              </AlertDescription>
            </Alert>
          )}
        </div>
        
        <DialogFooter className="flex flex-col sm:flex-row gap-2">
          <Button 
            variant="outline" 
            className="flex-1" 
            onClick={() => onOpenChange(false)} 
            disabled={isSubmitting}
          >
            Hủy bỏ
          </Button>
          <Button 
            variant="default" 
            className="flex-1 bg-primary text-white" 
            disabled={!hasEnoughBalance || isSubmitting || isLoadingBalance}
            onClick={handleConfirm}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" /> 
                Đang xử lý
              </>
            ) : (
              <>
                <CreditCard className="w-4 h-4 mr-2" /> 
                Thanh toán
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default PurchaseConfirmDialog;
