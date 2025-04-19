
import React, { useState, useEffect, useCallback } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle, Loader2, Heart, Minus, Plus } from 'lucide-react';
import { formatPrice } from '@/utils/productUtils';
import { useAuth } from '@/context/AuthContext';
import { Product } from '@/types';

interface PurchaseConfirmDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (quantity: number, promotionCode?: string) => void;
  product: Product;
  isProcessing?: boolean;
}

export const PurchaseConfirmDialog = ({
  open,
  onClose,
  onConfirm,
  product,
  isProcessing = false
}: PurchaseConfirmDialogProps) => {
  const { userBalance, refreshUserBalance } = useAuth();
  const [quantity, setQuantity] = useState(1);
  const [promotionCode, setPromotionCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [localBalance, setLocalBalance] = useState(0);
  
  const totalPrice = quantity * product.price;
  const canAfford = localBalance >= totalPrice;
  const maxQuantity = product.stockQuantity || 0;
  
  // Refresh balance when dialog opens and update local state
  const fetchAndUpdateBalance = useCallback(async () => {
    if (open) {
      console.log('Dialog opened, refreshing user balance');
      try {
        await refreshUserBalance();
        setLocalBalance(userBalance);
        console.log('User balance refreshed and set locally:', userBalance);
      } catch (error) {
        console.error('Error refreshing balance:', error);
      }
    }
  }, [open, refreshUserBalance, userBalance]);

  // Initial fetch when dialog opens
  useEffect(() => {
    fetchAndUpdateBalance();
    
    if (open) {
      setQuantity(1);
      setPromotionCode('');
      setError(null);
    }
  }, [open, fetchAndUpdateBalance]);
  
  // Update local balance whenever userBalance changes
  useEffect(() => {
    setLocalBalance(userBalance);
    console.log('userBalance updated in context:', userBalance);
    console.log('localBalance updated:', userBalance);
  }, [userBalance]);
  
  const handleQuantityChange = (amount: number) => {
    const newQuantity = quantity + amount;
    if (newQuantity >= 1 && newQuantity <= maxQuantity) {
      setQuantity(newQuantity);
    }
  };
  
  const handleConfirm = () => {
    if (!canAfford) {
      setError('Số dư không đủ để thực hiện giao dịch này');
      return;
    }
    onConfirm(quantity, promotionCode || undefined);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-white">
        <DialogHeader>
          <DialogTitle className="text-left text-xl font-semibold">Xác nhận mua hàng</DialogTitle>
          <DialogDescription className="text-left text-gray-500">
            Vui lòng kiểm tra thông tin trước khi thanh toán
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 text-left">
          {/* Product Info */}
          <div className="space-y-3 bg-gray-50 p-4 rounded-lg border border-gray-100">
            <h3 className="font-bold text-lg text-gray-900">{product.title}</h3>
            <div className="flex justify-between text-sm text-gray-600">
              <span>Đơn giá:</span>
              <span className="font-medium text-gray-900">{formatPrice(product.price)}</span>
            </div>
            <div className="flex justify-between text-sm text-gray-600">
              <span>Kho còn lại:</span>
              <span className="font-medium text-gray-900">{maxQuantity} sản phẩm</span>
            </div>
          </div>

          {/* Balance Info */}
          <div className="flex justify-between text-sm pt-2">
            <span className="text-gray-600">Số dư hiện tại:</span>
            <span className={`font-medium ${canAfford ? 'text-green-600' : 'text-red-600'}`}>
              {formatPrice(localBalance)}
            </span>
          </div>

          {/* Quantity Selector */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Số lượng:</label>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="icon"
                onClick={() => handleQuantityChange(-1)}
                disabled={quantity <= 1}
                className="border-gray-300 hover:bg-gray-50"
              >
                <Minus className="h-4 w-4" />
              </Button>
              <Input
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(Math.min(maxQuantity, Math.max(1, parseInt(e.target.value) || 1)))}
                className="w-20 text-center"
                min={1}
                max={maxQuantity}
              />
              <Button
                variant="outline"
                size="icon"
                onClick={() => handleQuantityChange(1)}
                disabled={quantity >= maxQuantity}
                className="border-gray-300 hover:bg-gray-50"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Promotion Code */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Mã giảm giá (không bắt buộc):</label>
            <Input
              placeholder="Nhập mã giảm giá"
              value={promotionCode}
              onChange={(e) => setPromotionCode(e.target.value)}
              className="border-gray-300"
            />
          </div>

          {/* Total Price */}
          <div className="flex justify-between items-center font-bold text-lg border-t border-b py-3 mt-4">
            <span className="text-gray-700">Tổng thanh toán:</span>
            <span className={!canAfford ? 'text-red-600' : 'text-primary'}>
              {formatPrice(totalPrice)}
            </span>
          </div>

          {/* Insufficient Balance Warning */}
          {!canAfford && (
            <Alert variant="destructive" className="bg-red-50 border border-red-100 text-left">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription className="text-red-800">
                Số dư của bạn không đủ để thanh toán. Vui lòng nạp thêm tiền vào tài khoản.
              </AlertDescription>
            </Alert>
          )}

          {/* Other Errors */}
          {error && error !== 'Số dư không đủ để thực hiện giao dịch này' && (
            <Alert variant="destructive" className="text-left">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </div>

        <DialogFooter className="sm:justify-between gap-4 mt-4 border-t pt-4">
          <Button
            variant="outline"
            size="lg"
            className="w-full sm:w-auto border-gray-300 text-gray-700 hover:bg-gray-50"
            onClick={onClose}
          >
            Hủy
          </Button>
          <div className="flex flex-row gap-2 w-full sm:w-auto">
            <Button
              variant="outline"
              size="icon"
              className="w-10 h-10 border-gray-300 hover:bg-gray-50"
              onClick={() => {}}
            >
              <Heart className="h-4 w-4 text-gray-600" />
            </Button>
            <Button
              variant="default"
              size="lg"
              className="flex-1 sm:w-auto bg-gradient-to-r from-primary to-primary-dark hover:from-primary-dark hover:to-primary transition-all duration-300 py-2 px-8"
              onClick={handleConfirm}
              disabled={!canAfford || isProcessing}
            >
              {isProcessing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Đang xử lý...
                </>
              ) : (
                'Thanh toán'
              )}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
