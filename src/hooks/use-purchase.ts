
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface PurchaseResult {
  success: boolean;
  orderId?: string;
  key?: string;
  error?: string;
}

export const usePurchase = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [purchaseKey, setPurchaseKey] = useState<string | null>(null);

  // Main purchase function attaching to edge
  const purchaseProduct = async (
    productId: string, 
    quantity: number = 1
  ): Promise<PurchaseResult> => {
    setIsLoading(true);
    setPurchaseKey(null);

    try {
      // Fetch current session
      const { data: { session } } = await supabase.auth.getSession();

      if (!session?.user) {
        toast.error('Yêu cầu đăng nhập', {
          description: 'Vui lòng đăng nhập để mua sản phẩm',
        });
        setIsLoading(false);
        return { success: false, error: 'Not authenticated' };
      }

      // Call Edge function `purchase-product`
      const { data: result, error } = await supabase.functions.invoke('purchase-product', {
        body: {
          userId: session.user.id,
          productId,
          quantity
        }
      });

      if (error || !result) {
        toast.error('Mua hàng thất bại', {
          description: error?.message || 'Không thể kết nối máy chủ'
        });
        setIsLoading(false);
        return { success: false, error: error?.message || 'Lỗi kết nối máy chủ' };
      }

      if (result.success) {
        toast.success('Mua hàng thành công', {
          description: result?.orderId ? `Mã đơn hàng: ${result.orderId}` : ''
        });
        if (result.key) setPurchaseKey(result.key);
        return result;
      } else {
        toast.error('Mua hàng thất bại', {
          description: result.error || 'Lỗi không xác định'
        });
        setIsLoading(false);
        return { success: false, error: result.error || 'Lỗi không xác định' };
      }
    } catch (error: any) {
      toast.error('Lỗi giao dịch', {
        description: 'Đã xảy ra lỗi không mong muốn'
      });
      setIsLoading(false);
      return { success: false, error: 'Lỗi không mong muốn' };
    } finally {
      setIsLoading(false);
    }
  };

  return { purchaseProduct, isLoading, purchaseKey };
};

