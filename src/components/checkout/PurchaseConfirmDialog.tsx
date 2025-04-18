
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle, Loader2, Heart, Minus, Plus } from 'lucide-react';
import { formatPrice } from '@/lib/utils';
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
  const { userBalance } = useAuth();
  const [quantity, setQuantity] = useState(1);
  const [promotionCode, setPromotionCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  
  const totalPrice = quantity * product.price;
  const canAfford = userBalance >= totalPrice;
  const maxQuantity = product.stockQuantity || 0;
  
  useEffect(() => {
    if (open) {
      setQuantity(1);
      setPromotionCode('');
      setError(null);
    }
  }, [open]);
  
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
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Xác nhận mua hàng</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Product Info */}
          <div className="space-y-2">
            <h3 className="font-bold text-lg">{product.title}</h3>
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Đơn giá:</span>
              <span className="font-medium text-foreground">{formatPrice(product.price)}</span>
            </div>
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Kho còn lại:</span>
              <span className="font-medium text-foreground">{maxQuantity} sản phẩm</span>
            </div>
          </div>

          {/* Balance Info */}
          <div className="flex justify-between text-sm">
            <span>Số dư hiện tại:</span>
            <span className={`font-medium ${canAfford ? 'text-green-600' : 'text-red-600'}`}>
              {formatPrice(userBalance)}
            </span>
          </div>

          {/* Quantity Selector */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Số lượng:</label>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="icon"
                onClick={() => handleQuantityChange(-1)}
                disabled={quantity <= 1}
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
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Promotion Code */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Mã giảm giá (không bắt buộc):</label>
            <Input
              placeholder="Nhập mã giảm giá"
              value={promotionCode}
              onChange={(e) => setPromotionCode(e.target.value)}
            />
          </div>

          {/* Total Price */}
          <div className="flex justify-between items-center font-bold text-lg">
            <span>Tổng thanh toán:</span>
            <span>{formatPrice(totalPrice)}</span>
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </div>

        <DialogFooter className="sm:justify-between">
          <Button
            variant="outline"
            size="lg"
            className="w-full sm:w-auto"
            onClick={onClose}
          >
            Hủy
          </Button>
          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            <Button
              variant="outline"
              size="icon"
              className="w-full sm:w-auto"
              onClick={() => {}}
            >
              <Heart className="h-4 w-4" />
            </Button>
            <Button
              variant="default"
              size="lg"
              className="w-full sm:w-auto bg-gradient-to-r from-green-600 to-green-500"
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

