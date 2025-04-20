
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface OrderProduct {
  title: string;
}

interface OrderItem {
  product_id: string;
}

interface Order {
  id: string;
  created_at: string;
  status: string;
  total_amount: number;
  product_title?: string;
}

export const useOrderHistory = (userId: string) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const { data: orderData, error: orderError } = await supabase
          .from('orders')
          .select('id, created_at, status, total_price')
          .eq('user_id', userId)
          .order('created_at', { ascending: false });

        if (orderError) throw orderError;

        const ordersWithProducts = await Promise.all((orderData || []).map(async (order) => {
          const { data: orderItem } = await supabase
            .from('order_items')
            .select('product_id')
            .eq('order_id', order.id)
            .single();

          if (orderItem) {
            const { data: product } = await supabase
              .from('products')
              .select('title')
              .eq('id', orderItem.product_id)
              .single();

            return {
              ...order,
              total_amount: order.total_price, // Map total_price to total_amount
              product_title: product?.title
            };
          }

          return {
            ...order,
            total_amount: order.total_price // Map total_price to total_amount
          };
        }));

        setOrders(ordersWithProducts as Order[]);
      } catch (err) {
        console.error('Error fetching orders:', err);
        setError(err instanceof Error ? err.message : 'Failed to load order history');
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrders();
  }, [userId]);

  return { orders, isLoading, error };
};
