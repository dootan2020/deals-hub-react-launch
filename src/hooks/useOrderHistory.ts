
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface Order {
  id: string;
  user_id: string;
  external_order_id: string | null;
  status: string;
  total_amount: number; // This field is required by the Order interface
  created_at: string;
  updated_at: string;
  product_title?: string;
}

export const useOrderHistory = (userId: string) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchOrders = useCallback(async () => {
    if (!userId) {
      setOrders([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Lấy đơn hàng và thông tin sản phẩm liên quan
      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .select(`
          *,
          order_items (
            id,
            product_id,
            quantity,
            price,
            products:product_id (
              title
            )
          )
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (orderError) {
        throw orderError;
      }

      // Chuyển đổi dữ liệu và thêm tiêu đề sản phẩm
      const ordersWithProductTitle = orderData?.map(order => {
        let productTitle = 'N/A';
        
        // Safely access product title
        if (order.order_items && 
            order.order_items.length > 0 && 
            order.order_items[0].products &&
            typeof order.order_items[0].products === 'object') {
          productTitle = order.order_items[0].products.title || 'N/A';
        }
        
        // Map the database fields to the Order interface
        return {
          ...order,
          total_amount: order.total_price || 0, // Map total_price to total_amount
          product_title: productTitle
        } as Order;
      }) || [];

      setOrders(ordersWithProductTitle);
    } catch (err: any) {
      console.error('Error fetching order history:', err);
      setError(err.message || 'Không thể tải lịch sử đơn hàng');
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  return {
    orders,
    isLoading,
    error,
    refetch: fetchOrders
  };
};
