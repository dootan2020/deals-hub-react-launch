
import { useState } from 'react';
import { Product } from '@/types';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface UsePurchaseOptions {
  onSuccess?: () => void;
}

export const usePurchase = (options?: UsePurchaseOptions) => {
  const [isLoading, setIsLoading] = useState(false);

  const purchaseProduct = async (product: Product, quantity: number = 1) => {
    if (!product || !product.id) {
      toast.error("Invalid product", "Cannot purchase this product");
      return false;
    }

    setIsLoading(true);
    try {
      // Check if user is authenticated
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.user) {
        toast.error("Authentication required", "Please log in to purchase products");
        return false;
      }
      
      // Calculate total price
      const totalPrice = product.price * quantity;
      
      // Create order record
      const { data, error } = await supabase
        .from('orders')
        .insert({
          user_id: session.user.id,
          product_id: product.id,
          total_price: totalPrice,
          status: 'completed',
          qty: quantity
        })
        .select()
        .single();
        
      if (error) throw error;
      
      toast.success("Purchase successful", "Your order has been placed");
      
      if (options?.onSuccess) {
        options.onSuccess();
      }
      
      return true;
    } catch (error: any) {
      console.error("Purchase error:", error);
      toast.error("Purchase failed", error.message || "An error occurred during purchase");
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    purchaseProduct,
    isLoading
  };
};
