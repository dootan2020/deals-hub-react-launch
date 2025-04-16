
import { useState } from 'react';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export function useOrderApi() {
  const [isLoading, setIsLoading] = useState(false);
  const queryClient = useQueryClient();
  
  const placeOrder = async ({ 
    productId, 
    quantity, 
    promotionCode 
  }: { 
    productId: string; 
    quantity: number; 
    promotionCode?: string 
  }) => {
    setIsLoading(true);
    try {
      const response = await fetch(`/functions/v1/order-api?action=place-order`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ productId, quantity, promotionCode }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to place order');
      }
      
      toast.success('Order placed successfully');
      return data;
    } catch (error) {
      console.error('Place order error:', error);
      toast.error(`Failed to place order: ${error.message}`);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };
  
  const checkOrder = async (orderId: string) => {
    setIsLoading(true);
    try {
      const response = await fetch(`/functions/v1/order-api?action=check-order`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ orderId }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to check order');
      }
      
      return data;
    } catch (error) {
      console.error('Check order error:', error);
      toast.error(`Failed to check order: ${error.message}`);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };
  
  const fetchOrders = async () => {
    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        order_items(
          *,
          product:products(*)
        )
      `)
      .order('created_at', { ascending: false });
      
    if (error) throw error;
    return data;
  };
  
  // Set up React Query mutations
  const placeOrderMutation = useMutation({
    mutationFn: placeOrder,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
  });
  
  const checkOrderMutation = useMutation({
    mutationFn: checkOrder,
    onSuccess: (data, variables) => {
      if (data.success === 'true') {
        queryClient.invalidateQueries({ queryKey: ['orders'] });
        toast.success(`Order ${variables} completed successfully`);
      } else if (data.description === 'Order in processing!') {
        toast.info('Order is still being processed');
      } else {
        toast.error(`Order check failed: ${data.description}`);
      }
    },
  });
  
  const ordersQuery = useQuery({
    queryKey: ['orders'],
    queryFn: fetchOrders,
  });
  
  return {
    placeOrder: placeOrderMutation.mutate,
    checkOrder: checkOrderMutation.mutate,
    isLoading: isLoading || placeOrderMutation.isPending || checkOrderMutation.isPending,
    orders: ordersQuery.data || [],
    isOrdersLoading: ordersQuery.isLoading,
    fetchOrders,
  };
}
