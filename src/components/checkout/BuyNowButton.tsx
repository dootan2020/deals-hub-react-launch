
import React, { useState } from 'react';
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

  const handleBuyNow = async () => {
    if (!kioskToken) {
      toast.error('Không thể mua sản phẩm này');
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('order-api', {
        body: {
          action: 'place-order',
          kioskToken,
          productId,
          quantity,
          promotionCode
        }
      });

      if (error) throw error;
      
      if (data?.order_id) {
        if (onSuccess) onSuccess();
        navigate(`/order-success?orderId=${data.order_id}`);
      } else {
        throw new Error(data?.message || 'Không thể tạo đơn hàng');
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
      disabled={!isInStock || isLoading}
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
          {isInStock ? 'Mua Ngay' : 'Hết Hàng'}
        </>
      )}
    </Button>
  );
};

export default BuyNowButton;
