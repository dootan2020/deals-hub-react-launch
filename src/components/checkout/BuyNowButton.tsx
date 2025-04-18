
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ShoppingBag, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

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
  
  // Debug log when the component mounts to verify the kioskToken
  useEffect(() => {
    console.log(`BuyNowButton for product ${productId}:`, {
      kioskToken: kioskToken || 'missing',
      productId,
      isInStock
    });
  }, [kioskToken, productId, isInStock]);

  const hasValidKioskToken = kioskToken && kioskToken.trim() !== '';

  const handleBuyNow = async () => {
    if (!hasValidKioskToken) {
      console.error('Missing kioskToken', { kioskToken, productId });
      toast.error('Không thể mua sản phẩm này: Thiếu thông tin sản phẩm (kioskToken)');
      return;
    }

    setIsLoading(true);
    try {
      console.log('Placing order with:', { kioskToken, productId, quantity, promotionCode });
      const { data, error } = await supabase.functions.invoke('order-api', {
        body: {
          action: 'place-order',
          kioskToken,
          productId,
          quantity,
          promotionCode
        }
      });

      if (error) {
        console.error('Supabase function error:', error);
        throw error;
      }
      
      console.log('Order response:', data);
      if (data?.order_id) {
        if (onSuccess) onSuccess();
        navigate(`/order-success?orderId=${data.order_id}`);
      } else {
        throw new Error(data?.message || data?.error || 'Không thể tạo đơn hàng');
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
