
import { useState } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Loader2, CheckCircle, AlertCircle, CreditCard } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';
import { Product } from '@/types';

interface PurchaseConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  product: Product;
  quantity: number;
}

export function PurchaseConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  product,
  quantity
}: PurchaseConfirmationModalProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { userBalance } = useAuth();
  
  const totalPrice = product.price * quantity;
  const hasEnoughBalance = userBalance >= totalPrice;
  
  const handleConfirm = async () => {
    if (!hasEnoughBalance) {
      setError('Số dư không đủ. Vui lòng nạp tiền để tiếp tục.');
      return;
    }
    
    setIsProcessing(true);
    setError(null);
    
    try {
      await onConfirm();
      // Success is handled by the parent component
    } catch (err: any) {
      setError(err.message || 'Có lỗi xảy ra khi xử lý giao dịch.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Xác nhận đơn hàng</DialogTitle>
          <DialogDescription>
            Vui lòng xác nhận thông tin đơn hàng của bạn
          </DialogDescription>
        </DialogHeader>
        
        <div className="p-4 space-y-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="text-text-light">Sản phẩm:</div>
            <div className="font-medium">{product.title}</div>
            
            <div className="text-text-light">Số lượng:</div>
            <div className="font-medium">{quantity}</div>
            
            <div className="text-text-light">Đơn giá:</div>
            <div className="font-medium">{formatCurrency(product.price)}</div>
            
            <div className="text-text-light">Tổng tiền:</div>
            <div className="font-medium text-primary-dark">{formatCurrency(totalPrice)}</div>
            
            <div className="text-text-light">Số dư tài khoản:</div>
            <div className={`font-medium ${hasEnoughBalance ? 'text-green-600' : 'text-red-500'}`}>
              {formatCurrency(userBalance)}
            </div>
          </div>
          
          {!hasEnoughBalance && (
            <div className="flex items-start gap-2 p-3 mt-2 text-sm bg-red-50 border border-red-100 rounded-md">
              <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-red-700">Số dư không đủ</p>
                <p className="text-red-600 mt-1">
                  Vui lòng nạp thêm {formatCurrency(totalPrice - userBalance)} để tiếp tục thanh toán.
                </p>
                <Button 
                  variant="outline" 
                  className="mt-2 border-red-200 hover:bg-red-50 text-red-600"
                  size="sm"
                  onClick={() => window.location.href = '/top-up'}
                >
                  <CreditCard className="w-4 h-4 mr-1" />
                  Nạp tiền ngay
                </Button>
              </div>
            </div>
          )}
          
          {error && (
            <div className="p-3 mt-2 text-sm bg-red-50 border border-red-100 rounded-md">
              <div className="flex gap-2 items-start">
                <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                <p className="text-red-700">{error}</p>
              </div>
            </div>
          )}
        </div>
        
        <DialogFooter>
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isProcessing}
          >
            Hủy bỏ
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={isProcessing || !hasEnoughBalance}
            className="bg-primary hover:bg-primary-dark"
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Đang xử lý...
              </>
            ) : (
              <>
                <CheckCircle className="w-4 h-4 mr-2" />
                Mua ngay
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
