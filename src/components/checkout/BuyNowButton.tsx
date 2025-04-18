
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ShoppingBag, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useOrderApi } from '@/hooks/use-order-api';

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
}

export const BuyNowButton: React.FC<BuyNowButtonProps> = ({ 
  className, 
  variant = 'default',
  size = 'default',
  isInStock = true,
  onSuccess,
  kioskToken,
  productId,
  quantity = 1,
  promotionCode
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { createOrder } = useOrderApi();
  
  // Debug log when the component mounts to verify the kioskToken
  useEffect(() => {
    console.log(`BuyNowButton for product ${productId}:`, {
      kioskToken: typeof kioskToken === 'string' ? kioskToken.substring(0, 10) + '...' : 'invalid type: ' + typeof kioskToken,
      productId,
      isInStock
    });
  }, [kioskToken, productId, isInStock]);

  // Make sure kioskToken is a string and not empty
  const hasValidKioskToken = typeof kioskToken === 'string' && kioskToken.trim() !== '';

  const handleBuyNow = async () => {
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
      // Validate promotion code if it's an object (could happen from form errors)
      const validPromotionCode = typeof promotionCode === 'string' ? promotionCode : undefined;
      
      console.log('Placing order with:', { kioskToken, productId, quantity, promotionCode: validPromotionCode });
      
      const result = await createOrder({
        kioskToken,
        productId,
        quantity,
        promotionCode: validPromotionCode
      });

      console.log('Order response:', result);
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
    }
  };

  return (
    <Button 
      variant={variant} 
      size={size}
      className={className}
      disabled={!isInStock || isLoading || !hasValidKioskToken}
      onClick={handleBuyNow}
    >
      {isLoading ? (
        <>
          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          Đang xử lý...
        </>
      ) : (
        <>
          <ShoppingBag className="w-4 h-4 mr-2" />
          {!hasValidKioskToken ? 'Không có sẵn' : isInStock ? 'Mua Ngay' : 'Hết Hàng'}
        </>
      )}
    </Button>
  );
};

export default BuyNowButton;
