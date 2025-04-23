
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

  const purchaseProduct = async (productId: string, quantity: number = 1): Promise<PurchaseResult> => {
    setIsLoading(true);
    setPurchaseKey(null);
    
    try {
      // Get current user session
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.user) {
        toast.error('Yêu cầu đăng nhập', {
          description: 'Vui lòng đăng nhập để mua sản phẩm'
        });
        return { success: false, error: 'Not authenticated' };
      }

      // Call the edge function
      const response = await supabase.functions.invoke('purchase-product', {
        body: JSON.stringify({
          userId: session.user.id,
          productId,
          quantity
        })
      });

      const result: PurchaseResult = response.data;

      if (result.success) {
        toast.success('Mua hàng thành công', {
          description: `Mã đơn hàng: ${result.orderId}`
        });
        
        if (result.key) {
          setPurchaseKey(result.key);
        }
      } else {
        toast.error('Mua hàng thất bại', {
          description: result.error || 'Lỗi không xác định'
        });
      }

      return result;
    } catch (error) {
      console.error('Purchase error:', error);
      toast.error('Lỗi giao dịch', {
        description: 'Đã xảy ra lỗi không mong muốn'
      });
      return { success: false, error: 'Unexpected error' };
    } finally {
      setIsLoading(false);
    }
  };

  return { purchaseProduct, isLoading, purchaseKey };
};
