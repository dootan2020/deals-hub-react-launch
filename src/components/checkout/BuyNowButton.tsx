
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ShoppingBag, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useOrderApi } from '@/hooks/use-order-api';
import { PurchaseConfirmDialog } from './PurchaseConfirmDialog';

interface BuyNowButtonProps {
  product?: any;
  kioskToken?: string;
  productId?: string;
  quantity?: number;
  className?: string;
  variant?: 'default' | 'outline' | 'secondary' | 'ghost' | 'link' | 'destructive';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  isInStock?: boolean;
  promotionCode?: string;
  onSuccess?: () => void;
  children?: React.ReactNode;
}

export const BuyNowButton: React.FC<BuyNowButtonProps> = ({ 
  className, 
  variant = 'default',
  size = 'default',
  isInStock = true,
  onSuccess,
  kioskToken,
  productId,
  product,
  children,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const navigate = useNavigate();
  const { createOrder } = useOrderApi();
  
  // More lenient check for kioskToken
  const hasValidKioskToken = Boolean(kioskToken);

  const handleBuyNow = async (quantity: number, promotionCode?: string) => {
    if (!hasValidKioskToken || !productId) {
      console.error('Missing or invalid kioskToken or productId', { 
        kioskToken, 
        type: typeof kioskToken,
        productId 
      });
      toast.error('Không thể mua sản phẩm này: Thiếu thông tin sản phẩm');
      return;
    }

    setIsLoading(true);
    try {
      const result = await createOrder({
        kioskToken,
        productId,
        quantity,
        promotionCode
      });

      if (result.success && result.orderId) {
        if (onSuccess) onSuccess();
        navigate(`/order-success?orderId=${result.orderId}`);
      } else {
        throw new Error(result.message || 'Không thể tạo đơn hàng');
      }
    } catch (error: any) {
      console.error('Error placing order:', error);
      toast.error(error.message || 'Đã xảy ra lỗi khi đặt hàng');
    } finally {
      setIsLoading(false);
      setShowConfirmDialog(false);
    }
  };

  return (
    <>
      <Button 
        variant={variant} 
        size={size}
        className={className}
        disabled={!isInStock || isLoading}
        onClick={() => setShowConfirmDialog(true)}
      >
        {isLoading ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Đang xử lý...
          </>
        ) : (
          <>
            {children || (
              <>
                <ShoppingBag className="w-4 h-4 mr-2" />
                {!isInStock ? 'Hết Hàng' : 'Mua Ngay'}
              </>
            )}
          </>
        )}
      </Button>

      {product && (
        <PurchaseConfirmDialog
          open={showConfirmDialog}
          onClose={() => setShowConfirmDialog(false)}
          onConfirm={handleBuyNow}
          product={product}
          isProcessing={isLoading}
        />
      )}
    </>
  );
};

export default BuyNowButton;
