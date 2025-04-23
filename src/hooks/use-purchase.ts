
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface PurchaseResult {
  success: boolean;
  orderId?: string;
  key?: string;
  error?: string;
}

export const usePurchase = () => {
  const [isLoading, setIsLoading] = useState(false);

  const purchaseProduct = async (productId: string, quantity: number = 1) => {
    setIsLoading(true);
    
    try {
      // Get current user session
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.user) {
        toast.error('Authentication required', 'Please log in to make a purchase');
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
        toast.success('Purchase Successful', `Order ID: ${result.orderId}`);
      } else {
        toast.error('Purchase Failed', result.error);
      }

      return result;
    } catch (error) {
      console.error('Purchase error:', error);
      toast.error('Purchase Error', 'An unexpected error occurred');
      return { success: false, error: 'Unexpected error' };
    } finally {
      setIsLoading(false);
    }
  };

  return { purchaseProduct, isLoading };
};
