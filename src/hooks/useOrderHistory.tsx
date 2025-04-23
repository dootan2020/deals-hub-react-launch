
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface OrderHistoryItem {
  id: string;
  user_id: string;
  product_id: string;
  quantity: number;
  price: number;
  key_delivered: string[];
  status: string;
  created_at: string;
  product?: {
    title: string;
  };
}

export const useOrderHistory = (userId: string | undefined) => {
  const [orders, setOrders] = useState<OrderHistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrders = async () => {
      if (!userId) {
        setOrders([]);
        setIsLoading(false);
        return;
      }

      try {
        const { data, error: err } = await supabase
          .from('orders')
          .select(`
            id,
            user_id,
            product_id,
            qty,
            total_price,
            keys,
            status,
            created_at,
            products (
              title
            )
          `)
          .eq('user_id', userId)
          .order('created_at', { ascending: false });

        if (err) throw err;

        // Transform the raw data into the expected format
        const formattedOrders: OrderHistoryItem[] = data.map(order => ({
          id: order.id,
          user_id: order.user_id,
          product_id: order.product_id,
          quantity: order.qty,
          price: order.total_price,
          key_delivered: order.keys || [],
          status: order.status,
          created_at: order.created_at,
          product: order.products
        }));

        setOrders(formattedOrders);
      } catch (err) {
        console.error('Error fetching orders:', err);
        setError('Không thể tải lịch sử đơn hàng');
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrders();
  }, [userId]);

  return { orders, isLoading, error };
};
