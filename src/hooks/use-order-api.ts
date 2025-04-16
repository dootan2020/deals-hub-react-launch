
import { useState } from 'react';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface PlaceOrderParams {
  productId: string;
  quantity: number;
  promotionCode?: string;
}

interface CheckOrderParams {
  orderId: string;
}

export function useOrderApi() {
  const [isLoading, setIsLoading] = useState(false);
  const queryClient = useQueryClient();
  
  // Fetch all orders from the database
  const fetchOrders = async () => {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });
      
    if (error) {
      throw error;
    }
    
    return data || [];
  };
  
  // Place an order with the API
  const placeOrder = async ({ productId, quantity, promotionCode }: PlaceOrderParams) => {
    setIsLoading(true);
    try {
      const response = await fetch('/functions/v1/order-api?action=place-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          productId,
          quantity,
          promotionCode,
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to place order');
      }
      
      return data;
    } finally {
      setIsLoading(false);
    }
  };
  
  // Check the status of an order with the API
  const checkOrder = async ({ orderId }: CheckOrderParams) => {
    setIsLoading(true);
    try {
      const response = await fetch('/functions/v1/order-api?action=check-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          orderId,
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to check order');
      }
      
      return data;
    } finally {
      setIsLoading(false);
    }
  };
  
  // Set up React Query mutations
  const placeOrderMutation = useMutation({
    mutationFn: placeOrder,
    onSuccess: () => {
      toast.success('Order placed successfully');
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
    onError: (error: Error) => {
      toast.error(`Error: ${error.message}`);
    },
  });
  
  const checkOrderMutation = useMutation({
    mutationFn: checkOrder,
    onSuccess: (data) => {
      if (data.success === 'true') {
        toast.success('Order completed successfully');
        queryClient.invalidateQueries({ queryKey: ['orders'] });
      } else {
        toast.info(data.description || 'Order is still processing');
      }
    },
    onError: (error: Error) => {
      toast.error(`Error: ${error.message}`);
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
