
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle, Loader2, Heart } from 'lucide-react';
import { formatPrice } from '@/utils/productUtils';
import { ProductInfo } from './dialog-sections/ProductInfo';
import { QuantitySelector } from './dialog-sections/QuantitySelector';
import { PromotionInput } from './dialog-sections/PromotionInput';
import { usePurchaseDialogState } from '@/hooks/use-purchase-dialog-state';
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
  const maxQuantity = product.stockQuantity || 0;
  
  const {
    quantity,
    setQuantity,
    promotionCode,
    setPromotionCode,
    error,
    setError,
    liveBalance,
    totalPrice,
    canAfford,
    isLoadingBalance
  } = usePurchaseDialogState(open, product.price);
  
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
          <ProductInfo product={product} maxQuantity={maxQuantity} />

          <div className="flex justify-between text-sm pt-2">
            <span className="text-gray-600">Số dư hiện tại:</span>
            {isLoadingBalance ? (
              <span className="flex items-center text-gray-500">
                <Loader2 className="w-3 h-3 mr-2 animate-spin" />
                Đang tải...
              </span>
            ) : (
              <span className={`font-medium ${canAfford ? 'text-green-600' : 'text-red-600'}`}>
                {formatPrice(liveBalance)}
              </span>
            )}
          </div>

          <QuantitySelector
            quantity={quantity}
            maxQuantity={maxQuantity}
            onQuantityChange={setQuantity}
          />

          <PromotionInput
            promotionCode={promotionCode}
            onPromotionChange={setPromotionCode}
          />

          <div className="flex justify-between items-center font-bold text-lg border-t border-b py-3 mt-4">
            <span className="text-gray-700">Tổng thanh toán:</span>
            <span className={!canAfford ? 'text-red-600' : 'text-primary'}>
              {formatPrice(totalPrice)}
            </span>
          </div>

          {!canAfford && !isLoadingBalance && (
            <Alert variant="destructive" className="bg-red-50 border border-red-100 text-left">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription className="text-red-800">
                Số dư của bạn không đủ để thanh toán. Vui lòng nạp thêm tiền vào tài khoản.
              </AlertDescription>
            </Alert>
          )}

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
